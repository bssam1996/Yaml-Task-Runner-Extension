const {getStatusBarItem, updateStatusBarVisibility} = require('./helpers/status-bar.js')
const {getHoverProvider} = require('./helpers/hover-provider.js')
const {generateCodeLensesForTasks, getCodeLensProvider} = require('./helpers/code-lenses.js')
const {getShowYamlTasksCommand} = require('./helpers/show-tasks.js')
const {getRunYamlTaskCommand} = require('./helpers/run-command.js')

const vscode = require('vscode');
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	console.log('YAML Task Runner extension is now active');
	// Create output channel for command results
	const outputChannel = vscode.window.createOutputChannel('YAML Task Runner');

	const playButtonDecoration = vscode.window.createTextEditorDecorationType({});

	// Register the hover provider for YAML files
    const hoverProvider = getHoverProvider();

	const runCommand = getRunYamlTaskCommand(outputChannel);

	// Register command to show all tasks in current file
    const showTasksCommand = getShowYamlTasksCommand();

    const decorationClickHandler = getCodeLensProvider();
    const decorationProvider = vscode.window.onDidChangeActiveTextEditor(updatePlayButtons);

    vscode.workspace.onDidChangeTextDocument(event => {
        if (event.document === vscode.window.activeTextEditor?.document) {
            updatePlayButtons(vscode.window.activeTextEditor);
        }
    });

    
    function updatePlayButtons(editor) {
        if (!editor || !(editor.document.fileName.endsWith('.yml') || editor.document.fileName.endsWith('.yaml'))) {
            return;
        }
        generateCodeLensesForTasks(editor.document);
    }

    // Initial update for the active editor
    if (vscode.window.activeTextEditor) {
        updatePlayButtons(vscode.window.activeTextEditor);
    }

	context.subscriptions.push(
        hoverProvider, 
        runCommand, 
        showTasksCommand,
        statusBarItem,
        playButtonDecoration,
        decorationProvider,
        decorationClickHandler
    );
}

const statusBarItem = getStatusBarItem();
statusBarItem.show();
vscode.window.onDidChangeActiveTextEditor(updateStatusBarVisibility(statusBarItem));
updateStatusBarVisibility(statusBarItem);

function deactivate() {}

module.exports = {
    activate,
    deactivate
};