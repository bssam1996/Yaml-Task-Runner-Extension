const vscode = require('vscode');

function getRunYamlTaskCommand(outputChannel) {
    return vscode.commands.registerCommand(
            'yaml-task-runner.runYamlTask',
            ({ commandToRun, taskName }) => {
                if (!commandToRun) {
                    vscode.window.showErrorMessage('No command specified');
                    return;
                }
                var terminalName = 'YAML Task Runner';
                if (taskName) {
                    terminalName = taskName;
                }
                // Create a new terminal or reuse an existing one
                const terminal = vscode.window.createTerminal(terminalName);
                terminal.show(true); // Show the terminal
                terminal.sendText(commandToRun); // Send the command to the terminal
    
                // // Show the command that's about to run
                outputChannel.appendLine(`\nRunning command: ${commandToRun}`);
            }
        );
}

module.exports = {
    getRunYamlTaskCommand
};