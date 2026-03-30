import * as vscode from 'vscode';
import { exec } from 'child_process';

let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {

	// Create and contribute a status bar item
	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.command = 'tune.status';
	context.subscriptions.push(statusBarItem);

	// Register Commands
	context.subscriptions.push(vscode.commands.registerCommand('tune.play', async () => {
		exec('tune play', (err) => {
			if (err) vscode.window.showErrorMessage(`Tune: ${err.message}`);
			updateStatusBarItem();
		});
	}));

	context.subscriptions.push(vscode.commands.registerCommand('tune.next', async () => {
		exec('tune next', (err) => {
			if (err) vscode.window.showErrorMessage(`Tune: ${err.message}`);
			updateStatusBarItem();
		});
	}));

	context.subscriptions.push(vscode.commands.registerCommand('tune.prev', async () => {
		exec('tune prev', (err) => {
			if (err) vscode.window.showErrorMessage(`Tune: ${err.message}`);
			updateStatusBarItem();
		});
	}));
    
    context.subscriptions.push(vscode.commands.registerCommand('tune.status', async () => {
        updateStatusBarItem(true);
    }));

	// Poll status
	setInterval(() => updateStatusBarItem(), 15000);

	// First load
	updateStatusBarItem();
}

function updateStatusBarItem(showPopup: boolean = false) {
    // Calling 'tune status' to get current track info
	exec('tune status', (err, stdout) => {
		if (err || !stdout) {
			statusBarItem.hide();
			return;
		}

        // Parse track/artist from stdout (very simple logic for now)
        const lines = stdout.split('\n');
        let title = '';
        let artist = '';
        
        lines.forEach(line => {
            if (line.includes('Title:')) title = line.replace('Title:', '').trim();
            if (line.includes('Artist:')) artist = line.replace('Artist:', '').trim();
        });

        if (title) {
            statusBarItem.text = `$(pulse) ${title} - ${artist}`;
            statusBarItem.show();
            if (showPopup) {
                vscode.window.showInformationMessage(`Now playing: ${title} by ${artist}`);
            }
        } else {
            // Keep it visible with a placeholder so user knows it's there
            statusBarItem.text = `$(music) Tune: Idle`;
            statusBarItem.show();
        }
	});
}

export function deactivate() {}
