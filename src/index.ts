import pTimeout from 'p-timeout'
import { CRAWLER_TIMEOUT_SECONDS, ENTRY_URL, HEALTHY_UUID } from './core/env.js'
import { ping } from './core/healthy.js'
import { SOURCE } from './core/interfaces.js'
import { log } from './core/log.js'
import { crawler } from './routes/index.js'

log.info({ event: 'crawler start' })

try {
  await pTimeout(crawler.run([{ url: ENTRY_URL, label: SOURCE.FOLDER }]), {
    milliseconds: CRAWLER_TIMEOUT_SECONDS * 1000,
    fallback: () => {
      log.info({ event: 'crawler timeout' })
      return crawler.teardown()
    },
  })
} catch (error) {
  log.error({ event: 'crawler failed', error })
}

if (HEALTHY_UUID) {
  await ping(HEALTHY_UUID)
}

log.info({ event: 'crawler end', stats: crawler.stats.toJSON() })

process.exit(0)
