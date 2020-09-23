# Integromat Automation

An automation to trigger an Integromat scenario via a configured webhook. Please read the information provided 
by Integromat [here](https://support.integromat.com/hc/en-us/articles/360006249313-Webhooks) about their 
webhook support. It is also important to note that Integromat is capable of performing a webhook response, passing
information back to Budibase which can be used there-after.

### Inputs

|Name|Type|Description|
|--|--|--|
|`url`|`string`|The Integromat webhook URL.|
|`value1`|`string`|A payload value to be passed to the scenario.|
|`value2`|`string`|A payload value to be passed to the scenario.|
|`value3`|`string`|A payload value to be passed to the scenario.|
|`value4`|`string`|A payload value to be passed to the scenario.|
|`value5`|`string`|A payload value to be passed to the scenario.|

### Outputs

|Name|Type|Description|
|--|--|--|
|`success`|`boolean`|Whether the call was successful or not (can be used with filter).|
|`response`|`string`|The webhook response, this may contain data if a webhook response was provided in the scenario. This data can be accessed in Budibase in the context like `{{STEP.response.data}}`.|