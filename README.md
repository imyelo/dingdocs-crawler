# DingDocs Crawler

> A high-performance batch downloader for DingTalk documents built with TypeScript, Puppeteer, and Crawlee.

English | [中文 README](./README.zh-CN.md)

## Features

- ⚡ **High Performance**: Built with Crawlee framework for efficient web scraping and file downloading
- 📄 **Multi-format Support**: Currently handles various DingTalk document types:
  - Documents
  - Spreadsheets
  - Mind Maps
  - AI Tables
  - Uploaded files (PDF, images, etc.)
  - Nested folders
- 🛡️ **Stable & Reliable**: Stealth mode, retry mechanism, and comprehensive error handling

## Prerequisites

- Bun >= 1.2.20

### Installing Bun

#### Using asdf (Recommended)

If you have [asdf](https://asdf-vm.com/) installed:

```bash
# Install bun plugin
asdf plugin add bun

# Install bun (version specified in .tool-versions)
asdf install bun
```

#### Manual Installation

Visit [bun.sh](https://bun.sh/) for installation instructions.

## Installation

1. Clone the repository:

```bash
git clone https://github.com/imyelo/dingdocs-crawler.git
cd dingdocs-crawler
```

2. Install dependencies:

```bash
bun install
```

## Configuration

The crawler uses environment variables for configuration. Create a `.env.local` file in the project root:

```env
APP_ENTRY_URL=https://your-dingtalk-docs-url-with-folder-page
```

### What's a Folder Page?

Example:

![image.png](https://cdn.sa.net/2025/08/13/chWdOjxZ37ymB5e.png)

### Configurable Environment Variables

| Variable                      | Description                                                         | Default      | Required |
| ----------------------------- | ------------------------------------------------------------------- | ------------ | -------- |
| `APP_ENTRY_URL`               | Starting URL for crawling, should be a folder page                  | -            | ✅       |
| `APP_CRAWLER_TIMEOUT_SECONDS` | Total crawler timeout                                               | 4500         | ❌       |
| `APP_REQUEST_TIMEOUT_SECONDS` | Individual request timeout                                          | 1800         | ❌       |
| `APP_VISIBLE`                 | Show browser window                                                 | true         | ❌       |
| `APP_MAX_CONCURRENCY`         | Maximum concurrent requests                                         | 1            | ❌       |
| `APP_MAX_REQUEST_RETRIES`     | Retry attempts for failed requests                                  | 10           | ❌       |
| `APP_PROXY_URLS`              | Comma-separated proxy URLs                                          | -            | ❌       |
| `APP_LOG_PATH`                | Log file directory                                                  | ./output.log | ❌       |
| `APP_DOWNLOAD_PATH`           | Download directory                                                  | ./downloads  | ❌       |
| `APP_LOGTAIL_SOURCE_TOKEN`    | Logtail integration token (keep empty if you don't know what it is) | -            | ❌       |
| `APP_HEALTHY_UUID`            | Health check UUID (keep empty if you don't know what it is)         | -            | ❌       |

## Usage

### Basic Usage

Start the crawler:

```bash
bun start
```

### View Logs

Monitor logs in real-time:

```bash
bun run log
```

## License

Apache-2.0 &copy; [yelo](https://github.com/imyelo), 2025 - present
