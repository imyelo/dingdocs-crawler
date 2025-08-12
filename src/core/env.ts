import zod from 'zod'

const envSchema = zod.object({
  NAME: zod.string().default('dingdocs-crawler'),
  CRAWLER_TIMEOUT_SECONDS: zod.number().default(300),
  REQUEST_TIMEOUT_SECONDS: zod.number().default(30),
  VISIBLE: zod.boolean().default(false),
  PROXY_URLS: zod.array(zod.string()).default([]),
  MAX_CONCURRENCY: zod.number().default(10),
  MAX_REQUEST_RETRIES: zod.number().default(3),
  LOG_PATH: zod.string().default('logs'),
  HEALTHY_UUID: zod.string().default(''),
  LOGTAIL_SOURCE_TOKEN: zod.string().default(''),
  ENTRY_URL: zod.string().default(''),
  DOWNLOAD_PATH: zod.string().default('downloads'),
})

export const env = envSchema.parse({
  NAME: process.env.APP_NAME,
  CRAWLER_TIMEOUT_SECONDS: +process.env.APP_CRAWLER_TIMEOUT_SECONDS,
  REQUEST_TIMEOUT_SECONDS: +process.env.APP_REQUEST_TIMEOUT_SECONDS,
  VISIBLE: !!+process.env.APP_VISIBLE,
  PROXY_URLS: process.env.APP_PROXY_URLS.split(',').filter(Boolean),
  MAX_CONCURRENCY: +process.env.APP_MAX_CONCURRENCY,
  MAX_REQUEST_RETRIES: +process.env.APP_MAX_REQUEST_RETRIES,
  LOG_PATH: process.env.APP_LOG_PATH,
  HEALTHY_UUID: process.env.APP_HEALTHY_UUID,
  LOGTAIL_SOURCE_TOKEN: process.env.APP_LOGTAIL_SOURCE_TOKEN,
  ENTRY_URL: process.env.APP_ENTRY_URL,
  DOWNLOAD_PATH: process.env.APP_DOWNLOAD_PATH,
})
