import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import { CloudflareContext, getCloudflareContext } from '@opennextjs/cloudflare'
import { GetPlatformProxyOptions } from 'wrangler'

import { Applications } from './collections/Applications'
import { Jobs } from './collections/Jobs'
import { Users } from './collections/Users'

/**
 * SUMMIT-260 adapter proof, Cloudflare D1 path.
 *
 * D1 has no connection string: the adapter needs a live binding, which only
 * exists inside a Worker or behind wrangler's platform proxy. Resolving it
 * requires top-level await, which requires the package to be ESM. Adapted from
 * the official templates/with-cloudflare-d1 config.
 */

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const realpath = (value: string) => (fs.existsSync(value) ? fs.realpathSync(value) : undefined)

const isCLI = process.argv.some((value) => realpath(value)?.endsWith(path.join('payload', 'bin.js')))
const isProduction = process.env.NODE_ENV === 'production'

function getCloudflareContextFromWrangler(): Promise<CloudflareContext> {
  return import(/* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`).then(
    ({ getPlatformProxy }) =>
      getPlatformProxy({
        environment: process.env.CLOUDFLARE_ENV,
        remoteBindings: false,
      } satisfies GetPlatformProxyOptions),
  )
}

const cloudflare =
  isCLI || !isProduction
    ? await getCloudflareContextFromWrangler()
    : await getCloudflareContext({ async: true })

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
  },
  collections: [Users, Jobs, Applications],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'proof-only-not-a-real-secret',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: sqliteD1Adapter({ binding: cloudflare.env.D1 }),
})
