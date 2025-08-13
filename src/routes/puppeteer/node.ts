import type { Source } from 'crawlee'
import delay from 'delay'
import { abortUselessRequests } from '../../common/abort-useless-requests.js'
import { catLink } from '../../common/cat-link.js'
import { loadCookies } from '../../common/cookies-store.js'
import { waitForLogin } from '../../common/login.js'
import type { PuppeteerCrawlerHandler } from '../../core/crawler.js'
import { log } from '../../core/log.js'

const handler: PuppeteerCrawlerHandler = async ({ page, request, crawler }) => {
  try {
    await abortUselessRequests(page)
    await loadCookies(page)
    await abortUselessRequests(page)
    await waitForLogin(page)
    await delay(1000)
  } catch (error) {
    log.error(`Preprocess error: ${error.message}`)
    console.error(`Preprocess error: ${error.message}`)
    throw error
  }

  try {
    const { workdir, filename } = request.userData as { workdir: string[]; filename: string }

    console.log('wait for iframe to be loaded')
    const iframeSelector = '#root iframe'
    await page.waitForSelector(iframeSelector, { timeout: 10000 })
    await delay(1000)

    console.log('extract iframe link')
    const link = await page.$eval(iframeSelector, iframe => iframe.getAttribute('src'))

    const [nextLink, label] = await catLink(link)
    const nextRequest: Source = {
      url: nextLink,
      label,
      userData: {
        label,
        workdir,
        filename,
      },
    }
    log.info(`nextRequest: ${JSON.stringify(nextRequest)}`)

    const queue = await crawler.addRequests([nextRequest])
    await queue.waitForAllRequestsToBeAdded
  } catch (error) {
    log.error(`Route error: ${error.message}`)
    console.error(`Route error: ${error.message}`, error)
    throw error
  }
}

export default handler
