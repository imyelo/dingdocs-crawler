import got from 'got'

const HEALTHCHECKS_PING_URL = 'https://hc-ping.com/'

export const ping = uuid => got(`${HEALTHCHECKS_PING_URL}${uuid}`)
