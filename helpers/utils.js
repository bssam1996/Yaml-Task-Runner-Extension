const vscode = require('vscode');

function extractTasksWithName(parsedYaml) {
        const configurations = vscode.workspace.getConfiguration('yaml-task-runner');
        const taskPath = configurations.get('taskPath', 'build.spec.tasks'); // Default path
        const identifierField = configurations.get('identifierField', 'name'); // Default identifier

        const tasks = [];
        const taskArray = getNestedProperty(parsedYaml, taskPath.split('.'));

        if (Array.isArray(taskArray)) {
            for (const task of taskArray) {
                if (task[identifierField]) {
                    tasks.push({
                        name: task[identifierField],
                        command: parseTaskName(task[identifierField])
                    });
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
        const precedingFlags = configurations.get('precedingFlags');
        if (precedingFlags) {
            var pflags = ""
            for (const pflag of precedingFlags) {
                pflags += ` -${pflag}`;
            }
            taskName = `${pflags} ${taskName}`;
        }
        const additionalFlags = configurations.get('additionalFlags');
        if (additionalFlags) {
            var flags = ""
            for (const flag of additionalFlags) {
                flags += ` -${flag}`;
            }
            taskName = `${taskName}${flags}`;
        }
        if (configurations.get('tool')) {
            taskName = configurations.get('tool') + ' ' + taskName;
        }
        const exportToFile = configurations.get('exportToFile');
        if (exportToFile) {
            taskName = `${taskName} > ${exportToFile}`;
        }
        return taskName;
}

function getNestedProperty(obj, pathArray) {
    return pathArray.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

module.exports = {
    extractTasksWithName,
    parseTaskName,
    getNestedProperty
};