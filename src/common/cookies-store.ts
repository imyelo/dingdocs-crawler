import { KeyValueStore } from 'crawlee'
import type { Page, Protocol } from 'puppeteer'
import { log } from '../core/log.js'

const STORE_NAME = 'dingdocs'

const store = await KeyValueStore.open(STORE_NAME)
const memory = new Map<string, unknown>()

const setter = (cookies: Protocol.Network.Cookie[]) => {
  memory.set('cookies', cookies)
  store.setValue('cookies', cookies)
}

const getter = async () => {
  if (memory.has('cookies')) {
    return memory.get('cookies')
  }

  const cookies = await store.getValue('cookies')
  memory.set('cookies', cookies)
  return cookies
}

export const loadCookies = async (page: Page) => {
  log.info('loading cookies from store')
  const cookies = await getter()
  if (cookies) {
    await page.setCookie(...(cookies as Protocol.Network.Cookie[]))
  }

  await page.reload()
}

export const saveCookies = async (page: Page) => {
  const cookies = await page.cookies()
  await setter(cookies)
}
