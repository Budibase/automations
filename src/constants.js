module.exports = {
  AWS_REGION: "eu-west-1",
  AWS_S3_BUCKET_NAME: process.env.CI
    ? process.env.AWS_S3_BUCKET
    : `budibase-automations-${Math.random().toString(32).substr(2)}`,
}
