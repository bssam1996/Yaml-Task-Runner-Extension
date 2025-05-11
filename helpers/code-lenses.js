const vscode = require('vscode');
const yaml = require('js-yaml');
const { extractTasksWithName } = require('./utils.js');
const { parseTaskName } = require('./utils.js');

function generateCodeLensesForTasks(document){
    try {
        const text = document.getText();
        const parsedYaml = yaml.load(text);
        const tasks = extractTasksWithName(parsedYaml);
        const codeLenses = [];

        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            const lineText = line.text.trim();

            const matchingTask = tasks.find(task => lineText.includes(task.name));
            if (matchingTask) {
                const position = new vscode.Position(i, 0);
                const command = parseTaskName(matchingTask.name)
                var codeLens = new vscode.CodeLens(new vscode.Range(position, position), {
                    title: '$(play) Run Task',
                    tooltip: `Run task: ${command}`,
                    command: 'yaml-task-runner.runYamlTask',
                    arguments: [{
                        taskName: matchingTask.name,
                        commandToRun: command
                    }]
                });
                codeLenses.push(codeLens);
            }
        }
        return codeLenses
    } catch (error) {
        console.error('Error updating play buttons:', error);
    }
}
function getCodeLensProvider(){
    return vscode.languages.registerCodeLensProvider(
            { language: 'yaml', pattern: '**/*.{yml,yaml}' },
            {
                provideCodeLenses(document) {
                    const configurations = vscode.workspace.getConfiguration('yaml-task-runner');
                    if (configurations.get('disablePlayButtons')) {
                        return [];
                    }
                    return generateCodeLensesForTasks(document);
                }
            }
        );
}

module.exports = {
    getCodeLensProvider,
    generateCodeLensesForTasks
};