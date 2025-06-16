import { KeyValueStore } from 'crawlee'
import type { Page, Protocol } from 'puppeteer'
import { log } from '../core/log.js'

const STORE_NAME = 'dingdocs'

const store = await KeyValueStore.open(STORE_NAME)

export const loadCookies = async (page: Page) => {
  log.info('loading cookies from store')
  const cookies = await store.getValue('cookies')
  if (cookies) {
    await page.setCookie(...(cookies as Protocol.Network.Cookie[]))
  }

  await page.reload()
}

export const saveCookies = async (page: Page) => {
  const cookies = await page.cookies()
  await store.setValue('cookies', cookies)
}
