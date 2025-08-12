import type { Page } from 'puppeteer'

export const abortUselessRequests = async (page: Page) => {
  await page.setRequestInterception(true)
  page.on('request', interceptedRequest => {
    const url = interceptedRequest.url()
    if (
      url === 'https://alidocs.dingtalk.com/favicon.ico' ||
      url.startsWith('https://s-gm.mmstat.com/') ||
      url.startsWith('https://acjs.aliyun.com/') ||
      url.startsWith('https://fourier.taobao.com/rp') ||
      /https:\/\/lippi-.*\.cn-.*\.log\.aliyuncs\.com\//.test(url)
    ) {
      interceptedRequest.abort()
      return
    }
    interceptedRequest.continue()
  })
}
