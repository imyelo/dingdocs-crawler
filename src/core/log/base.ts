import pino, { type TransportTargetOptions } from 'pino'
import { env } from '../env.js'

const transport = pino.transport({
  targets: [
    {
      target: 'pino/file',
      options: { destination: env.LOG_PATH, mkdir: true },
      level: 'info',
    },
    !!env.LOGTAIL_SOURCE_TOKEN &&
      ({
        target: '@logtail/pino',
        options: { sourceToken: env.LOGTAIL_SOURCE_TOKEN },
        level: 'info',
      } as TransportTargetOptions),
  ].filter((item: boolean | TransportTargetOptions): item is TransportTargetOptions => Boolean(item)),
})

export const log = pino({ name: env.NAME }, transport)
