import delay from 'delay'
import { abortUselessRequests } from '../../common/abort-useless-requests.js'
import { loadCookies } from '../../common/cookies-store.js'
import { createDownloader } from '../../common/download.js'
import { waitForLogin } from '../../common/login.js'
import type { PuppeteerCrawlerHandler } from '../../core/crawler.js'
import { log } from '../../core/log.js'

const handler: PuppeteerCrawlerHandler = async ({ page, request }) => {
  await loadCookies(page)
  await abortUselessRequests(page)
  await waitForLogin(page)
  await delay(1000)

  try {
    const { workdir, filename } = request.userData
    const { waitForDownload, renameFile } = await createDownloader(page, workdir)

    const viewSelector = '[role="view"]'
    await page.waitForSelector(viewSelector, { timeout: 10000 })
    await delay(1000)

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
      const downloadMenuSelector = `${dropdownSelector} [data-path="download"]`
      await page.hover(downloadMenuSelector)
      await delay(1000)
    }

    const downloadFromLocal = async (downloadSelector: string, extension: string) => {
      await openDownloadMenu()

      console.log('click download')
      await page.waitForSelector(downloadSelector, { timeout: 10000 })
      await page.click(downloadSelector)
      const { filename: downloadedFilename } = await waitForDownload()
      await renameFile(downloadedFilename, `${filename}.${extension}`)
      await delay(1000)

      console.log(`Downloaded to "${workdir.join('/')}/${filename}.${extension}"`)
    }

    await downloadFromLocal('[data-path="download::DOWNLOAD_AS_PDF"]', 'pdf')
  } catch (error) {
    log.error(`Error: ${error.message}`)
    throw error
  }
}

export default handler
