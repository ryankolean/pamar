// Minimal stand-in for the generated types; the proof only needs these two bindings.
declare namespace Cloudflare {
  interface Env {
    D1: D1Database
    R2: R2Bucket
  }
}
type CloudflareEnv = Cloudflare.Env
