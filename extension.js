const vscode = require("vscode");
let wss = null;
let isEnabled = false;
let connections = [];

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
    const { Server } = require("ws");
    const { v4 } = require("uuid");

    const files = await vscode.workspace.findFiles("**/manifest.json", "**/node_modules/**", 1);
    if (files.length === 0) {
        return;
    }

    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = "$(debug-start) AutoReload";
    statusBarItem.tooltip = "Press to start the websocket server";
    statusBarItem.command = "extension.toggleAutoReload";
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    const toggleCommand = vscode.commands.registerCommand("extension.toggleAutoReload", async () => {
        isEnabled = !isEnabled;
        if (isEnabled) {
            statusBarItem.text = "$(sync) AutoReload";
            statusBarItem.tooltip = "Run /wsserver localhost:8080 to connect";
            wss = new Server({ port: 8080 });
            wss.on("connection", (ws) => {
                connections.push(ws);

                let disposable = vscode.workspace.onDidSaveTextDocument(() => {
                    const delay = vscode.workspace.getConfiguration().get("extension.autoReloadDelay", 0);
                    setTimeout(() => {
                        sendCommand("/reload", ws, v4());
                    }, delay);
                });

                context.subscriptions.push(disposable);

                ws.on("close", () => {
                    disposable.dispose();
                    const index = connections.indexOf(ws);
                    if (index > -1) {
                        connections.splice(index, 1);
                    }
                });
            });
            await vscode.env.clipboard.writeText("/wsserver localhost:8080");
            sendTimedNotifaction("wsserver connect command copied to clipboard", 3000);
        } else {
            statusBarItem.text = "$(debug-start) AutoReload";
            statusBarItem.tooltip = "Press to start the websocket server";
            if (wss) {
                await new Promise((resolve) => {
                    connections.forEach((conn) => conn.close());
                    connections = [];
                    wss.close(resolve);
                    wss = null;
                });
            }
        }
    });
    context.subscriptions.push(toggleCommand);
}

function deactivate() {
    if (wss) {
        connections.forEach((conn) => conn.close());
        connections = [];
        wss.close();
    }
}

function sendCommand(command, ws, uuid) {
    const msg = {
        header: {
            version: 1,
            requestId: uuid,
            messagePurpose: "commandRequest",
            messageType: "commandRequest",
        },
        body: {
            version: 1,
            commandLine: command,
        },
    };
    ws.send(JSON.stringify(msg));
}

function sendTimedNotifaction(message, time) {
    vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: message,
            cancellable: false,
        },
        () => {
            return new Promise((resolve) => {
                setTimeout(resolve, time);
            });
        }
    );
}

module.exports = {
    activate,
    deactivate,
};
