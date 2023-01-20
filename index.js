const AWS = require("aws-sdk");
const Sharp = require("sharp");

// This code works with NODEJS 14 Lambda (not nodejs18)

exports.handler = async (event) => {
  // Get the object from the event and show its content type
  console.log("What is the event", JSON.stringify(event));
  const object = event.Records[0].s3.object;

  // Get the object's key (file name) and download the file from S3
  const key = object.key;
  const s3 = new AWS.S3();
  const response = await s3
    .getObject({
      Bucket: process.env.UPLOAD_BUCKET,
      Key: key,
    })
    .promise();
  console.log(`Object content type: ${response.contentType}`);
  // Resize the image and save it to a buffer
  const image = Sharp(response.Body);
  const resizedImage = await image.resize({ width: 640 }).toBuffer();

  // Upload the resized image to S3
  await s3
    .putObject({
      Body: resizedImage,
      Bucket: process.env.DOWNLOAD_BUCKET,
      ContentType: response.contentType,
      Key: `${key}`,
    })
    .promise();

  console.log(`Resized image uploaded to S3: resized-${key}`);

  return `Successfully resized ${key}`;
};

/**
 * To use this function, you will need to set up an S3 trigger in the AWS Lambda console,
 * and specify the name of the bucket in the BUCKET environment variable. When an image is uploaded to the bucket,
 * the function will be triggered, and it will download the image, resize it, and then upload the resized image to
 * the same bucket with a different file name.
 * Note that this is just one way to implement image resizing in a Lambda function.
 * There are many other libraries and approaches that you can use,
 * depending on your specific needs and requirements.
 **/
