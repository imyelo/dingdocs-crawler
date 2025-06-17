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
    const { workdir, filename } = request.userData
    const { waitForFileReady } = await createDownloader(page, workdir)

    const openDownloadMenu = async () => {
      console.log('click more')
      const moreSelector = '[data-testid="doc-header-more-button"]'
      await page.waitForSelector(moreSelector, { timeout: 10000 })
      await page.click(moreSelector)

      console.log('wait for dropdown')
      const dropdownSelector = '[data-role="headerMoreMenu-popover"]'
      await page.waitForSelector(dropdownSelector, { timeout: 10000 })
      await delay(1000)

      console.log('hover download menu')
      const downloadMenuSelector = '[data-testid="ContextMenuWrap_DOWNLOAD_AS"]'
      await page.hover(downloadMenuSelector)
      await delay(1000)
    }

    const downloadFromLocal = async (downloadSelector: string, extension: string) => {
      await openDownloadMenu()

      console.log('click download')
      await page.waitForSelector(downloadSelector, { timeout: 10000 })
      await page.click(downloadSelector)
      await Promise.any([waitForFileReady(`${filename}.${extension}`), timeout(10000)])
      await delay(1000)

      console.log(`Downloaded to "${workdir.join('/')}/${filename}.${extension}"`)
    }

    await downloadFromLocal('[data-testid="ContextMenuWrap__DOWNLOAD_AS_EXCEL"]', 'xlsx')
  } catch (error) {
    log.error(`Error: ${error.message}`)
    throw error
  }
}

export default handler
