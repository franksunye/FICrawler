const { chromium } = require("playwright");
const axios = require("axios");
const winston = require("winston");
const fs = require("fs");
const crypto = require("crypto");

const phoneNumber = "18600372156";
const postUrl =
  "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=4fbae71d-8d83-479f-a2db-7690eeb37a5c";
const gotoUrl = "https://www.financialresearch.gov/financial-stress-index/";

// 配置Winston日志记录器
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(
      (info) =>
        `${info.timestamp} [${info.level.toUpperCase()}] - ${info.message}`
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "log/combined.log" }),
  ],
});

async function sendToWebhook(currentIndex, formattedDate) {
  const postData = {
    msgtype: "text",
    text: {
      content: `美国今日FSI指数 (Financial Stress Index) 是：${currentIndex}，指数发布时间 ${formattedDate}。FSI是一种衡量金融市场压力的指标。这个指数通常由美国各大银行或金融机构编制, 用于反映金融市场的整体状况, 包括流动性、信用风险和市场波动性等方面。`,
      mentioned_mobile_list: [phoneNumber],
    },
  };

  try {
    // Send the POST request
    const response = await axios.post(postUrl, postData);
    logger.info("sendToWebhook: Response status: " + response.status);
    logger.info("sendToWebhook: Response status text: " + response.statusText);
    logger.info("sendToWebhook: Response headers: " + JSON.stringify(response.headers));
    logger.info("sendToWebhook: Response data: " + JSON.stringify(response.data));
  } catch (error) {
    logger.error(`sendToWebhook: 发送到Webhook时发生错误: ${error.message}`);
  }
}

async function sendImageToWebhook() {
  try {
    // Read the image file and convert it to base64
    const imageBuffer = fs.readFileSync("screenshot.png");
    const base64Image = imageBuffer.toString("base64");

    // Calculate md5 hash of the base64 image
    const md5Hash = crypto
      .createHash("md5")
      .update(imageBuffer, "binary")
      .digest("hex");

    // Prepare the POST data
    const postData = {
      msgtype: "image",
      image: {
        base64: base64Image,
        md5: md5Hash,
      },
    };

    // Send the POST request
    const response = await axios.post(postUrl, postData);
    logger.info(
      "sendImageToWebhook: Image sent to Webhook successfully" + JSON.stringify(response.data)
    );
  } catch (error) {
    logger.error(
      `sendImageToWebhook: Error occurred while sending image to Webhook: ${error.message}`
    );
  }
}

async function scrapeData() {
  let browser; // Move the browser variable declaration to the top

  try {
    logger.info("scrapeData: 启动浏览器");
    const startBrowserTime = new Date();

    browser = await chromium.launch({ headless: false });
    logger.info(`scrapeData: 浏览器启动，耗时: ${new Date() - startBrowserTime}ms`);

    const page = await browser.newPage();

    logger.info("scrapeData: 导航到网页");
    const startNavigationTime = new Date();

    let maxRetries = 5;
    let timeout = 60000; // Start with a 30-second timeout
    let success = false;

    for (let i = 0; i < maxRetries && !success; i++) {
      try {
        await page.goto(gotoUrl, { waitUntil: "load", timeout: timeout });
        success = true; // If page.goto succeeds, set success to true
        logger.info(`scrapeData: 导航完成，耗时: ${new Date() - startNavigationTime}ms`);

        // Simulate Page Down key press
        await page.keyboard.press("PageDown");
        await new Promise((resolve) => setTimeout(resolve, 20000));

      } catch (error) {
        logger.error(
          `scrapeData: Attempt ${i + 1}: page.goto failed with timeout ${timeout}ms`
        );
        timeout += 30000; // Increase timeout by 30 seconds for the next attempt
        if (i < maxRetries - 1) {
          logger.info(`scrapeData: Retrying navigation...`);
        }
      }
    }

    if (!success) {
      throw new Error("scrapeData: page.goto failed after all retries");
    }

    const selectorIndex = ".latest-daily-observation .header span";
    const selectorDate = ".latest-daily-observation .stat";

    await page.waitForSelector(selectorIndex);
    await page.waitForSelector(selectorDate);

    const currentIndex = await page.textContent(selectorIndex);
    const dateInfo = await page.textContent(selectorDate);

    const formattedDate = formatDate(dateInfo);

    logger.info(
      `scrapeData: Current Index: ${currentIndex.trim()}, Date Info: ${dateInfo}, Formatted Date: ${formattedDate}`
    );

    // Take a screenshot
    const screenshotPath = "screenshot.png";
    let topLeftX = 150;
    let topLeftY = 0;
    let width = 1000;
    let height = 440;

    await page.screenshot({
      path: "screenshot.png",
      clip: { x: topLeftX, y: topLeftY, width: width, height: height },
    });

    // Log the screenshot path
    logger.info(`scrapeData: Screenshot saved at: ${screenshotPath}`);

    await browser.close();
    logger.info("scrapeData: 浏览器已关闭");

    await sendToWebhook(currentIndex.trim(), formattedDate);
    // Call the function to send the image
    sendImageToWebhook().catch((err) => logger.error(err));

    return { currentIndex: currentIndex.trim(), dateInfo, formattedDate };
  } catch (error) {
    logger.error(`scrapeData: 抓取数据时发生错误: ${error.message}`);
    if (browser) {
      await browser.close();
      logger.info("scrapeData: 浏览器已关闭");
    }
    throw error; // Throw the error to be caught by the caller
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

async function main() {
  const maxRetries = 5; // Set the maximum number of retries
  let retries = 0;
  let success = false;

  while (retries < maxRetries && !success) {
    try {
      logger.info("main: 开始执行任务");
      const data = await scrapeData();
      if (data.error) {
        logger.error("main: 抓取过程中发生错误", data.error);
      } else {
        logger.info("main: 抓取数据完成", JSON.stringify(data));
        success = true; // Mark as success to break the loop
      }
    } catch (err) {
      logger.error(err);
      retries++;
      if (retries < maxRetries) {
        logger.info(`main: 等待5分钟后重试... (${retries}/${maxRetries})`);
        // await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000)); // Wait for 5 minutes
        await new Promise(resolve => setTimeout(resolve, 1 * 1 * 1000)); // Wait for 5 minutes
      }
    }
  }

  if (!success) {
    logger.error("main: 达到最大重试次数，任务失败");
    process.exit(1); // Exit the process with an error code
  }

  logger.info("main: 任务执行结束");
}

main().catch((err) => logger.error(err));