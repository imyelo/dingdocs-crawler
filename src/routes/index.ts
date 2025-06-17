import { crawler } from '../core/crawler.js'
import { LINK_TYPE } from '../core/interfaces.js'
import FileDocument from './file-document.js'
import FileMind from './file-mind.js'
import FileNotable from './file-notable.js'
import FilePreview from './file-preview.js'
import FileSpreedsheet from './file-spreedsheet.js'
import Folder from './folder.js'

crawler.router.addHandler(LINK_TYPE.FOLDER, Folder)
crawler.router.addHandler(LINK_TYPE.PREVIEW, FilePreview)
crawler.router.addHandler(LINK_TYPE.DOCUMENT, FileDocument)
crawler.router.addHandler(LINK_TYPE.SPREADSHEET, FileSpreedsheet)
crawler.router.addHandler(LINK_TYPE.NOTABLE, FileNotable)
crawler.router.addHandler(LINK_TYPE.MIND, FileMind)

export { crawler }
