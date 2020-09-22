const AWS = require("aws-sdk");
const fs = require("fs-extra");
const constants = require("./constants");

/**
 * Module for interacting with AWS S3.
 */
module.exports = function () {
  let s3 = this;
  s3.sdk = null;

  /**
   * Sets up the S3 SDK for use.
   */
  s3.init = async function () {
    s3.sdk = await s3.getAuthenticatedSdk();
  };

  /**
   * Authenticates AWS keys and generates a S3 SDK service to be used.
   * AWS region is set as defined in constants.
   *
   * @returns {object} an authenticated S3 service
   */
  s3.getAuthenticatedSdk = function () {
    console.log("Authenticating with AWS...")
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

  /**
   * Ensures the target S3 bucket exists, and creates it if it does not.
   */
  s3.ensureBucketExists = function () {
    console.log("Checking S3 bucket exists...")
    const params = {
      Bucket: constants.AWS_S3_BUCKET_NAME,
      CreateBucketConfiguration: {
        LocationConstraint: constants.AWS_REGION
      }
    };
    return new Promise(((resolve, reject) => {
      s3.sdk.createBucket(params, err => {
        // Code 409 means bucket already exists, which is acceptable
        if (err == null || err.statusCode === 409) {
          resolve();
        } else {
          reject(err);
        }
      });
    }));
  };

  /**
   * Sets the S3 bucket policy to default new files to public read access.
   */
  s3.configureBucketPolicy = function () {
    console.log("Setting public access policy on S3 bucket...")
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

  /**
   * Uploads a file to the S3 bucket.
   *
   * @param filePath the path to the file to upload
   * @param key the S3 key to upload the file as (forward slashes are interpreted as directories in S3)
   */
  s3.upload = function (filePath, key) {
    console.log(`Uploading ${key}...`);
    const file = fs.readFileSync(filePath);
    const params = {
      Bucket: constants.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: file
    };
    return s3.sdk.upload(params).promise();
  };
}
