const vscode = require('vscode');
const yaml = require('js-yaml');
const { extractTasksWithName } = require('./utils.js');

function getShowYamlTasksCommand() {
    return vscode.commands.registerCommand(
            'yaml-task-runner.showYamlTasks',
            async () => {
                const editor = vscode.window.activeTextEditor;
                if (!editor || !(editor.document.fileName.endsWith('.yml') || editor.document.fileName.endsWith('.yaml'))) {
                    vscode.window.showInformationMessage('No YAML file is active');
                    return;
                }
    
                try {
                    const text = editor.document.getText();
                    const parsedYaml = yaml.load(text);
                    const tasks = extractTasksWithName(parsedYaml);
                    
                    if (tasks.length === 0) {
                        vscode.window.showInformationMessage('No runnable tasks found in this file');
                        return;
                    }
                    
                    const selectedTask = await vscode.window.showQuickPick(
                        tasks.map(task => ({
                            label: task.name,
                            description: task.command,
                            detail: 'Click to run this task'
                        })),
                        {
                            placeHolder: 'Select a task to run'
                        }
                    );
                    
                    if (selectedTask) {
                        vscode.commands.executeCommand('yaml-task-runner.runYamlTask', {commandToRun: selectedTask.description, taskName: selectedTask.label});
                    }
                } catch (error) {
                    vscode.window.showErrorMessage(`Error parsing YAML tasks: ${error}`);
                }
            }
        );
}

module.exports = {
    getShowYamlTasksCommand
};