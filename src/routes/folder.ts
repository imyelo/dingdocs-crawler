import clipboardy from 'clipboardy'
import type { Source } from 'crawlee'
import delay from 'delay'
import { abortUselessRequests } from '../common/abort-useless-requests.js'
import { catLink } from '../common/cat-link.js'
import { loadCookies } from '../common/cookies-store.js'
import { waitForLogin } from '../common/login.js'
import type { Handler } from '../core/crawler.js'
import { LINK_TYPE } from '../core/interfaces.js'
import { log } from '../core/log.js'

const handler: Handler = async ({ page, crawler }) => {
  await loadCookies(page)
  await abortUselessRequests(page)
  await waitForLogin(page)
  await delay(1000)

  try {
    // TODO: handle empty folder
    await page.waitForSelector('[data-my-files-id]', { timeout: 10000 })
    await delay(1000)

    const workdir = await page.$$eval('.ant-breadcrumb .breadcrumb-item', elements =>
      elements.map(el => el.textContent?.trim() || '')
    )
    log.info(`Workdir: ${workdir.join(' > ')}`)

    const fileNames = await page.$$eval('[data-my-files-id] [data-testid="editable-text"]', elements =>
      elements.map(el => el.textContent?.trim() || '')
    )

    log.info(`Found ${fileNames.length} files`)
    log.info(`Found files: ${fileNames.join(', ')}`)

    const nextRequests: Source[] = []

    for (const fileName of fileNames) {
      console.log('hover', fileName)
      const fileSelector = `[data-my-files-id]:has([data-testid="editable-text"][title="${fileName}"])`
      await page.hover(fileSelector)

      console.log('click more')
      await delay(1000)
      const moreSelector = `${fileSelector} .icon-more-container`
      await page.waitForSelector(moreSelector, { timeout: 10000 })
      await page.click(moreSelector)

      console.log('wait for dropdown')
      const dropdownSelector = '.dtd-dropdown:not(.dtd-dropdown-hidden)'
      await page.waitForSelector(dropdownSelector, { timeout: 10000 })
      await delay(1000)

      console.log('click copy link')
      const copyLinkSelector = `${dropdownSelector} [title="Copy link"], ${dropdownSelector} [title="复制链接"]`
      await page.waitForSelector(copyLinkSelector, { timeout: 10000 })
      await page.click(copyLinkSelector)
      await delay(1000)

      console.log('read text')
      const link = await clipboardy.read()

      const label = catLink(link)
      if (label === LINK_TYPE.UNKNOWN) {
        log.error(`Unknown link type: ${link}`)
        continue
      }
      nextRequests.push({
        url: link,
        label,
        userData: {
          label,
          workdir,
          filename: fileName,
        },
      })
      await delay(1000)
    }

    const queue = await crawler.addRequests(nextRequests)
    await queue.waitForAllRequestsToBeAdded
  } catch (error) {
    log.error(`Error: ${error.message}`)
    throw error
  }
}

export default handler
