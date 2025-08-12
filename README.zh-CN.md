# DingDocs Crawler

> 一个基于 TypeScript、Puppeteer 和 Crawlee 构建的高性能钉钉文档批量下载器。

[English](./README.md) | 中文

## 功能特性

- ⚡ **高性能**: 基于 Crawlee 框架构建，实现高效的网页抓取和文件下载
- 📄 **多格式支持**: 目前支持多种钉钉文档类型：
  - 文档
  - 表格
  - 脑图
  - AI 表格
  - 上传的文件 (PDF、图片等)
  - 深层嵌套的文件夹
- 🛡️ **稳定可靠**: Stealth 模式、重试机制和全面的错误处理

## 前置要求

- Bun >= 1.2.20

### 安装 Bun

#### 使用 asdf (推荐)

如果您已安装 [asdf](https://asdf-vm.com/)：

```bash
# 安装 bun 插件
asdf plugin add bun

# 安装 bun (版本在 .tool-versions 中指定)
asdf install bun
```

#### 手动安装

访问 [bun.sh](https://bun.sh/) 获取安装说明。

## 安装

1. 克隆仓库：

```bash
git clone https://github.com/imyelo/dingdocs-crawler.git
cd dingdocs-crawler
```

2. 安装依赖：

```bash
bun install
```

## 配置

爬虫使用环境变量进行配置。在项目根目录创建 `.env.local` 文件：

```env
APP_ENTRY_URL=https://your-dingtalk-docs-url-with-folder-page
```

### 什么是文件夹页面？

示例：

![image.png](https://cdn.sa.net/2025/08/13/chWdOjxZ37ymB5e.png)

### 可配置的环境变量

| 变量名                        | 描述                                                | 默认值       | 必需 |
| ----------------------------- | --------------------------------------------------- | ------------ | ---- |
| `APP_ENTRY_URL`               | 爬虫起始 URL，应当是文件夹页面                      | -            | ✅   |
| `APP_CRAWLER_TIMEOUT_SECONDS` | 爬虫总超时时间                                      | 4500         | ❌   |
| `APP_REQUEST_TIMEOUT_SECONDS` | 单个请求超时时间                                    | 1800         | ❌   |
| `APP_VISIBLE`                 | 显示浏览器窗口                                      | true         | ❌   |
| `APP_MAX_CONCURRENCY`         | 最大并发请求数                                      | 1            | ❌   |
| `APP_MAX_REQUEST_RETRIES`     | 失败请求的重试次数                                  | 10           | ❌   |
| `APP_PROXY_URLS`              | 代理 URL 列表，用逗号分隔                           | -            | ❌   |
| `APP_LOG_PATH`                | 日志文件目录                                        | ./output.log | ❌   |
| `APP_DOWNLOAD_PATH`           | 下载目录                                            | ./downloads  | ❌   |
| `APP_LOGTAIL_SOURCE_TOKEN`    | Logtail 集成令牌 (如果您不知道这是什么，请保持为空) | -            | ❌   |
| `APP_HEALTHY_UUID`            | 健康检查 UUID (如果您不知道这是什么，请保持为空)    | -            | ❌   |

## 使用方法

### 基本使用

启动爬虫：

```bash
bun start
```

### 查看日志

实时监控日志：

```bash
bun run log
```

## 许可证

Apache-2.0 &copy; [yelo](https://github.com/imyelo), 2025 - 至今
