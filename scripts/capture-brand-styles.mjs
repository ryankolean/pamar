#!/usr/bin/env node
// Companion to capture-brand.mjs. Loads the live site in headless Chromium, replaces the
// screenshots in docs/brand/source/screenshots/, and writes docs/brand/source/computed-styles.json
// with getComputedStyle() readings (body, headings, nav, footer, buttons, inputs, hover and focus
// states) so the brand guide can cite the rendered values, not just the stylesheets.
//
// Usage: npm i --no-save playwright && npx playwright install chromium && node scripts/capture-brand-styles.mjs
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
const OUT = "docs/brand/source";
const pages = [
  "/",
  "/about/",
  "/safety/",
  "/services/",
  "/projects/",
  "/careers/",
  "/news/",
  "/contact/",
  "/cso-3-5-phase-ii-control-123688/",
];
const slug = (p) =>
  p
    .replace(/^\/|\/$/g, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .toLowerCase() || "home";
await mkdir(`${OUT}/screenshots`, { recursive: true });
const b = await chromium.launch();
const computed = {};
const probe = `(() => {
  const pick = (el, props) => { if (!el) return null; const cs = getComputedStyle(el); const o = {}; for (const p of props) o[p] = cs.getPropertyValue(p); o.text = (el.innerText||"").trim().slice(0,60); o.tag = el.tagName.toLowerCase(); o.class = (el.className||"").toString().slice(0,80); return o; };
  const T = ["font-family","font-size","font-weight","line-height","letter-spacing","text-transform","color","background-color","border-color","border-width","border-radius","padding","box-shadow","text-decoration-line"];
  const q = (s) => document.querySelector(s);
  const all = (s, n=3) => [...document.querySelectorAll(s)].slice(0,n).map(e=>pick(e,T));
  const links = [...document.querySelectorAll("a")].filter(a=>a.offsetParent && a.innerText.trim());
  const btnLike = links.filter(a => { const cs=getComputedStyle(a); return cs.backgroundColor!=="rgba(0, 0, 0, 0)" || parseFloat(cs.borderWidth)>0; }).slice(0,8);
  return {
    url: location.href,
    body: pick(document.body, T),
    html: pick(document.documentElement, T),
    h1: all("h1"), h2: all("h2"), h3: all("h3"), h4: all("h4"), p: all("main p, .vc_row p, p", 3),
    header: pick(q("header, #header, .header, #masthead, .site-header"), T),
    headerLinks: [...document.querySelectorAll("header a, #header a, .header a, #masthead a, nav a")].filter(a=>a.offsetParent).slice(0,6).map(a=>pick(a,T)),
    nav: pick(q("nav, .nav, #nav, .menu, #menu"), T),
    footer: pick(q("footer, #footer, .footer, .site-footer"), T),
    footerLinks: all("footer a, #footer a, .footer a", 4),
    bodyLinks: links.filter(a=>!a.closest("header,nav,footer,#header,#footer,.header,.footer")).slice(0,5).map(a=>pick(a,T)),
    buttons: [...all("button, input[type=submit], .btn, .button, .vc_btn3, .wpb_button, .gform_button", 8), ...btnLike],
    inputs: all("input[type=text], input[type=email], textarea, select", 3),
    logo: [...document.querySelectorAll("img")].filter(i=>/logo/i.test(i.src+i.className+i.alt)).map(i=>({src:i.src, alt:i.alt, w:i.clientWidth, h:i.clientHeight, natural:[i.naturalWidth,i.naturalHeight], parentBg:getComputedStyle(i.parentElement).backgroundColor, containerBg:(()=>{let e=i;while(e&&getComputedStyle(e).backgroundColor==="rgba(0, 0, 0, 0)")e=e.parentElement;return e?getComputedStyle(e).backgroundColor:null})()})),
    bgSections: [...document.querySelectorAll("section, .vc_row, .vc_section, div[class*=row], footer, header")].map(e=>({cls:(e.className||"").toString().slice(0,60), bg:getComputedStyle(e).backgroundColor, bgImg:getComputedStyle(e).backgroundImage.slice(0,80), h:e.offsetHeight})).filter(x=>x.h>60 && (x.bg!=="rgba(0, 0, 0, 0)"||x.bgImg!=="none")).slice(0,25),
    fontsLoaded: [...document.fonts].filter(f=>f.status==="loaded").map(f=>f.family+" "+f.weight+" "+f.style),
    maxWidth: (()=>{const c=q(".vc_row .container, .container, .wrap, .site-content, #content, main");return c?{cls:c.className,w:c.clientWidth,maxW:getComputedStyle(c).maxWidth}:null})(),
    icons: [...document.querySelectorAll("i[class*=fa], svg")].slice(0,10).map(e=>({cls:(e.className||"").toString().slice(0,60), color:getComputedStyle(e).color, size:getComputedStyle(e).fontSize})),
  };
})()`;
for (const [width, label] of [
  [1440, "desktop"],
  [390, "mobile"],
]) {
  const ctx = await b.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  for (const path of pages) {
    const url = "https://www.pamarenterprises.com" + path;
    try {
      await page.goto(url, { waitUntil: "load", timeout: 60000 });
      await page.waitForSelector("footer, #footer, .footer", { timeout: 20000 }).catch(() => {});
      await page.waitForTimeout(2500);
      await page.evaluate(async () => {
        window.scrollTo(0, document.body.scrollHeight);
        await new Promise((r) => setTimeout(r, 800));
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 500));
      });
      const file = `${slug(path)}-${label}.png`;
      await page.screenshot({ path: `${OUT}/screenshots/${file}`, fullPage: true });
      if (label === "desktop") computed[path] = await page.evaluate(probe);
      // hover/focus state on first button-like element (desktop, home)
      if (label === "desktop" && path === "/") {
        const states = await page.evaluate(async () => {
          const els = [...document.querySelectorAll("a, button")]
            .filter(
              (e) => e.offsetParent && getComputedStyle(e).backgroundColor !== "rgba(0, 0, 0, 0)",
            )
            .slice(0, 3);
          return els.map((e) => ({
            text: e.innerText.trim().slice(0, 40),
            cls: (e.className || "").toString().slice(0, 60),
            rest: { bg: getComputedStyle(e).backgroundColor, color: getComputedStyle(e).color },
          }));
        });
        computed.buttonStates = states;
        for (let i = 0; i < states.length; i++) {
          const loc = page
            .locator("a, button")
            .filter({ hasText: states[i].text.split("\n")[0] })
            .first();
          try {
            await loc.hover({ timeout: 3000 });
            await page.waitForTimeout(400);
            states[i].hover = await loc.evaluate((e) => ({
              bg: getComputedStyle(e).backgroundColor,
              color: getComputedStyle(e).color,
              border: getComputedStyle(e).borderColor,
            }));
            await loc.focus();
            states[i].focus = await loc.evaluate((e) => ({
              outline: getComputedStyle(e).outline,
              boxShadow: getComputedStyle(e).boxShadow,
            }));
          } catch (e) {
            states[i].err = e.message.slice(0, 80);
          }
        }
        // nav link hover
        try {
          const nl = page.locator("nav a, #menu a, .menu a").filter({ hasText: "About" }).first();
          computed.navHover = {
            rest: await nl.evaluate((e) => ({
              color: getComputedStyle(e).color,
              bg: getComputedStyle(e).backgroundColor,
            })),
          };
          await nl.hover();
          await page.waitForTimeout(400);
          computed.navHover.hover = await nl.evaluate((e) => ({
            color: getComputedStyle(e).color,
            bg: getComputedStyle(e).backgroundColor,
            textDecoration: getComputedStyle(e).textDecorationLine,
          }));
        } catch (e) {
          computed.navHoverErr = e.message.slice(0, 80);
        }
        // body link hover
        try {
          const bl = page
            .locator("main a, .vc_row a, .entry-content a")
            .filter({ hasNotText: /^\s*$/ })
            .first();
          computed.linkHover = {
            text: await bl.innerText(),
            rest: await bl.evaluate((e) => ({
              color: getComputedStyle(e).color,
              td: getComputedStyle(e).textDecorationLine,
            })),
          };
          await bl.hover();
          await page.waitForTimeout(400);
          computed.linkHover.hover = await bl.evaluate((e) => ({
            color: getComputedStyle(e).color,
            td: getComputedStyle(e).textDecorationLine,
          }));
        } catch (e) {
          computed.linkHoverErr = e.message.slice(0, 80);
        }
      }
      console.log("ok", label, path);
    } catch (e) {
      console.log("FAIL", label, path, e.message.slice(0, 120));
    }
  }
  await ctx.close();
}
await b.close();
await writeFile(`${OUT}/computed-styles.json`, JSON.stringify(computed, null, 2) + "\n");
console.log("wrote computed-styles.json");
