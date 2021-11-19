# Discord Automation

Sends a message to a Discord server.

### Inputs

|Name|Type|Description|
|--|--|--|
|`url`|`string`|The Discord webhook URL.|
|`username`|`string`|The optional override name of the bot sending the message.|
|`avatar_url`|`string`|The optional avatar URL of the bot sending the message.|
|`content`|`string`|The message. Markdown is supported.|

### Outputs

|Name|Type|Description|
|--|--|--|
|`httpStatus`|`number`|The HTTP status code of the webhook request.|
