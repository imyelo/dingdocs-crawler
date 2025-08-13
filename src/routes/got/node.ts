import { load as cheerio } from 'cheerio'
import got from 'got'
import { loadCookieJar } from '../../common/cookies-store.js'

export const parseIframeLinkFromNodePage = async (url: string) => {
  const response = await got(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
    },
    cookieJar: await loadCookieJar(url),
  })
  const $ = cheerio(response.body)
  const nextRequest = $('#root iframe').attr('src')
  console.log('Found iframe link', nextRequest)

  return nextRequest
}
