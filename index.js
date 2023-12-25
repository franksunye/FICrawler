const axios = require('axios');
const puppeteer = require('puppeteer');
const winston = require('winston');

const phoneNumber = "你的手机号";
const postUrl = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=KEY';
const gotoUrl = 'https://www.financialresearch.gov/financial-stress-index/';


// 配置Winston日志记录器
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.printf(info => `${info.timestamp} [${info.level.toUpperCase()}] - ${info.message}`)
    ),
    transports: [
        new winston.transports.File({ filename: 'log/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'log/combined.log' })
    ]
});

// 如果不在生产环境，同时在控制台输出日志
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

async function sendToWebhook(currentIndex, formattedDate) {
    const postData = {
        msgtype: "text",
        text: {
            content: `美国今日FSI指数 (Financial Stress Index) 是：${currentIndex}，指数发布时间 ${formattedDate}。FSI是一种衡量金融市场压力的指标。这个指数通常由美国各大银行或金融机构编制, 用于反映金融市场的整体状况, 包括流动性、信用风险和市场波动性等方面。`,
            mentioned_mobile_list: [phoneNumber]
        }
    };

    try {
        const response = await axios.post(postUrl, postData);
        logger.info('数据发送到Webhook成功', response.data);
    } catch (error) {
        logger.error(`发送到Webhook时发生错误: ${error.message}`);
    }
}

async function scrapeData() {
    try {
        logger.info('启动浏览器');
        const startBrowserTime = new Date();
        const browser = await puppeteer.launch({
            executablePath: 'C:\\chrome-win\\chrome.exe',
            headless: "new"
        });
        logger.info(`浏览器启动，耗时: ${new Date() - startBrowserTime}ms`);

        logger.info('打开新页面');
        const startPageTime = new Date();
        const page = await browser.newPage();
        logger.info(`新页面打开，耗时: ${new Date() - startPageTime}ms`);

        logger.info('导航到网页');
        const startNavigationTime = new Date();
        await page.goto(gotoUrl, { waitUntil: 'networkidle2', timeout: 60000 });
        logger.info(`导航完成，耗时: ${new Date() - startNavigationTime}ms`);

        const selectorIndex = '.latest-daily-observation .header span';
        const selectorDate = '.latest-daily-observation .stat';

        await page.waitForSelector(selectorIndex, { timeout: 10000 });
        await page.waitForSelector(selectorDate, { timeout: 10000 });

        const currentIndex = await page.evaluate((selector) => {
            return document.querySelector(selector).innerText;
        }, selectorIndex);

        const dateInfo = await page.evaluate((selector) => {
            return document.querySelector(selector).innerText;
        }, selectorDate);

        const formattedDate = formatDate(dateInfo);

        logger.info(`当前指数: ${currentIndex}`);
        logger.info(`日期信息: ${dateInfo}`);
        logger.info(`格式化日期: ${formattedDate}`);

        await browser.close();
        logger.info('浏览器已关闭');

        await sendToWebhook(currentIndex, formattedDate);

        return { currentIndex, dateInfo, formattedDate };
    } catch (error) {
        logger.error(`发生错误: ${error.message}`);
        return { error: error.message };
    }
}

function formatDate(dateString) {
    if (!dateString) return '';

    // 将日期字符串分解为其组成部分
    const parts = dateString.match(/(\w+)\. (\w+)\. (\d+), (\d+)/);
    if (!parts || parts.length < 5) return '';

    // 提取月份、日期和年份
    const [, , month, day, year] = parts;

    // 月份映射
    const monthMapping = {
        Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
        Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
    };

    // 星期映射
    const weekdayMapping = {
        Sun: 'Sunday', Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday',
        Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday'
    };

    // 构建YYYY-MM-DD格式的日期字符串
    const formattedDate = `${year}-${monthMapping[month]}-${day.padStart(2, '0')}`;
    // 添加星期信息
    const formattedWeekday = weekdayMapping[parts[1].slice(0, 3)];

    return `${formattedWeekday}, ${formattedDate}`;
}

const interval = 30 * 60 * 1000; // 30分钟，以毫秒为单位

setInterval(() => {
    scrapeData().then(data => {
        if (data.error) {
            logger.error('抓取过程中发生错误', data.error);
        } else {
            logger.info('抓取数据完成', data);
        }
    });
}, interval);
