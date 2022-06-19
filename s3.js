import aws from "aws-sdk";
import fs from "fs";

const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new aws.S3({
  region,
  accessKeyId,
  secretAccessKey,
});

// uploads a file to s3
export const uploadFile = async (files) =>
  files.map((file) => {
    const fileStream = fs.createReadStream(file.path);
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Body: fileStream,
      Key: file.filename,
    };

    return s3.upload(uploadParams).promise();
  });
export const deleteFiles = async (files) =>
  files.map((file) => {
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: file.split("/")[3],
    };

    return s3.deleteObject(uploadParams).promise();
  });
