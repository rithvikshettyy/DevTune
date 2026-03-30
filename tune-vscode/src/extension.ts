import * as vscode from 'vscode';
import { exec } from 'child_process';

let statusBarItem: vscode.StatusBarItem;
let currentTitle = '';
let currentArtist = '';
let isPlaying = false;

export function activate(context: vscode.ExtensionContext) {

	// Status Bar
	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.command = 'tune.status';
	context.subscriptions.push(statusBarItem);

	// Sidebar Webview
	const provider = new TunePlayerViewProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider('tune.playerView', provider)
	);

	// Commands
	context.subscriptions.push(vscode.commands.registerCommand('tune.play', async () => {
		exec('tune pause', (err) => {
			if (err) vscode.window.showErrorMessage(`Tune: ${err.message}`);
			setTimeout(() => { updateStatus(provider); }, 1000);
		});
	}));

	context.subscriptions.push(vscode.commands.registerCommand('tune.next', async () => {
		exec('tune next', (err) => {
			if (err) vscode.window.showErrorMessage(`Tune: ${err.message}`);
			setTimeout(() => { updateStatus(provider); }, 1000);
		});
	}));

	context.subscriptions.push(vscode.commands.registerCommand('tune.prev', async () => {
		exec('tune prev', (err) => {
			if (err) vscode.window.showErrorMessage(`Tune: ${err.message}`);
			setTimeout(() => { updateStatus(provider); }, 1000);
		});
	}));

	context.subscriptions.push(vscode.commands.registerCommand('tune.status', async () => {
		updateStatus(provider, true);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('tune.search', async () => {
		const query = await vscode.window.showInputBox({
			prompt: 'Search for a song',
			placeHolder: 'e.g. Blinding Lights'
		});
		if (query) {
			exec(`tune play "${query}"`, (err, stdout) => {
				if (err) {
					vscode.window.showErrorMessage(`Tune: ${err.message}`);
				} else {
					vscode.window.showInformationMessage(stdout.trim());
				}
				setTimeout(() => { updateStatus(provider); }, 2000);
			});
		}
	}));

	// Poll every 10 seconds
	setInterval(() => updateStatus(provider), 10000);

	// First load
	updateStatus(provider);
}

function updateStatus(provider: TunePlayerViewProvider, showPopup: boolean = false) {
	exec('tune status', (err, stdout) => {
		if (err || !stdout) {
			currentTitle = '';
			currentArtist = '';
			isPlaying = false;
			statusBarItem.text = `$(music) Tune: Idle`;
			statusBarItem.show();
			provider.updatePlayer('', '', false);
			return;
		}

		const lines = stdout.split('\n');
		let title = '';
		let artist = '';

		lines.forEach(line => {
			if (line.includes('Title:')) title = line.replace('Title:', '').trim();
			if (line.includes('Artist:')) artist = line.replace('Artist:', '').trim();
		});

		currentTitle = title;
		currentArtist = artist;
		isPlaying = !!title;

		if (title) {
			statusBarItem.text = `$(pulse) ${title} - ${artist}`;
			statusBarItem.show();
			if (showPopup) {
				vscode.window.showInformationMessage(`Now playing: ${title} by ${artist}`);
			}
		} else {
			statusBarItem.text = `$(music) Tune: Idle`;
			statusBarItem.show();
		}

		provider.updatePlayer(title, artist, isPlaying);
	});
}

class TunePlayerViewProvider implements vscode.WebviewViewProvider {
	private _view?: vscode.WebviewView;

	constructor(private readonly _extensionUri: vscode.Uri) {}

	public resolveWebviewView(webviewView: vscode.WebviewView) {
		this._view = webviewView;

		webviewView.webview.options = {
			enableScripts: true
		};

		webviewView.webview.html = this._getHtml('', '', false);

		// Handle messages from webview
		webviewView.webview.onDidReceiveMessage(data => {
			switch (data.command) {
				case 'play':
					vscode.commands.executeCommand('tune.play');
					break;
				case 'next':
					vscode.commands.executeCommand('tune.next');
					break;
				case 'prev':
					vscode.commands.executeCommand('tune.prev');
					break;
				case 'search':
					vscode.commands.executeCommand('tune.search');
					break;
			}
		});
	}

	public updatePlayer(title: string, artist: string, playing: boolean) {
		if (this._view) {
			this._view.webview.postMessage({ type: 'update', title, artist, playing });
		}
	}

	private _getHtml(title: string, artist: string, playing: boolean): string {
		return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
	* { margin: 0; padding: 0; box-sizing: border-box; }
	body {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		color: var(--vscode-foreground);
		background: transparent;
		padding: 16px 12px;
	}

	.player {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
	}

	.album-art {
		width: 120px;
		height: 120px;
		border-radius: 16px;
		background: linear-gradient(135deg, #1db954, #191414);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 48px;
		box-shadow: 0 8px 32px rgba(29, 185, 84, 0.3);
		animation: pulse-glow 3s ease-in-out infinite;
	}

	@keyframes pulse-glow {
		0%, 100% { box-shadow: 0 8px 32px rgba(29, 185, 84, 0.2); }
		50% { box-shadow: 0 8px 40px rgba(29, 185, 84, 0.5); }
	}

	.track-info {
		text-align: center;
		width: 100%;
	}

	.track-title {
		font-size: 14px;
		font-weight: 700;
		color: var(--vscode-foreground);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		margin-bottom: 4px;
	}

	.track-artist {
		font-size: 12px;
		color: var(--vscode-descriptionForeground);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.idle-msg {
		font-size: 12px;
		color: var(--vscode-descriptionForeground);
		text-align: center;
	}

	.controls {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}

	.ctrl-btn {
		width: 36px;
		height: 36px;
		border: none;
		border-radius: 50%;
		background: var(--vscode-button-secondaryBackground);
		color: var(--vscode-button-secondaryForeground);
		font-size: 16px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s ease;
	}

	.ctrl-btn:hover {
		background: var(--vscode-button-secondaryHoverBackground);
		transform: scale(1.1);
	}

	.ctrl-btn.primary {
		width: 44px;
		height: 44px;
		background: #1db954;
		color: #fff;
		font-size: 20px;
	}

	.ctrl-btn.primary:hover {
		background: #1ed760;
		transform: scale(1.15);
	}

	.search-btn {
		width: 100%;
		padding: 8px 12px;
		border: 1px solid var(--vscode-input-border);
		border-radius: 6px;
		background: var(--vscode-input-background);
		color: var(--vscode-input-placeholderForeground);
		font-size: 12px;
		cursor: pointer;
		text-align: left;
		transition: border-color 0.15s ease;
	}

	.search-btn:hover {
		border-color: #1db954;
	}

	.divider {
		width: 100%;
		height: 1px;
		background: var(--vscode-widget-border);
		margin: 4px 0;
	}

	.brand {
		font-size: 10px;
		color: var(--vscode-descriptionForeground);
		text-align: center;
		opacity: 0.6;
	}
</style>
</head>
<body>
	<div class="player">
		<div class="album-art" id="albumArt">🎵</div>

		<div class="track-info">
			<div class="track-title" id="trackTitle">Not Playing</div>
			<div class="track-artist" id="trackArtist">Open Spotify to start</div>
		</div>

		<div class="controls">
			<button class="ctrl-btn" onclick="send('prev')" title="Previous">⏮</button>
			<button class="ctrl-btn primary" onclick="send('play')" id="playBtn" title="Play/Pause">⏯</button>
			<button class="ctrl-btn" onclick="send('next')" title="Next">⏭</button>
		</div>

		<div class="divider"></div>

		<button class="search-btn" onclick="send('search')">🔍 Search for a song...</button>

		<div class="brand">Powered by Tune CLI</div>
	</div>

	<script>
		const vscode = acquireVsCodeApi();

		function send(cmd) {
			vscode.postMessage({ command: cmd });
		}

		window.addEventListener('message', event => {
			const data = event.data;
			if (data.type === 'update') {
				const titleEl = document.getElementById('trackTitle');
				const artistEl = document.getElementById('trackArtist');
				const artEl = document.getElementById('albumArt');

				if (data.title) {
					titleEl.textContent = data.title;
					artistEl.textContent = data.artist || 'Unknown Artist';
					artEl.textContent = '🎶';
				} else {
					titleEl.textContent = 'Not Playing';
					artistEl.textContent = 'Open Spotify to start';
					artEl.textContent = '🎵';
				}
			}
		});
	</script>
</body>
</html>`;
	}
}

export function deactivate() {}
