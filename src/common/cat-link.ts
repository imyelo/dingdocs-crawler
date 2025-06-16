import { LINK_TYPE } from '../core/interfaces.js'

export const catLink = (link: string) => {
  const url = new URL(link)
  if (url.pathname.startsWith('/i/desktop/folders/')) {
    return LINK_TYPE.FOLDER
  }
  if (url.pathname.startsWith('/uni-preview')) {
    return LINK_TYPE.PREVIEW
  }
  if (url.pathname.startsWith('/document/edit')) {
    return LINK_TYPE.DOCUMENT
  }
  if (url.pathname.startsWith('/spreadsheetv2/')) {
    return LINK_TYPE.SPREADSHEET
  }
  if (url.pathname.startsWith('/notable/')) {
    return LINK_TYPE.NOTABLE
  }
  if (url.pathname.startsWith('/mind/')) {
    return LINK_TYPE.MIND
  }
  return LINK_TYPE.UNKNOWN
}
