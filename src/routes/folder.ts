import clipboardy from 'clipboardy'
import delay from 'delay'
import { abortUselessRequests } from '../common/abort-useless-requests.js'
import { loadCookies, saveCookies } from '../common/cookies-store.js'
import type { Handler } from '../core/crawler.js'
import { log } from '../core/log.js'

const handler: Handler = async ({ page }) => {
  await loadCookies(page)
  await abortUselessRequests(page)

  log.info('Waiting for user login...')
  try {
    const title = await page.title()
    const isLoginPage = title.includes('钉钉统一身份认证') || title.includes('DingTalk unified identity')

    if (isLoginPage) {
      log.info('Please login in the browser window...')
      await page.waitForFunction(
        () => {
          return (
            window.location.href.includes('/i/desktop/folders/') ||
            document.querySelector('.left-wrapper-container') !== null
          )
        },
        { timeout: 300000 }
      )
    }
    log.info('User logged in successfully')

    await saveCookies(page)
  } catch (error) {
    log.error('Login timeout or failed:', error)
    throw error
  }

  try {
    // TODO: handle empty folder
    await page.waitForSelector('[data-my-files-id]', { timeout: 10000 })
    await delay(1000)

    const fileNames = await page.$$eval('[data-my-files-id] [data-testid="editable-text"]', elements =>
      elements.map(el => el.textContent?.trim() || '')
    )

    log.info(`Found ${fileNames.length} files`)
    log.info(`Found files: ${fileNames.join(', ')}`)

    const links = []

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
      links.push(await clipboardy.read())
      await delay(1000)
    }

    console.log(links)

    await delay(1000000)
  } catch (error) {
    log.error(`Error: ${error.message}`)
    throw error
  }
}

export default handler
