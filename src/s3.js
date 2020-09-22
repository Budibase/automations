const AWS = require("aws-sdk");
const fs = require("fs-extra");
const constants = require("./constants");

module.exports = function () {
  let s3 = this;
  s3.sdk = null;

  s3.init = async function () {
    s3.sdk = await s3.getAuthenticatedSdk();
    console.log("Successfully authenticated with AWS")
  };

  s3.getAuthenticatedSdk = function () {
    return new Promise((resolve, reject) => {
      if (process.env.AWS_ACCESS_KEY_ID) {
        // Auth via ENV variables
        resolve(new AWS.S3({
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          region: constants.AWS_REGION
        }));
      } else {
        // Auth via config file
        AWS.config.getCredentials(function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(new AWS.S3({
              region: constants.AWS_REGION
            }));
          }
        });
      }
    })
  };

  s3.ensureBucketExists = function () {
    const params = {
      Bucket: constants.AWS_S3_BUCKET_NAME,
      CreateBucketConfiguration: {
        LocationConstraint: constants.AWS_REGION
      }
    };
    return new Promise(((resolve, reject) => {
      s3.sdk.createBucket(params, err => {
        if (err == null || err.statusCode === 409) {
          resolve();
        } else {
          reject(err);
        }
      });
    }));
  };

  s3.configureBucketPolicy = function () {
    const publicPolicy = {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Sid": "PublicReadGetObject",
          "Action": "s3:GetObject",
          "Effect": "Allow",
          "Resource": `arn:aws:s3:::${constants.AWS_S3_BUCKET_NAME}/*`,
          "Principal": "*"
        }
      ]
    };
    const params = {
      Bucket: constants.AWS_S3_BUCKET_NAME,
      Policy: JSON.stringify(publicPolicy)
    };
    return s3.sdk.putBucketPolicy(params).promise();
  }

  s3.upload = function (filePath, key) {
    const file = fs.readFileSync(filePath);
    const params = {
      Bucket: constants.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: file
    };
    console.log(`Uploading ${key}...`);
    return s3.sdk.upload(params).promise();
  };
}
