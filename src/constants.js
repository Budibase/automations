module.exports = {
  AWS_REGION: "eu-west-1",
  AWS_S3_BUCKET_NAME: process.env.CI ?
    "budibase-automations" :
    `budibase-automations-${Math.random().toString(32).substr(2)}`
}
