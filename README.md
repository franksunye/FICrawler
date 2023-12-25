# FICrawler

## 项目简介

`FICrawler` 是一个基于 [Puppeteer](https://github.com/puppeteer/puppeteer) 的 Node.js 网络爬虫演示项目。该项目专注于定时抓取金融压力指数（Financial Stress Index，FSI）,并将指数通过企业微信进行通知，以达到及时获取最新数据的目的，作为一个爬虫到通知的生产力工具的演示。

项目所有代码都是由[ChatGPT4](https://chat.openai.com/)生成，展示了GPT在解决金融数据获取场景下，通过编码解决问题方面的能力。

FSI 是一个重要的金融市场指标，通常从 [FSI 官网](https://www.financialresearch.gov/financial-stress-index/) 获取，用于衡量市场压力和经济状况。本项目抓取的是金融研究办公室金融压力指数（OFR FSI）： 几乎更新，OFR FSI提供全球金融市场压力的即时快照，综合了33个金融市场变量，如收益率差、估值措施和利率等。当压力水平高于平均水平时，该指数为正；当压力水平低于平均水平时，该指数为负。指数值是市场上观察到的每个变量的加权平均水平，相对于其历史水平。

![image](https://github.com/franksunye/FICrawler/assets/1393601/54d08ab1-f6d6-441c-b200-d661af1943d5)


## 特点

- **针对金融数据的抓取**：特别适用于抓取金融相关网站的数据，如 FSI。
- **动态内容处理**：能够处理 JavaScript 动态生成的网页内容。
- **灵活配置**：支持自定义配置，包括代理设置、请求头调整等。
- **易于扩展**：项目结构清晰，方便添加新功能。

## 安装

确保您的环境中已安装 Node.js 和 npm。通过以下步骤安装 `FICrawler`：

1. **克隆项目**：

```bash
git clone https://github.com/franksunye/FICrawler.git
cd FICrawler
npm install
```
2. **安装项目依赖**：
```bash
npm install
```

3. **安装 Puppeteer**：

Puppeteer 默认会下载最新版的 Chromium。如果您的环境中已经安装了 Chrome 或 Chromium，并且希望 Puppeteer 使用现有的安装版本，您可以在安装 Puppeteer 时跳过下载 Chromium：

```bash
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install puppeteer
```

或者，如果您希望 Puppeteer 下载并使用特定版本的 Chromium，只需正常安装 Puppeteer：

```bash
npm install puppeteer
```

Puppeteer 在安装时会自动下载 Chromium。

## 使用说明

`FICrawler` 是一个用于抓取网页数据的 Node.js 程序。要使用这个工具，您需要直接通过 Node.js 运行 `index.js` 文件。以下是详细的步骤：

1. **确保 Node.js 和 npm 已安装**：
   在开始之前，请确保您的系统上已安装了 Node.js 和 npm。您可以通过运行 `node -v` 和 `npm -v` 来检查它们的安装情况。

2. **准备项目文件**：
   如果您还没有 `FICrawler` 的代码，请先克隆或下载项目。然后，确保您的 `index.js` 文件和所有必要的项目文件都位于同一目录下。

3. **导航到项目目录**：
   在命令行中，切换到包含 `index.js` 的目录。例如：
   ```bash
   cd path/to/FICrawler
   ```

4. **运行 `index.js`**：
   在项目目录中，使用以下命令来运行 `index.js` 文件：
   ```bash
   node index.js
   ```

   这将启动 `FICrawler` 程序，程序将按照 `index.js` 中的逻辑执行。

5. **查看输出**：
   观察终端输出以查看程序的执行结果。根据 `index.js` 中的代码，您可能会在终端看到抓取的数据，或者数据可能会被保存到文件中。

### 注意事项

- 确保 `index.js` 中包含了正确的逻辑以启动爬虫过程。
- 如果 `index.js` 依赖于任何外部文件或环境变量，请确保这些依赖在执行之前已经准备妥当。
- 如果您在执行过程中遇到错误，请检查错误信息以确定问题所在，可能是环境配置、依赖问题或代码错误。

## 贡献

欢迎通过 Issues 和 Pull Requests 参与项目贡献，无论是功能建议、代码提交、问题报告还是文档改进。

## 许可证

本项目采用 [MIT 许可证](LICENSE)。

