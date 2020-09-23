# Zapier Automation

An automation to trigger a Zapier Zap via webhooks. Up to 5 different values can be passed as a payload to the Zap.

### Inputs

|Name|Type|Description|
|--|--|--|
|`url`|`string`|The Zapier webhook URL.|
|`value1`|`string`|A payload value to be passed to the Zap.|
|`value2`|`string`|A payload value to be passed to the Zap.|
|`value3`|`string`|A payload value to be passed to the Zap.|
|`value4`|`string`|A payload value to be passed to the Zap.|
|`value5`|`string`|A payload value to be passed to the Zap.|

### Outputs

|Name|Type|Description|
|--|--|--|
|`httpStatus`|`number`|The HTTP status code of the webhook request.|
|`zapierStatus`|`string`|The result message from Zapier.|