import { EventEmitter } from 'events'
import fs from 'fs'
import path from 'path'
import { Page } from 'puppeteer'
import { DOWNLOAD_PATH } from '../core/env.js'

export const getFilenameFromContentDisposition = (contentDisposition: string) => {
  const parts = contentDisposition.split(/;(?=(?:(?:[^"']*["']){2})*[^"']*$)/)

  for (const part of parts) {
    const filenameStarMatch = part.trim().match(/^filename\*=(?:"([^"]*)"|'([^']*)'|([^;]+))$/i)
    if (filenameStarMatch) {
      const value = filenameStarMatch[1] || filenameStarMatch[2] || filenameStarMatch[3]
      const filenameMatch = value.match(/^utf-8''(.+)$/i)
      if (filenameMatch) {
        return decodeURIComponent(filenameMatch[1])
      }
    }
  }

  for (const part of parts) {
    const trimmedPart = part.trim()
    const filenameMatch = trimmedPart.match(/^filename=(?:"([^"]*)"|'([^']*)'|([^;]+))$/i)
    if (filenameMatch) {
      const filename = filenameMatch[1] || filenameMatch[2] || filenameMatch[3]
      return decodeURIComponent(filename)
    }
  }

  throw new Error('Could not parse filename from Content-Disposition header')
}

export const createDownloader = async (page: Page, workdir?: string[]) => {
  const cdp = await page.target().createCDPSession()
  await cdp.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: workdir ? path.join(DOWNLOAD_PATH, workdir.join('/')) : DOWNLOAD_PATH,
  })

  const emitter = new EventEmitter()

  page.on('response', async response => {
    const contentDisposition = response.headers()['content-disposition']
    if (contentDisposition && contentDisposition.includes('attachment')) {
      const filename = getFilenameFromContentDisposition(contentDisposition)
      const filePath = path.join(DOWNLOAD_PATH, filename)

      await new Promise(resolve => {
        const checkFile = setInterval(() => {
          if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) {
            clearInterval(checkFile)
            resolve(void 0)
          }
        }, 100)
      })

      emitter.emit('downloaded', { filename, filePath })
    }
  })

  const waitForDownload = async (targetFilename?: string) => {
    return new Promise(resolve => {
      emitter.once('downloaded', ({ filename, filePath }) => {
        if (!targetFilename) {
          resolve(filePath)
          return
        }
        if (filename === targetFilename) {
          resolve(filePath)
        }
      })
    })
  }

  return {
    waitForDownload,
  }
}
