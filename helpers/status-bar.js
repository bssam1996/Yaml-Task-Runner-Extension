const vscode = require('vscode');

function getStatusBarItem() {
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.text = "$(play) YAML Tasks";
    statusBarItem.tooltip = "View and run YAML tasks";
    statusBarItem.command = "yaml-task-runner.showYamlTasks";
    return statusBarItem;
}

function updateStatusBarVisibility(statusBarItem) {
    const editor = vscode.window.activeTextEditor;
    if (editor && (editor.document.fileName.endsWith('.yml') || editor.document.fileName.endsWith('.yaml'))) {
        statusBarItem.show();
    } else {
        statusBarItem.hide();
    }
}

module.exports = {
    getStatusBarItem,
    updateStatusBarVisibility
};