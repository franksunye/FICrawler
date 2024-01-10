const { chromium } = require("playwright");

const gotoUrl = "https://www.financialresearch.gov/financial-stress-index/";

async function scrapeData() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(gotoUrl, { waitUntil: "load" });

  const selectorIndex = ".latest-daily-observation .header span";
  const selectorDate = ".latest-daily-observation .stat";

  await page.waitForSelector(selectorIndex);
  await page.waitForSelector(selectorDate);

  const currentIndex = await page.textContent(selectorIndex);
  const dateInfo = await page.textContent(selectorDate);

  await browser.close();

  return { currentIndex: currentIndex.trim(), dateInfo };
}

(async () => {
  try {
    const data = await scrapeData();
    console.log("Scraped data:", data);
  } catch (error) {
    console.error("Error during scraping:", error);
  }
})();