import dotenv from 'dotenv-flow'

dotenv.config()

export const NAME = process.env.APP_NAME
export const CRAWLER_TIMEOUT_SECONDS = +process.env.APP_CRAWLER_TIMEOUT_SECONDS
export const REQUEST_TIMEOUT_SECONDS = +process.env.APP_REQUEST_TIMEOUT_SECONDS
export const VISIBLE = !!+process.env.APP_VISIBLE
export const PROXY_URLS = process.env.APP_PROXY_URLS.split(',').filter(Boolean)
export const MAX_CONCURRENCY = +process.env.APP_MAX_CONCURRENCY
export const LOG_PATH = process.env.APP_LOG_PATH
export const HEALTHY_UUID = process.env.APP_HEALTHY_UUID
export const LOGTAIL_SOURCE_TOKEN = process.env.APP_LOGTAIL_SOURCE_TOKEN
export const ENTRY_URL = process.env.APP_ENTRY_URL
export const DOWNLOAD_PATH = process.env.APP_DOWNLOAD_PATH
