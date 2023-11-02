# POEditor import executor

This executor will remove and re-upload all of the translations for each language from the `outputPath` to the specified POEditor `project`.

## Usage

```
yarn nx run <project>:poeditor-import
```

```
Executor:  @exclaimer/workspace-plugin:poeditor-import

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
		"poeditor-import": {
			"executor": "@exclaimer/workspace-plugin:poeditor-import",
			"options": {
				"outputPath": "libs/<project>/i18n/src/translations",
				"project": "<POEDITOR_PROJECT_NAME>",
				"apiKey": "<POEDITOR_API_KEY>"
			}
		}
	}
}
```
