#!/usr/bin/env node
// Captures the live Pamar website's brand evidence (pages, stylesheets, logo and images,
// colors, fonts, copy) into docs/brand/source/ so the brand and style guides can be built
// from what the site actually uses.
//
// Usage (Node 20+, no install needed):
//   node scripts/capture-brand.mjs [--url https://www.pamarenterprises.com] [--max-pages 20]
//
// Optional full-page screenshots need Playwright, installed without touching package.json:
//   npm i --no-save playwright && npx playwright install chromium

import { mkdir, writeFile, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const args = process.argv.slice(2);
const argValue = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const START_URL = argValue("--url", "https://www.pamarenterprises.com/");
const MAX_PAGES = Number(argValue("--max-pages", "20"));
const OUT = path.resolve(argValue("--out", "docs/brand/source"));
const MAX_ASSET_BYTES = 5 * 1024 * 1024;
const MAX_TOTAL_ASSET_BYTES = 40 * 1024 * 1024;
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36";

const origin = new URL(START_URL).origin;
const sameSite = (u) =>
  u.hostname.replace(/^www\./, "") === new URL(origin).hostname.replace(/^www\./, "");

async function get(url, as = "text") {
  const res = await fetch(url, { headers: { "user-agent": UA }, redirect: "follow" });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  if (as === "text")
    return { body: await res.text(), type: res.headers.get("content-type") ?? "", url: res.url };
  const buf = Buffer.from(await res.arrayBuffer());
  return { body: buf, type: res.headers.get("content-type") ?? "", url: res.url };
}

const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&#0?39;|&apos;|&#8217;|&rsquo;/g, "'")
    .replace(/&quot;|&#8220;|&#8221;|&ldquo;|&rdquo;/g, '"')
    .replace(/&#8211;|&ndash;/g, "–")
    .replace(/&#8212;|&mdash;/g, "—")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));

const stripTags = (html) =>
  decode(html.replace(/<(script|style|noscript|svg)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return m ? decode(m[2] ?? m[3] ?? m[4] ?? "") : undefined;
};

const resolve = (href, base) => {
  try {
    return new URL(href, base);
  } catch {
    return undefined;
  }
};

const slugFor = (u) => {
  const p = u.pathname.replace(/\/+$/, "").replace(/^\//, "");
  return (p || "home")
    .replace(/[^a-z0-9]+/gi, "-")
    .toLowerCase()
    .slice(0, 80);
};

const count = (map, key, n = 1) => map.set(key, (map.get(key) ?? 0) + n);
const sorted = (map) => [...map.entries()].sort((a, b) => b[1] - a[1]);

function normalizeColor(raw) {
  const c = raw.trim().toLowerCase();
  const hex = c.match(/^#([0-9a-f]{3,8})$/);
  if (hex) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((x) => x + x).join("");
    return `#${h.slice(0, 6)}${h.length === 8 && h.slice(6) !== "ff" ? h.slice(6) : ""}`;
  }
  const rgb = c.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)(?:[\s,/]+([\d.]+%?))?\s*\)$/);
  if (rgb) {
    const [r, g, b] = rgb.slice(1, 4).map(Number);
    const a = rgb[4];
    const base = `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
    return a && !["1", "100%"].includes(a) ? `${base} @ ${a}` : base;
  }
  return undefined;
}

function scanCss(css, colors, fonts, vars, fontFaces, imageUrls, base) {
  for (const m of css.matchAll(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g)) {
    const c = normalizeColor(m[0]);
    if (c) count(colors, c);
  }
  for (const m of css.matchAll(/font-family\s*:\s*([^;}]+)/gi))
    count(fonts, m[1].trim().replace(/\s*!important/, ""));
  for (const m of css.matchAll(/(--[\w-]+)\s*:\s*([^;}]+)/g)) vars.set(m[1], m[2].trim());
  for (const m of css.matchAll(/@font-face\s*{([^}]*)}/gi)) {
    const fam = m[1].match(/font-family\s*:\s*([^;]+)/i)?.[1]?.trim();
    const weight = m[1].match(/font-weight\s*:\s*([^;]+)/i)?.[1]?.trim();
    const style = m[1].match(/font-style\s*:\s*([^;]+)/i)?.[1]?.trim();
    if (fam) fontFaces.add(`${fam} ${weight ?? ""} ${style ?? ""}`.trim());
  }
  for (const m of css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
    if (/\.(png|jpe?g|gif|webp|svg|avif)(\?|$)/i.test(m[1])) {
      const u = resolve(m[1], base);
      if (u) imageUrls.set(u.href, { from: "css" });
    }
  }
}

async function screenshots(urls) {
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    console.log("• Playwright not installed; skipping screenshots (optional).");
    return [];
  }
  const dir = path.join(OUT, "screenshots");
  await mkdir(dir, { recursive: true });
  const browser = await chromium.launch();
  const saved = [];
  try {
    for (const [width, label] of [
      [1440, "desktop"],
      [390, "mobile"],
    ]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, userAgent: UA });
      for (const u of urls) {
        try {
          await page.goto(u, { waitUntil: "networkidle", timeout: 45000 });
          const file = `${slugFor(new URL(u))}-${label}.png`;
          await page.screenshot({ path: path.join(dir, file), fullPage: true });
          saved.push(`screenshots/${file}`);
          console.log(`  screenshot ${file}`);
        } catch (e) {
          console.log(`  ! screenshot failed for ${u}: ${e.message}`);
        }
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }
  return saved;
}

async function main() {
  console.log(`Capturing ${START_URL} → ${path.relative(process.cwd(), OUT)}`);
  await rm(OUT, { recursive: true, force: true });
  await mkdir(path.join(OUT, "pages"), { recursive: true });
  await mkdir(path.join(OUT, "css"), { recursive: true });
  await mkdir(path.join(OUT, "assets"), { recursive: true });

  const queue = [new URL(START_URL).href];
  const seen = new Set(queue);
  const pages = [];
  const cssUrls = new Map();
  const imageUrls = new Map();
  const colors = new Map();
  const inlineColors = new Map();
  const fonts = new Map();
  const vars = new Map();
  const fontFaces = new Set();
  const fontLinks = new Set();
  const generators = new Set();
  const navLabels = new Map();
  const buttonLabels = new Map();

  while (queue.length && pages.length < MAX_PAGES) {
    const url = queue.shift();
    let res;
    try {
      res = await get(url);
    } catch (e) {
      console.log(`  ! ${e.message}`);
      continue;
    }
    if (!res.type.includes("html")) continue;
    const html = res.body;
    const u = new URL(res.url);
    const slug = slugFor(u);
    await writeFile(path.join(OUT, "pages", `${slug}.html`), html);
    console.log(`  page ${u.pathname}`);

    const gen = html.match(/<meta[^>]+name=["']generator["'][^>]*>/i)?.[0];
    if (gen) generators.add(attr(gen, "content"));
    if (/wp-content|wp-includes/.test(html)) generators.add("WordPress (wp-content detected)");
    if (/static\.wixstatic|wix\.com/.test(html)) generators.add("Wix");
    if (/squarespace/.test(html)) generators.add("Squarespace");
    if (/elementor/.test(html)) generators.add("Elementor");
    if (/divi|et_pb_/i.test(html)) generators.add("Divi");

    for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
      const rel = (attr(tag, "rel") ?? "").toLowerCase();
      const href = attr(tag, "href");
      const abs = href && resolve(href, u);
      if (!abs) continue;
      if (rel.includes("stylesheet")) {
        if (/fonts\.googleapis|use\.typekit|fonts\.bunny|use\.fontawesome/.test(abs.href))
          fontLinks.add(abs.href);
        cssUrls.set(abs.href, true);
      }
      if (rel.includes("icon") || rel.includes("apple-touch"))
        imageUrls.set(abs.href, { from: rel });
    }
    for (const m of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
      scanCss(m[1], colors, fonts, vars, fontFaces, imageUrls, u);
      for (const imp of m[1].matchAll(/@import\s+(?:url\()?['"]?([^'")\s]+)/g)) {
        const abs = resolve(imp[1], u);
        if (abs) {
          if (/fonts\.googleapis|use\.typekit/.test(abs.href)) fontLinks.add(abs.href);
          cssUrls.set(abs.href, true);
        }
      }
    }
    for (const m of html.matchAll(/\sstyle\s*=\s*"([^"]*)"/gi)) {
      for (const c of m[1].matchAll(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g)) {
        const n = normalizeColor(c[0]);
        if (n) count(inlineColors, n);
      }
      for (const b of m[1].matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
        const abs = resolve(decode(b[1]), u);
        if (abs) imageUrls.set(abs.href, { from: "inline-style" });
      }
    }

    for (const tag of html.match(/<img\b[^>]*>/gi) ?? []) {
      const alt = attr(tag, "alt") ?? "";
      const cls = attr(tag, "class") ?? "";
      const srcs = [attr(tag, "src"), attr(tag, "data-src"), attr(tag, "data-lazy-src")];
      for (const set of [attr(tag, "srcset"), attr(tag, "data-srcset")]) {
        if (!set) continue;
        // Keep only the largest candidate from a srcset.
        const best = set
          .split(",")
          .map((s) => s.trim().split(/\s+/))
          .sort((a, b) => parseInt(b[1] ?? "0") - parseInt(a[1] ?? "0"))[0]?.[0];
        srcs.push(best);
      }
      for (const s of srcs) {
        const abs = s && !s.startsWith("data:") && resolve(s, u);
        if (abs) imageUrls.set(abs.href, { from: "img", alt, class: cls, page: u.pathname });
      }
    }
    for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
      const prop = attr(tag, "property") ?? attr(tag, "name") ?? "";
      if (
        /^(og:image(:url|:secure_url)?|twitter:image(:src)?|msapplication-TileImage)$/i.test(prop)
      ) {
        const abs = resolve(attr(tag, "content") ?? "", u);
        if (abs) imageUrls.set(abs.href, { from: prop });
      }
    }

    for (const nav of html.match(/<nav\b[\s\S]*?<\/nav>/gi) ?? []) {
      for (const a of nav.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)) {
        const t = stripTags(a[1]);
        if (t) count(navLabels, t);
      }
    }
    for (const b of html.matchAll(
      /<(a|button)\b([^>]*class="[^"]*\b(btn|button|cta)[^"]*"[^>]*)>([\s\S]*?)<\/\1>/gi,
    )) {
      const t = stripTags(b[4]);
      if (t && t.length < 60) count(buttonLabels, t);
    }

    const title = stripTags(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
    const description = attr(
      html.match(/<meta[^>]+name=["']description["'][^>]*>/i)?.[0] ?? "",
      "content",
    );
    const headings = [...html.matchAll(/<(h[1-4])\b[^>]*>([\s\S]*?)<\/\1>/gi)]
      .map((m) => `${m[1].toUpperCase()}: ${stripTags(m[2])}`)
      .filter((h) => !h.endsWith(": "));
    const main =
      html.match(/<main\b[\s\S]*?<\/main>/i)?.[0] ??
      html.match(/<body\b[\s\S]*<\/body>/i)?.[0] ??
      html;
    const paragraphs = [...main.matchAll(/<(p|li)\b[^>]*>([\s\S]*?)<\/\1>/gi)]
      .map((m) => stripTags(m[2]))
      .filter((t) => t.length > 25);
    const footer = stripTags(html.match(/<footer\b[\s\S]*?<\/footer>/i)?.[0] ?? "");
    pages.push({
      url: u.href,
      slug,
      title,
      description,
      headings,
      paragraphs: [...new Set(paragraphs)],
      footer,
    });

    for (const a of html.matchAll(/<a\b[^>]*href\s*=\s*["']([^"'#]+)["']/gi)) {
      const abs = resolve(decode(a[1]), u);
      if (!abs || !sameSite(abs) || !/^https?:$/.test(abs.protocol)) continue;
      if (
        /\.(pdf|jpe?g|png|gif|zip|docx?|xlsx?)$/i.test(abs.pathname) ||
        /wp-(admin|login|json)|\/feed\/?$/.test(abs.pathname)
      )
        continue;
      abs.search = "";
      abs.hash = "";
      if (!seen.has(abs.href)) {
        seen.add(abs.href);
        queue.push(abs.href);
      }
    }
  }

  // Stylesheets (plus one level of @import).
  const cssFiles = [];
  const cssQueue = [...cssUrls.keys()];
  const cssSeen = new Set(cssQueue);
  while (cssQueue.length) {
    const href = cssQueue.shift();
    try {
      const { body } = await get(href);
      const name =
        `${createHash("sha1").update(href).digest("hex").slice(0, 8)}-${path.basename(new URL(href).pathname) || "style"}`.replace(
          /[^\w.-]/g,
          "_",
        );
      const file = name.endsWith(".css") ? name : `${name}.css`;
      await writeFile(path.join(OUT, "css", file), `/* ${href} */\n${body}`);
      cssFiles.push({ href, file: `css/${file}` });
      scanCss(body, colors, fonts, vars, fontFaces, imageUrls, new URL(href));
      for (const imp of body.matchAll(/@import\s+(?:url\()?['"]?([^'")\s;]+)/g)) {
        const abs = resolve(imp[1], href);
        if (abs && !cssSeen.has(abs.href)) {
          cssSeen.add(abs.href);
          cssQueue.push(abs.href);
          if (/fonts\.googleapis|use\.typekit/.test(abs.href)) fontLinks.add(abs.href);
        }
      }
    } catch (e) {
      console.log(`  ! css ${e.message}`);
    }
  }
  console.log(`  ${cssFiles.length} stylesheets`);

  // Images: logo candidates and icons first, then everything else, within a size budget.
  const isLogo = ([href, meta]) => /logo/i.test(`${href} ${meta.alt ?? ""} ${meta.class ?? ""}`);
  const ordered = [...imageUrls.entries()].sort(
    (a, b) =>
      Number(isLogo(b)) - Number(isLogo(a)) ||
      Number(b[1].from !== "img") - Number(a[1].from !== "img"),
  );
  const assets = [];
  let total = 0;
  for (const [href, meta] of ordered) {
    if (total > MAX_TOTAL_ASSET_BYTES) break;
    try {
      const { body, type } = await get(href, "buffer");
      if (body.length > MAX_ASSET_BYTES) continue;
      const base = path.basename(new URL(href).pathname).replace(/[^\w.-]/g, "_") || "image";
      const file = `${isLogo([href, meta]) ? "logo-" : ""}${createHash("sha1").update(href).digest("hex").slice(0, 6)}-${base}`;
      await writeFile(path.join(OUT, "assets", file), body);
      total += body.length;
      assets.push({
        file: `assets/${file}`,
        href,
        type,
        bytes: body.length,
        logoCandidate: isLogo([href, meta]),
        ...meta,
      });
    } catch (e) {
      console.log(`  ! asset ${e.message}`);
    }
  }
  console.log(`  ${assets.length} images (${(total / 1024 / 1024).toFixed(1)} MB)`);

  const shots = await screenshots(pages.slice(0, 6).map((p) => p.url));

  const summary = {
    capturedAt: new Date().toISOString(),
    startUrl: START_URL,
    platform: [...generators],
    pages: pages.map(({ url, slug, title, description }) => ({
      url,
      file: `pages/${slug}.html`,
      title,
      description,
    })),
    stylesheets: cssFiles,
    fontLinks: [...fontLinks],
    fontFaces: [...fontFaces],
    fontFamilies: sorted(fonts).slice(0, 30),
    cssColors: sorted(colors).slice(0, 60),
    inlineColors: sorted(inlineColors).slice(0, 30),
    cssVariables: Object.fromEntries(
      [...vars.entries()]
        .filter(([k]) => !/^--wp--preset--(gradient|shadow|duotone)/.test(k))
        .slice(0, 300),
    ),
    navLabels: sorted(navLabels),
    buttonLabels: sorted(buttonLabels),
    logoCandidates: assets.filter((a) => a.logoCandidate),
    assets,
    screenshots: shots,
  };
  await writeFile(path.join(OUT, "summary.json"), JSON.stringify(summary, null, 2) + "\n");

  const copy = pages
    .map(
      (p) =>
        `# ${p.title || p.slug}\n\n<${p.url}>\n\n${p.description ? `> ${p.description}\n\n` : ""}## Headings\n\n${p.headings.map((h) => `- ${h}`).join("\n") || "- (none)"}\n\n## Body copy\n\n${p.paragraphs.map((t) => `- ${t}`).join("\n") || "- (none)"}\n\n## Footer\n\n${p.footer || "(none)"}\n`,
    )
    .join("\n---\n\n");
  await writeFile(path.join(OUT, "copy.md"), copy);

  console.log(
    `\nDone. ${pages.length} pages, ${cssFiles.length} stylesheets, ${assets.length} images, ${shots.length} screenshots.`,
  );
  console.log(
    `Top colors: ${summary.cssColors
      .slice(0, 8)
      .map(([c]) => c)
      .join(", ")}`,
  );
  console.log(
    `Fonts: ${summary.fontFamilies
      .slice(0, 5)
      .map(([f]) => f)
      .join(" | ")}`,
  );
  console.log(
    `\nNext: git add ${path.relative(process.cwd(), OUT)} && git commit -m "Capture live site brand evidence" && git push`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
