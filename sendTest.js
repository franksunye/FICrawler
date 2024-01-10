const axios = require("axios");
const fs = require('fs');
const crypto = require('crypto');

const postUrl = "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=4fbae71d-8d83-479f-a2db-7690eeb37a5c";

async function sendTextToWebhook(text) {
 try {
  // Prepare the POST data
  const postData = {
    msgtype: "text",
    text: {
      content: text
    }
  };

  // Send the POST request
  const response = await axios.post(postUrl, postData);
  console.log("Text sent to Webhook successfully", response.data);
 } catch (error) {
  console.error(`Error occurred while sending text to Webhook: ${error.message}`);
 }
}

async function sendImageToWebhook() {
 try {
  // Read the image file and convert it to base64
  const imageBuffer = fs.readFileSync('screenshot.png');
  const base64Image = imageBuffer.toString('base64');

  // Calculate md5 hash of the base64 image
  const md5Hash = crypto.createHash('md5').update(imageBuffer, 'binary').digest('hex');

  // Prepare the POST data
  const postData = {
    msgtype: "image",
    image: {
      base64: base64Image,
      md5: md5Hash
    }
  };

  // Send the POST request
  const response = await axios.post(postUrl, postData);
  console.log("Image sent to Webhook successfully", response.data);
 } catch (error) {
  console.error(`Error occurred while sending image to Webhook: ${error.message}`);
 }
}

// sendTextToWebhook("This is a test message");
sendImageToWebhook();