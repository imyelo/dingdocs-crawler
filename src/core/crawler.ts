import { Log, ProxyConfiguration, PuppeteerCrawler } from 'crawlee'
import { CrawleePino } from 'crawlee-pino'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { MAX_CONCURRENCY, PROXY_URLS, REQUEST_TIMEOUT_SECONDS, VISIBLE } from './env.js'
import { log } from './log.js'

puppeteer.use(StealthPlugin())

export const crawler = new PuppeteerCrawler({
  headless: !VISIBLE,
  launchContext: {
    launcher: puppeteer,
    launchOptions: {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
      ],
    } as any,
  },
  proxyConfiguration: PROXY_URLS.length
    ? new ProxyConfiguration({
        proxyUrls: PROXY_URLS,
      })
    : void 0,
  maxConcurrency: MAX_CONCURRENCY,
  requestHandlerTimeoutSecs: REQUEST_TIMEOUT_SECONDS,
  failedRequestHandler: (context, error) => {
    log.error({ event: 'request failed', error, url: context.request.url })
  },
  log: new Log({
    logger: new CrawleePino({ pino: log.child({ event: 'crawlee says' }) }),
  }),
})

export type Handler = Parameters<typeof crawler.router.addHandler>[1]
