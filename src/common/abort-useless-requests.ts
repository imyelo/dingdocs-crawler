import type { Page } from 'puppeteer'

export const abortUselessRequests = async (page: Page) => {
  await page.setRequestInterception(true)
  page.on('request', interceptedRequest => {
    const url = interceptedRequest.url()
    if (
      url === 'https://alidocs.dingtalk.com/favicon.ico' ||
      url.startsWith('https://s-gm.mmstat.com/') ||
      url.startsWith('https://acjs.aliyun.com/')
    ) {
      interceptedRequest.abort()
      return
    }
    interceptedRequest.continue()
  })
}
