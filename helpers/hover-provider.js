const vscode = require('vscode');
const yaml = require('js-yaml');
const { extractTasksWithName } = require('./utils.js');
const { parseTaskName } = require('./utils.js');

function getHoverProvider(){
    return vscode.languages.registerHoverProvider(
            { language: 'yaml', pattern: '**/*.{yml,yaml}' },
            {
                provideHover(document, position, token) {
                    const configurations = vscode.workspace.getConfiguration('yaml-task-runner');
                    if (configurations.get('disableHover')) {
                        return null;
                    }
                    const text = document.getText();
                    const line = document.lineAt(position.line);
                    const lineText = line.text.trim();
    
                    try {
                        const parsedYaml = yaml.load(text);
                        const tasks = extractTasksWithName(parsedYaml);
    
                        // Check if the current line matches a task with a `name` field
                        const matchingTask = tasks.find(task => lineText.includes(task.name));
                        if (matchingTask) {
                            var fullCommand = parseTaskName(matchingTask.name);
                            const parsedComponents = {
                                taskName: matchingTask.name,
                                commandToRun: fullCommand
                            }
                            
                            const commandUri = vscode.Uri.parse(
                                `command:yaml-task-runner.runYamlTask?${encodeURIComponent(JSON.stringify([parsedComponents]))}`
                            );
    
                            const contents = new vscode.MarkdownString();
                            contents.appendMarkdown(`**Run Task:** \`${fullCommand}\`\n\n`);
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
        )
}

module.exports = {
    getHoverProvider
};