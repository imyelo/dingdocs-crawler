import delay from 'delay'
import type { Page } from 'puppeteer'
import { saveCookies } from '../common/cookies-store.js'
import { log } from '../core/log.js'

export const waitForLogin = async (page: Page) => {
  log.info('Waiting for user login...')
  try {
    await delay(1000)
    const title = await page.title()
    const isLoginPage = title.includes('钉钉统一身份认证') || title.includes('DingTalk unified identity')

    if (isLoginPage) {
      log.info('Please login in the browser window...')
      await page.waitForFunction(
        () => !(document.title.includes('钉钉统一身份认证') || document.title.includes('DingTalk unified identity')),
        { timeout: 300000 }
      )
    }
    log.info('User logged in successfully')

    await saveCookies(page)
  } catch (error) {
    log.error('Login timeout or failed:', error)
    throw error
  }
}
