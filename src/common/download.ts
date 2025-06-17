import { EventEmitter } from 'events'
import fs from 'fs'
import path from 'path'
import { Page } from 'puppeteer'
import { DOWNLOAD_PATH } from '../core/env.js'
import { log } from '../core/log.js'

const getFilenameFromContentDisposition = (contentDisposition: string) => {
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

const getFilenameFromURL = (url: string) => {
  const urlObj = new URL(url)
  const filename = urlObj.pathname.split('/').pop()
  return decodeURIComponent(filename || '')
}

export interface DownloadedEvent {
  filename: string
  filePath: string
}

export const createDownloader = async (page: Page, workdir?: string[]) => {
  const cdp = await page.target().createCDPSession()
  const downloadPath = workdir ? path.join(DOWNLOAD_PATH, workdir.join('/')) : DOWNLOAD_PATH
  await cdp.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath,
  })

  const emitter = new EventEmitter()

  const waitForFileReady = async (filename: string) => {
    const filePath = path.join(downloadPath, filename)
    log.info(`Waiting for file: ${downloadPath}/${filename}`)
    await new Promise(resolve => {
      const checkFile = setInterval(() => {
        if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) {
          clearInterval(checkFile)
          resolve(void 0)
        }
      }, 100)
    })
    log.info(`File is ready: ${downloadPath}/${filename}`)
  }

  const waitForDownload = async (filename?: string) => {
    return new Promise<DownloadedEvent>(resolve => {
      emitter.once('downloaded', (event: DownloadedEvent) => {
        if (!filename) {
          resolve(event)
          return
        }
        if (filename === event.filename) {
          resolve(event)
        }
      })
    })
  }

  const renameFile = async (filename: string, newFilename: string) => {
    const filePath = path.join(downloadPath, filename)
    const newFilePath = path.join(downloadPath, newFilename)
    fs.renameSync(filePath, newFilePath)
  }

  page.on('response', async response => {
    let filename: string | undefined

    const contentDisposition = response.headers()['content-disposition']
    const contentType = response.headers()['content-type']
    if (contentDisposition?.includes('attachment')) {
      filename = getFilenameFromContentDisposition(contentDisposition)
    } else if (
      contentType?.includes('application/octet-stream') ||
      contentType?.includes('application/zip') ||
      contentType?.includes('application/pdf')
    ) {
      filename = getFilenameFromURL(response.url())
    }

    if (!filename) {
      return
    }

    await waitForFileReady(filename)
    emitter.emit('downloaded', { filename, filePath: path.join(downloadPath, filename) } as DownloadedEvent)
  })

  return {
    waitForFileReady,
    waitForDownload,
    renameFile,
  }
}
