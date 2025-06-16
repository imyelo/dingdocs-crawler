import delay from 'delay'
import { abortUselessRequests } from '../common/abort-useless-requests.js'
import type { Handler } from '../core/crawler.js'
import { log } from '../core/log.js'

const handler: Handler = async ({ page, request, crawler }) => {
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
  } catch (error) {
    log.error('Login timeout or failed:', error)
    throw error
  }

  try {
    await page.waitForNetworkIdle()
    await page.waitForSelector('[data-my-files-id]', { timeout: 10000 })
    await delay(2000)

    const fileNames = await page.$$eval('[data-my-files-id] [data-testid="editable-text"]', elements =>
      elements.map(el => el.textContent?.trim() || '')
    )

    log.info(`Found ${fileNames.length} files`)
    log.info(`Found files: ${fileNames.join(', ')}`)
  } catch (error) {
    log.error('Failed to get file list:', error)
    throw error
  }
}

export default handler
