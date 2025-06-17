import delay from 'delay'
import { abortUselessRequests } from '../common/abort-useless-requests.js'
import { loadCookies } from '../common/cookies-store.js'
import { createDownloader } from '../common/download.js'
import { waitForLogin } from '../common/login.js'
import { timeout } from '../common/timeout.js'
import type { Handler } from '../core/crawler.js'
import { log } from '../core/log.js'

const handler: Handler = async ({ page, request }) => {
  await loadCookies(page)
  await abortUselessRequests(page)
  await waitForLogin(page)
  await delay(1000)

  try {
    const { waitForDownload } = await createDownloader(page, request.userData.workdir)

    console.log('click download')
    const downloadSelector = '[data-testid="download"]'
    await page.waitForSelector(downloadSelector, { timeout: 10000 })
    await page.click(downloadSelector)
    await Promise.any([waitForDownload(), timeout(10000)])
    await delay(1000)

    console.log(`Downloaded to "${request.userData.workdir.join('/')}/${request.userData.filename}"`)
  } catch (error) {
    log.error(`Error: ${error.message}`)
    throw error
  }
}

export default handler
