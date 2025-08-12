import { KeyValueStore } from 'crawlee'
import type { Cookie, Page } from 'puppeteer'
import { log } from '../core/log.js'

const STORE_NAME = 'dingdocs'

const store = await KeyValueStore.open(STORE_NAME)
const memory = new Map<string, Cookie[]>()

const setter = (cookies: Cookie[]) => {
  memory.set('cookies', cookies)
  store.setValue('cookies', cookies)
}

const getter = async () => {
  if (memory.has('cookies')) {
    return memory.get('cookies')
  }

  const cookies = (await store.getValue('cookies')) as Cookie[]
  memory.set('cookies', cookies)
  return cookies
}

export const loadCookies = async (page: Page) => {
  log.info('loading cookies from store')
  const cookies = await getter()
  if (cookies) {
    try {
      await page.browser().setCookie(...cookies)
    } catch (error) {
      log.error(`Error loading cookies: ${error}`)
      await setter([])
    }
    await page.reload()
  }
}

export const saveCookies = async (page: Page) => {
  const cookies = await page.browser().cookies()
  await setter(cookies)
}
