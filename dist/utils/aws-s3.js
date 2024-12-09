const AWS = require('aws-sdk');
require('dotenv').config();
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});
const s3 = new AWS.S3();

/**
 * Uploads a file to AWS S3 and returns the file URL
 * @param {Buffer} fileBuffer - The buffer containing the file data.
 * @param {string} fileName - The name of the file to upload.
 * @returns {string} The file URL from S3.
 */

const uploadToS3 = (fileBuffer, fileName, mimetype) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `products/${Date.now()}_${fileName}`,
    Body: fileBuffer,
    ContentType: mimetype,
    ACL: 'public-read'
  };
  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.Location);
      }
    });
  });
};
module.exports = {
  uploadToS3
};