# Yaml Task Runner

Run Tasks easily when hovering your mouse on your task.

## Features

* Hovering over tasks to show run command

* List of available tasks by running `Show Yaml Tasks`

## Requirements

It will run automatically upon installing when opening (yaml,yml) files.

Currently, yaml file needs to follow specific scheme. Task should be in `build.spec.tasks.name`

`Tasks` is an array.

## Extension Settings

The following settings can be configured:-

This extension contributes the following settings:

* `yaml-task-runner.tool`: Tool to be used when running the task. eg. 'docker', 'docker-compose', 'kubectl', 'helm', 'kustomize', 'terraform', etc.
* `yaml-task-runner.mainFlag`: Add the task name in a flag. Leave empty if you want to run the task directly. eg. docker run -name '<task-name>'
* `yaml-task-runner.additionalFlags`: Additional Flags to be added. eg. docker run -name '<task-name>' -rm -interactive.

## Known Issues

-

## Release Notes


### 0.0.1

Initial release of Yaml Task Runner

---
