# SUMMIT-260 database adapter proof

Throwaway branch. **Do not merge.** It exists so the SUMMIT-260 decision rests on a
build that ran rather than on documentation, and so the next person can re-run it.

Result: **both adapters work, with identical behaviour. Turso is the easier one.**
See `decisions/0001-production-platform.md` on `claude/platform-decision` for the
decision this fed.

## What was proven

One Payload schema modelled on the blocked tickets:

- `Users`: staff auth with roles (SUMMIT-237, SUMMIT-257)
- `Jobs`: `versions.drafts`, so the adapter has to generate the `_jobs_v*` version
  tables, plus an array field (SUMMIT-259)
- `Applications`: relationships to Jobs and Users, an array of notes, an indexed
  status (SUMMIT-257)

Run against both adapters, end to end:

| Step                                              | libSQL on Node | D1 on workerd            |
| ------------------------------------------------- | -------------- | ------------------------ |
| Migration generated and applied                   | yes            | yes, same migration file |
| Version tables created                            | yes            | yes                      |
| Admin UI loads, first user registers              | yes            | yes                      |
| Create draft job                                  | 201            | 201                      |
| Draft hidden from unauthenticated read            | yes            | yes                      |
| Publish                                           | 200            | 200                      |
| Version history after publish                     | 2              | 2                        |
| Application with relationship, notes array, owner | 201            | 201                      |
| Filter by status                                  | 1 match        | 1 match                  |
| Status transition with depth-1 join               | 200            | 200                      |

Both produced the same tables: `users`, `users_sessions`, `jobs`, `jobs_trades`,
`_jobs_v`, `_jobs_v_version_trades`, `applications`, `applications_notes`, plus
Payload's own. The single generated migration applied unchanged to both, because both
emit SQLite DDL.

## Bundle size, measured

`wrangler deploy --dry-run` on the OpenNext build, with Payload's admin included:

```
Total Upload: 19644.10 KiB / gzip: 4394.50 KiB
```

19.2 MiB uncompressed against the 64 MiB limit Cloudflare moved to in September 2026.
Comfortable. Under the old caps it would have failed the 3 MiB compressed free plan and
passed the 10 MiB compressed paid plan, which is what the official template's "paid
Workers only" note refers to.

## Prerequisites this surfaced, both adapters

These are the cost of adopting Payload at all, not differences between the two:

1. **The package has to become ESM.** `@payloadcms/richtext-lexical` has top-level
   await, so it cannot be `require()`d from a CommonJS graph. Flipping
   `"type": "module"` was clean: no `require` or `module.exports` anywhere in `src/` or
   `scripts/`, every config file already `.mjs`/`.mts`/`.ts`, and all 118 tests passed
   afterwards.
2. **`next.config.ts` needs `withPayload()`** plus
   `serverExternalPackages: ["jose", "pg-cloudflare", "drizzle-kit"]`.
3. **The build has to use webpack, not Turbopack.** Payload's drizzle adapters
   `require('drizzle-kit/api')` dynamically; Turbopack rewrites that specifier to
   something like `drizzle-kit-e722632bd56cd1a1/api`, and esbuild then cannot resolve it
   during the OpenNext bundle. `next build --webpack` fixes it. `serverExternalPackages`
   alone does not.
4. **Next has to be pinned to 16.3.8.** The repo is on 16.3.6, below OpenNext's floor of
   16.3.8. 16.4.0 builds, but every request to the deployed worker 500s with
   `Unexpected loadManifest(/.next/server/preview-props.json) call!`. 16.3.8 serves the
   site and the admin at 200.
5. **ESLint has to ignore `.open-next/` and `.wrangler/`**, or it exhausts the heap
   walking 59 MB of build output.
6. **The GitHub Pages static preview stops working.** Payload's API routes are
   incompatible with `output: "export"`:
   `export const dynamic = "force-static"/export const revalidate not configured on
route "/api/[...slug]" with "output: export"`. The preview has to move to a Cloudflare
   preview environment. Worth scheduling deliberately, because the client's review link
   currently points at GitHub Pages.

## Friction specific to D1

1. **No connection string.** The adapter needs a live binding, which only exists inside a
   Worker or behind wrangler's platform proxy, so the config resolves it with top-level
   await. Turso is a URL and a token.
2. **The build contends with itself.** Every route that imports the config spins up its
   own wrangler platform proxy, and Next's parallel page-data collection makes them fight
   over the same local D1 file:
   `SQLite failed ... database is locked: SQLITE_BUSY (extended: SQLITE_BUSY_RECOVERY)`,
   and the workerd runtime fails to start. The fix is `cpus: 1` and
   `workerThreads: false`, which serialises the whole build.
3. **The official template tracks Payload 4 canary, not 3.90.2 stable.**
   `templates/with-cloudflare-d1` on `main` imports `generatePayloadViewport` from
   `@payloadcms/next/layouts`, which does not exist in 3.90.2, where the exports are
   `metadata`, `RootLayout` and `handleServerFunctions`. The generated layout needs
   adjusting rather than copying.

Turso had none of these three. Its migrations run as an ordinary CLI command against a
URL.

## What was not proven

- **Hosted Turso was not tested**, only the same `@payloadcms/db-sqlite` adapter and
  `@libsql/client` against a local libSQL file. Remote is a `libsql://` URL and an auth
  token in the same `client` object. Testing the hosted path needs a Turso account.
- **Remote D1 was not tested**, only wrangler's local D1. Testing remote needs a
  Cloudflare account.
- **No deploy happened.** The worker was built and run under `wrangler dev`, which is
  workerd, but nothing was pushed to Cloudflare.
- **R2 was bound but unused.** `resumeKey` is a plain text field here; uploads were not
  exercised.
- Access control is deliberately absent, which is why unauthenticated reads return 403
  in the transcript. Real collections need `access.read` rules.

## Re-running it

```bash
npm ci

# libSQL / Turso path
PAYLOAD_SECRET=proof-secret npx payload migrate
PAYLOAD_SECRET=proof-secret npx next start -p 3188
# swap in Turso: DATABASE_URI=libsql://<db>.turso.io DATABASE_AUTH_TOKEN=<token>

# D1 path (point @payload-config at src/payload.d1.config.ts in tsconfig.json first)
PAYLOAD_CONFIG_PATH=src/payload.d1.config.ts PAYLOAD_SECRET=proof-secret npx payload migrate
PAYLOAD_SECRET=proof-secret npx opennextjs-cloudflare build
PAYLOAD_SECRET=proof-secret npx wrangler dev --port 3201
npx wrangler deploy --dry-run --outdir /tmp/proof-dryrun   # bundle size
```

Both configs share `src/collections/`. `src/payload.config.ts` is the libSQL one and is
what `@payload-config` points at on this branch.
