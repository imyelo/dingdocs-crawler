import pino, { type TransportTargetOptions } from 'pino'
import { LOG_PATH, LOGTAIL_SOURCE_TOKEN, NAME } from './env.js'

const transport = pino.transport({
  targets: [
    {
      target: 'pino/file',
      options: { destination: LOG_PATH, mkdir: true },
      level: 'info',
    },
    !!LOGTAIL_SOURCE_TOKEN &&
      ({
        target: '@logtail/pino',
        options: { sourceToken: LOGTAIL_SOURCE_TOKEN },
        level: 'info',
      } as TransportTargetOptions),
  ].filter((item: boolean | TransportTargetOptions): item is TransportTargetOptions => Boolean(item)),
})

export const log = pino({ name: NAME }, transport)
