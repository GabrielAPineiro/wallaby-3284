# POEditor export executor

This executor will export the translations for each language from the specified POEditor `project` to the `outputPath`.

## Usage

```
yarn nx run <project>:poeditor-export
```

```
Executor:  @exclaimer/workspace-plugin:poeditor-export

Options:
    --outputPath    POEditor translations output path [string]
    --project       POEditor project name or id       [string] OR [number]
    --apiKey        POEditor API Key
```

## Config

```json
{
	"projectType": "library",
	"targets": {
		"poeditor-export": {
			"executor": "@exclaimer/workspace-plugin:poeditor-export",
			"options": {
				"outputPath": "libs/<project>/i18n/src/translations",
				"project": "<POEDITOR_PROJECT_NAME>",
				"apiKey": "<POEDITOR_API_KEY>"
			}
		}
	}
}
```
