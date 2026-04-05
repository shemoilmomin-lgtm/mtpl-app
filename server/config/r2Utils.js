const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { r2Client, bucket } = require("./r2");

const uploadFile = async (fileBuffer, fileName, mimeType) => {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimeType,
  });
  await r2Client.send(command);
  return fileName;
};

const getPresignedUrl = async (fileName, expiresInSeconds = 3600) => {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: fileName,
  });
  return await getSignedUrl(r2Client, command, { expiresIn: expiresInSeconds });
};

module.exports = { uploadFile, getPresignedUrl };