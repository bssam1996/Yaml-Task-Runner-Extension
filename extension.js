const vscode = require('vscode');
const yaml = require('js-yaml');
const { exec } = require('child_process');


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	console.log('YAML Task Runner extension is now active');
	// Create output channel for command results
	const outputChannel = vscode.window.createOutputChannel('YAML Task Runner');

    
    
	// Register the hover provider for YAML files
    const hoverProvider = vscode.languages.registerHoverProvider(
        { language: 'yaml', pattern: '**/*.{yml,yaml}' },
        {
            provideHover(document, position, token) {
                const text = document.getText();
                const line = document.lineAt(position.line);
                const lineText = line.text.trim();

                try {
                    const parsedYaml = yaml.load(text);
                    const tasks = extractTasksWithName(parsedYaml);

                    // Check if the current line matches a task with a `name` field
                    const matchingTask = tasks.find(task => lineText.includes(task.name));
                    if (matchingTask) {
                        var taskName = parseTaskName(matchingTask.name);
                        
                        const commandUri = vscode.Uri.parse(
                            `command:yaml-task-runner.runYamlTask?${encodeURIComponent(JSON.stringify([taskName]))}`
                        );

                        const contents = new vscode.MarkdownString();
                        contents.appendMarkdown(`**Run Task:** \`${taskName}\`\n\n`);
                        contents.appendMarkdown(`[▶️ Run](${commandUri})`);
                        contents.isTrusted = true;

                        return new vscode.Hover(contents);
                    }
                } catch (error) {
                    console.error('Error parsing YAML:', error);
                }

                return null;
            }
        }
    );

	const runCommand = vscode.commands.registerCommand(
        'yaml-task-runner.runYamlTask',
        (commandToRun) => {
            if (!commandToRun) {
                vscode.window.showErrorMessage('No command specified');
                return;
            }
            
            // Show the command that's about to run
            outputChannel.appendLine(`\n--- Running command: ${commandToRun} ---`);
            outputChannel.show(true);
            
            // Execute the command
            const process = exec(commandToRun);
            
            // Stream output in real-time
            process.stdout.on('data', (data) => {
                outputChannel.append(data.toString());
            });
            
            process.stderr.on('data', (data) => {
                outputChannel.append(data.toString());
            });
            
            process.on('close', (code) => {
                if (code === 0) {
                    outputChannel.appendLine(`\n--- Command completed successfully ---`);
                } else {
                    outputChannel.appendLine(`\n--- Command failed with exit code ${code} ---`);
                }
            });
            
            process.on('error', (error) => {
                outputChannel.appendLine(`\nError: ${error.message}`);
                vscode.window.showErrorMessage(`Failed to execute command: ${error.message}`);
            });
        }
    );
	
	// Register a status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.text = "$(play) YAML Tasks";
    statusBarItem.tooltip = "View and run YAML tasks";
    statusBarItem.command = "yaml-task-runner.showYamlTasks";
    statusBarItem.show();

	// Register command to show all tasks in current file
    const showTasksCommand = vscode.commands.registerCommand(
        'yaml-task-runner.showYamlTasks',
        async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor || !editor.document.fileName.endsWith('.yml')) {
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
                    vscode.commands.executeCommand('yaml-task-runner.runYamlTask', selectedTask.description);
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Error parsing YAML tasks: ${error}`);
            }
        }
    );

    function extractTasksWithName(parsedYaml) {
        const tasks = [];
        if (parsedYaml && parsedYaml.build && parsedYaml.build.spec && Array.isArray(parsedYaml.build.spec.tasks)) {
            for (const task of parsedYaml.build.spec.tasks) {
                if (task.name) {
                    tasks.push({ name: task.name, command: parseTaskName(task.name) });
                }
            }
        }
        return tasks;
    }

    function parseTaskName(taskName) {
        const configurations = vscode.workspace.getConfiguration('yaml-task-runner');
        if (configurations.get('mainFlag')) {
            taskName = `-${configurations.get('mainFlag')}="${taskName}"`;
        }
        if (configurations.get('tool')) {
            taskName = configurations.get('tool') + ' ' + taskName;
        }
        const additionalFlags = configurations.get('additionalFlags');
        if (additionalFlags) {
            var flags = ""
            for (const flag of additionalFlags) {
                flags += ` -${flag}`;
            }
            taskName = `${taskName}${flags}`;
        }
        return taskName;
    }

	context.subscriptions.push(hoverProvider, 
        runCommand, 
        showTasksCommand,
        statusBarItem);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};