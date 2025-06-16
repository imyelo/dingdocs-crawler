import { crawler } from '../core/crawler.js'
import { SOURCE } from '../core/interfaces.js'
import Folder from './folder.js'

crawler.router.addHandler(SOURCE.FOLDER, Folder)

export { crawler }
