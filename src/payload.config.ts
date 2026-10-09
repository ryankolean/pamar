import path from 'path'
import { fileURLToPath } from 'url'

import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'

import { Applications } from './collections/Applications'
import { Jobs } from './collections/Jobs'
import { Users } from './collections/Users'

/**
 * SUMMIT-260 adapter proof, libSQL path (Turso).
 *
 * No top-level await, so this works in the repo as it stands, without flipping
 * package.json to `"type": "module"`. Turso is the same call with a libsql://
 * URL and an auth token instead of a file: URL.
 */

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
  },
  collections: [Users, Jobs, Applications],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'proof-only-not-a-real-secret',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || 'file:./.proof/libsql.db',
      authToken: process.env.DATABASE_AUTH_TOKEN,
    },
  }),
})
