import assert from 'assert'
import clipboardy from 'clipboardy'
import type { Source } from 'crawlee'
import delay from 'delay'
import { abortUselessRequests } from '../common/abort-useless-requests.js'
import { catLink } from '../common/cat-link.js'
import { loadCookies } from '../common/cookies-store.js'
import { waitForLogin } from '../common/login.js'
import type { Handler } from '../core/crawler.js'
import { LINK_TYPE } from '../core/interfaces.js'
import { log } from '../core/log.js'

const handler: Handler = async ({ page, crawler }) => {
  await loadCookies(page)
  await abortUselessRequests(page)
  await waitForLogin(page)
  await delay(1000)

  try {
    // TODO: handle empty folder
    await page.waitForSelector('[data-my-files-id]', { timeout: 10000 })
    await delay(1000)

    console.log('wait for folder info')
    // large width for folder info
    // large height for virtual list
    await page.setViewport({ width: 800, height: 90000 })
    await page.waitForSelector('#left-wrapper-container + div .group-item', { timeout: 10000 })
    const folderInfo = await page.$$eval('#left-wrapper-container + div .group-item', elements =>
      elements.map(el => ({
        label: el.querySelector('.group-item-label')?.textContent?.trim() || '',
        value: el.querySelector('.group-item-value')?.textContent?.trim() || '',
      }))
    )
    log.debug(`folderInfo: ${JSON.stringify(folderInfo)}`)
    const workdirFromFolderInfo =
      folderInfo
        .find(info => info.label === 'Path' || info.label === '路径')
        ?.value?.replace(/(^Team File:)|(^团队文件：)/g, '')
        ?.trim()
        ?.split('/') || []
    log.debug(`workdir from folder info: ${workdirFromFolderInfo.join(' > ')}`)

    const workdirFromHeader = await page.$$eval('.ant-breadcrumb .breadcrumb-item', elements =>
      elements.map(el => el.textContent?.trim() || '')
    )
    log.debug(`workdir from header: ${workdirFromHeader.join(' > ')}`)

    const workdir = [workdirFromHeader[0], ...workdirFromFolderInfo, workdirFromHeader[workdirFromHeader.length - 1]]
    log.info(`Workdir: ${workdir.join(' > ')}`)

    const listSelector = '.ReactVirtualized__List'
    const fileIds: Set<string> = new Set()
    const nextRequests: Source[] = []
    const ignoredRequests: Source[] = []

    do {
      const newFileIds = await page.$$eval('[data-my-files-id]', elements =>
        elements.map(el =>
          JSON.stringify([
            el.querySelector('[data-testid="editable-text"]').textContent?.trim() || '',
            ['', ...el.querySelector('.wefile-icon-container svg').classList].join('.'),
          ])
        )
      )

      log.info(`Found ${newFileIds.length} files`)
      log.info(`Found files: ${newFileIds.join(', ')}`)

      for (const fileId of newFileIds) {
        if (fileIds.has(fileId)) {
          console.log(`File ${fileId} already processed`)
          continue
        }

        const [fileName, fileIconSelector] = JSON.parse(fileId)
        console.log('hover', fileName, fileIconSelector)
        const fileSelector = `[data-my-files-id]:has([data-testid="editable-text"][title="${fileName}"]):has(.wefile-icon-container svg${fileIconSelector})`
        await page.hover(fileSelector)

        console.log('click more')
        await delay(1000)
        const moreSelector = `${fileSelector} .icon-more-container`
        await page.waitForSelector(moreSelector, { timeout: 10000 })
        await page.click(moreSelector)

        console.log('wait for dropdown')
        const dropdownSelector = '.dtd-dropdown:not(.dtd-dropdown-hidden)'
        await page.waitForSelector(dropdownSelector, { timeout: 10000 })
        await delay(1000)

        console.log('click copy link')
        const copyLinkSelector = `${dropdownSelector} [title="Copy link"], ${dropdownSelector} [title="Copy link address"], ${dropdownSelector} [title="复制链接"]`
        await page.waitForSelector(copyLinkSelector, { timeout: 10000 })
        await page.click(copyLinkSelector)
        await delay(1000)

        console.log('read text')
        const link = await clipboardy.read()

        const label = catLink(link, [fileName, fileIconSelector])
        const request: Source = {
          url: link,
          label,
          userData: {
            label,
            workdir,
            filename: fileName,
          },
        }
        if (label === LINK_TYPE.UNKNOWN) {
          log.error(`Unknown link type: ${link}`)
          ignoredRequests.push(request)
          continue
        }
        nextRequests.push(request)
        await delay(1000)
      }
      newFileIds.forEach(fileId => fileIds.add(fileId))

      log.info('scrolling down')
      await page.evaluate(listSelector => {
        const list = document.querySelector(listSelector)
        if (!list) return
        list.scrollTo({ top: list.scrollTop + list.clientHeight, behavior: 'instant' })
      }, listSelector)
      await delay(1000)
      await page.waitForNetworkIdle()
    } while (
      await page.$eval(listSelector, list => {
        return list.scrollHeight - list.scrollTop > list.clientHeight
      })
    )

    console.log('ignoredRequests', ignoredRequests)
    console.log('nextRequests', nextRequests)
    console.log('fileIds', fileIds, fileIds.size)
    assert(nextRequests.length + ignoredRequests.length === fileIds.size, 'All requests should be processed')

    const queue = await crawler.addRequests(nextRequests)
    await queue.waitForAllRequestsToBeAdded
  } catch (error) {
    log.error(`Error: ${error.message}`)
    throw error
  }
}

export default handler
