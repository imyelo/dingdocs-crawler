import pTimeout from 'p-timeout'
import { puppeteerCrawler } from './core/crawler.js'
import { env } from './core/env.js'
import { ping } from './core/healthy.js'
import { LINK_TYPE } from './core/interfaces.js'
import { log } from './core/log.js'
import { route } from './routes/index.js'

log.info({ event: 'crawler start' })

try {
  route(puppeteerCrawler)
  await Promise.all([
    pTimeout(puppeteerCrawler.run([{ url: env.ENTRY_URL, label: LINK_TYPE.FOLDER }]), {
      milliseconds: env.CRAWLER_TIMEOUT_SECONDS * 1000,
      fallback: () => {
        log.info({ event: 'crawler timeout' })
        return puppeteerCrawler.teardown()
      },
    }),
  ])
} catch (error) {
  log.error({ event: 'crawler failed', error })
}

if (env.HEALTHY_UUID) {
  await ping(env.HEALTHY_UUID)
}

log.info({ event: 'crawler end', stats: puppeteerCrawler.stats.toJSON() })

process.exit(0)
