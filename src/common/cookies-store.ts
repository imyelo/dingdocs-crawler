import { KeyValueStore } from 'crawlee'
import type { Cookie, Page } from 'puppeteer'
import { CookieJar } from 'tough-cookie'
import { log } from '../core/log.js'

const STORE_NAME = 'dingdocs'

const store = await KeyValueStore.open(STORE_NAME)
const memory = new Map<string, Cookie[]>()

const setter = (cookies: Cookie[]) => {
  memory.set('cookies', cookies)
  store.setValue('cookies', cookies)
}

export const getter = async () => {
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
    await page.reload().catch(error => {
      console.error(`Error reloading page: ${error}`)
    })
  }
}

export const saveCookies = async (page: Page) => {
  const cookies = await page.browser().cookies()
  await setter(cookies)
}

export const loadCookieJar = async (url: string) => {
  const cookieJar = new CookieJar()
  const cookies = await getter()
  cookies.forEach(cookie => cookieJar.setCookie(`${cookie.name}=${cookie.value}`, url))
  return cookieJar
}
