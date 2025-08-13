import { LINK_TYPE } from '../core/interfaces.js'
import { log } from '../core/log.js'
import { parseIframeLinkFromNodePage } from '../routes/got/node.js'

export const catLink = async (link: string): Promise<[link: string, cat: string]> => {
  log.debug(`catLink: ${link}`)
  const url = new URL(link)
  if (url.pathname.startsWith('/i/desktop/folders/')) {
    return [link, LINK_TYPE.FOLDER]
  }
  if (url.pathname.startsWith('/i/nodes/')) {
    return catLink(await parseIframeLinkFromNodePage(link))
  }
  if (url.pathname.startsWith('/uni-preview')) {
    return [link, LINK_TYPE.PREVIEW]
  }
  if (url.pathname.startsWith('/document/edit')) {
    return [link, LINK_TYPE.DOCUMENT]
  }
  if (url.pathname.startsWith('/spreadsheetv2/')) {
    return [link, LINK_TYPE.SPREADSHEET]
  }
  if (url.pathname.startsWith('/iframe/notable')) {
    const docKey = url.searchParams.get('docKey')
    return [`https://alidocs.dingtalk.com/notable?docKey=${docKey}`, LINK_TYPE.NOTABLE]
  }
  if (url.pathname.startsWith('/mind/')) {
    return [link, LINK_TYPE.MIND]
  }
  return [link, LINK_TYPE.UNKNOWN]
}
