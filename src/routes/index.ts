import type { PuppeteerCrawler } from 'crawlee'
import { LINK_TYPE } from '../core/interfaces.js'
import FileDocument from './puppeteer/file-document.js'
import FileMind from './puppeteer/file-mind.js'
import FileNotable from './puppeteer/file-notable.js'
import FilePreview from './puppeteer/file-preview.js'
import FileSpreedsheet from './puppeteer/file-spreedsheet.js'
import Folder from './puppeteer/folder.js'
import Node from './puppeteer/node.js'

export const route = (puppeteer: PuppeteerCrawler) => {
  puppeteer.router.addHandler(LINK_TYPE.FOLDER, Folder)
  puppeteer.router.addHandler(LINK_TYPE.NODE, Node)
  puppeteer.router.addHandler(LINK_TYPE.PREVIEW, FilePreview)
  puppeteer.router.addHandler(LINK_TYPE.DOCUMENT, FileDocument)
  puppeteer.router.addHandler(LINK_TYPE.SPREADSHEET, FileSpreedsheet)
  puppeteer.router.addHandler(LINK_TYPE.NOTABLE, FileNotable)
  puppeteer.router.addHandler(LINK_TYPE.MIND, FileMind)
}
