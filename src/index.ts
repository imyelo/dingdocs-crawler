import pTimeout from 'p-timeout'
import { env } from './core/env.js'
import { ping } from './core/healthy.js'
import { LINK_TYPE } from './core/interfaces.js'
import { log } from './core/log.js'
import { crawler } from './routes/index.js'

log.info({ event: 'crawler start' })

try {
  await pTimeout(crawler.run([{ url: env.ENTRY_URL, label: LINK_TYPE.FOLDER }]), {
    milliseconds: env.CRAWLER_TIMEOUT_SECONDS * 1000,
    fallback: () => {
      log.info({ event: 'crawler timeout' })
      return crawler.teardown()
    },
  })
} catch (error) {
  log.error({ event: 'crawler failed', error })
}

if (env.HEALTHY_UUID) {
  await ping(env.HEALTHY_UUID)
}

log.info({ event: 'crawler end', stats: crawler.stats.toJSON() })

process.exit(0)
