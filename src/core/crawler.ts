import { Configuration, Log, ProxyConfiguration, PuppeteerCrawler } from 'crawlee'
import { CrawleePino } from 'crawlee-pino'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { env } from './env.js'
import { log } from './log.js'

puppeteer.use(StealthPlugin())

export const puppeteerCrawler = new PuppeteerCrawler({
  headless: !env.VISIBLE,
  launchContext: {
    launcher: puppeteer,
    launchOptions: {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
        '--disable-features=FedCm',
      ],
    } as any,
  },
  proxyConfiguration: env.PROXY_URLS.length
    ? new ProxyConfiguration({
        proxyUrls: env.PROXY_URLS,
      })
    : void 0,
  maxConcurrency: env.MAX_CONCURRENCY,
  requestHandlerTimeoutSecs: env.REQUEST_TIMEOUT_SECONDS,
  failedRequestHandler: (context, error) => {
    log.error({ event: 'request failed', error, url: context.request.url })
  },
  errorHandler: (context, error) => {
    log.error({ event: 'crawler error', error, url: context.request.url })
  },
  log: new Log({
    logger: new CrawleePino({ pino: log.child({ event: 'crawlee says' }) }),
  }),
  maxRequestRetries: env.MAX_REQUEST_RETRIES,
})

Configuration.getEventManager().on('aborting', () => {
  log.info({ event: 'crawler aborting' })
})

Configuration.getEventManager().on('exit', () => {
  log.info({ event: 'crawler exited' })
})

export type PuppeteerCrawlerHandler = Parameters<typeof puppeteerCrawler.router.addHandler>[1]
