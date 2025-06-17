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

    console.log('create downloader')
    const { waitForFileReady } = await createDownloader(page, workdir)

    console.log('wait for view to be loaded')
    const viewSelector = '.notable-layout-view'
    await page.waitForSelector(viewSelector, { timeout: 10000 })
    await delay(1000)

    console.log('close global guide')
    const globalGuideButtonSelector = '.global-guide button'
    const globalGuideButtons = await page.$$(globalGuideButtonSelector)
    if (globalGuideButtons.length > 0) {
      await globalGuideButtons[0]?.click()
    }

    const openDownloadMenu = async () => {
      console.log('click more')
      const moreSelector = '[data-role="NavBar_MoreMenu"]'
      await page.waitForSelector(moreSelector, { timeout: 10000 })
      await page.click(moreSelector)

      console.log('wait for dropdown')
      const dropdownSelector = '[data-role="we-service-more-menu"]'
      await page.waitForSelector(dropdownSelector, { timeout: 10000 })
      await delay(1000)

      console.log('hover download menu')
      const downloadMenuSelector = '[data-role="we-service-more-menu_export"]'
      await page.hover(downloadMenuSelector)
      await delay(1000)
    }

    console.log('open download menu')
    await openDownloadMenu()

    console.log('click download')
    const downloadSelector = '[data-role="we-service-more-menu__export_export"]'
    await page.waitForSelector(downloadSelector, { timeout: 10000 })
    await page.click(downloadSelector)

    console.log('submit download from modal')
    const downloadModalButtonsSelector = '.wdn-modal-content button:has(._export20)'
    await page.waitForSelector(downloadModalButtonsSelector, { timeout: 10000 })
    await page.click(downloadModalButtonsSelector)
    await Promise.any([waitForFileReady(`${filename}.zip`), waitForFileReady(`${filename}.xlsx`), timeout(10000)])
    await delay(1000)

    console.log(`Downloaded to "${workdir.join('/')}/${filename}.(xlsx|zip)"`)
  } catch (error) {
    log.error(`Error: ${error.message}`)
    throw error
  }
}

export default handler
