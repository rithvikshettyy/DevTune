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

		webviewView.webview.html = this._getHtml();

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

	private _getHtml(): string {
		return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
	* { margin: 0; padding: 0; box-sizing: border-box; }
	body {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		background: transparent;
		color: #e5e5e5;
		padding: 20px 16px;
		-webkit-font-smoothing: antialiased;
	}
	.player { display: flex; flex-direction: column; align-items: center; gap: 20px; }

	/* Disc */
	.disc-container { position: relative; width: 140px; height: 140px; }
	.disc {
		width: 140px; height: 140px; border-radius: 50%;
		background: conic-gradient(from 0deg, #1a1a1a, #2a2a2a, #111, #222, #1a1a1a);
		display: flex; align-items: center; justify-content: center;
		position: relative;
		box-shadow: 0 0 0 1px rgba(255,255,255,0.04);
	}
	.disc.spinning { animation: spin 4s linear infinite; }
	@keyframes spin { 100% { transform: rotate(360deg); } }
	.disc-hole {
		width: 32px; height: 32px; border-radius: 50%;
		background: #0a0a0a; border: 2px solid rgba(255,255,255,0.06);
	}
	.disc-ring { position: absolute; border-radius: 50%; border: 1px solid rgba(255,255,255,0.03); }
	.disc-ring-1 { width: 60px; height: 60px; }
	.disc-ring-2 { width: 90px; height: 90px; }
	.disc-ring-3 { width: 120px; height: 120px; }

	/* Track Info */
	.track-info { text-align: center; width: 100%; padding: 0 4px; }
	.track-title {
		font-size: 13px; font-weight: 600; color: #ffffff;
		letter-spacing: -0.01em; white-space: nowrap;
		overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px;
	}
	.track-artist {
		font-size: 11px; font-weight: 300; color: rgba(255,255,255,0.4);
		letter-spacing: 0.02em; white-space: nowrap;
		overflow: hidden; text-overflow: ellipsis;
	}

	/* Controls */
	.controls { display: flex; align-items: center; justify-content: center; gap: 6px; }
	.ctrl-btn {
		width: 40px; height: 40px; border: none; border-radius: 50%;
		background: transparent; color: rgba(255,255,255,0.5);
		font-size: 14px; cursor: pointer;
		display: flex; align-items: center; justify-content: center;
		transition: all 0.2s ease;
	}
	.ctrl-btn:hover { color: #ffffff; background: rgba(255,255,255,0.06); }
	.ctrl-btn.primary {
		width: 48px; height: 48px;
		background: #ffffff; color: #000000; font-size: 18px;
	}
	.ctrl-btn.primary:hover { background: rgba(255,255,255,0.9); transform: scale(1.05); }

	/* Misc */
	.divider { width: 40px; height: 1px; background: rgba(255,255,255,0.06); }
	.search-btn {
		width: 100%; padding: 10px 14px;
		border: 1px solid rgba(255,255,255,0.08); border-radius: 8px;
		background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.3);
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 11px; font-weight: 400;
		cursor: pointer; text-align: left; letter-spacing: 0.02em;
		transition: all 0.2s ease;
	}
	.search-btn:hover {
		border-color: rgba(255,255,255,0.15);
		background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.5);
	}
	.brand {
		font-size: 9px; font-weight: 400; color: rgba(255,255,255,0.15);
		text-align: center; letter-spacing: 0.1em; text-transform: uppercase;
	}
	.status-dot {
		display: inline-block; width: 6px; height: 6px; border-radius: 50%;
		background: rgba(255,255,255,0.15); margin-right: 6px; vertical-align: middle;
	}
	.status-dot.active {
		background: #ffffff; box-shadow: 0 0 8px rgba(255,255,255,0.3);
		animation: pulse 2s ease-in-out infinite;
	}
	@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
</style>
</head>
<body>
	<div class="player">
		<div class="disc-container">
			<div class="disc" id="disc">
				<div class="disc-ring disc-ring-1" style="position:absolute;"></div>
				<div class="disc-ring disc-ring-2" style="position:absolute;"></div>
				<div class="disc-ring disc-ring-3" style="position:absolute;"></div>
				<div class="disc-hole"></div>
			</div>
		</div>
		<div class="track-info">
			<div class="track-title" id="trackTitle">
				<span class="status-dot"></span>Not Playing
			</div>
			<div class="track-artist" id="trackArtist">Open Spotify to start</div>
		</div>
		<div class="controls">
			<button class="ctrl-btn" onclick="send('prev')" title="Previous">&#9198;</button>
			<button class="ctrl-btn primary" onclick="send('play')" id="playBtn" title="Play/Pause">&#9654;</button>
			<button class="ctrl-btn" onclick="send('next')" title="Next">&#9197;</button>
		</div>
		<div class="divider"></div>
		<button class="search-btn" onclick="send('search')">Search for a song...</button>
		<div class="brand">DevTune</div>
	</div>
	<script>
		const vscode = acquireVsCodeApi();
		function send(cmd) { vscode.postMessage({ command: cmd }); }
		window.addEventListener('message', event => {
			const data = event.data;
			if (data.type === 'update') {
				const titleEl = document.getElementById('trackTitle');
				const artistEl = document.getElementById('trackArtist');
				const disc = document.getElementById('disc');
				if (data.title) {
					titleEl.innerHTML = '<span class="status-dot active"></span>' + data.title;
					artistEl.textContent = data.artist || 'Unknown';
					disc.classList.add('spinning');
				} else {
					titleEl.innerHTML = '<span class="status-dot"></span>Not Playing';
					artistEl.textContent = 'Open Spotify to start';
					disc.classList.remove('spinning');
				}
			}
		});
	</script>
</body>
</html>`;
	}
}

export function deactivate() {}
