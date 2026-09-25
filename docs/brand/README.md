# Brand Capture

The brand and style guides are built from the current live site, www.pamarenterprises.com.
`scripts/capture-brand.mjs` saves what that site actually uses into `docs/brand/source/`:

| Output         | Contents                                                                                                                    |
| -------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `summary.json` | Platform, colors ranked by use, font families and `@font-face` files, CSS variables, nav and button labels, logo candidates |
| `copy.md`      | Page titles, descriptions, headings, body copy, and footer text, page by page                                               |
| `pages/`       | Raw HTML for each page crawled (up to 20)                                                                                   |
| `css/`         | Every stylesheet the pages load                                                                                             |
| `assets/`      | Logo, icons, and images (logo candidates are prefixed `logo-`)                                                              |
| `screenshots/` | Desktop and mobile full-page screenshots (only when Playwright is installed)                                                |

## Run it

Needs Node 20 or newer and a normal internet connection.

```bash
npm run capture:brand

# Optional: add screenshots (package.json is not changed)
npm i --no-save playwright && npx playwright install chromium
npm run capture:brand
```

Then commit `docs/brand/source/` and push. Captured files are excluded from lint and format checks.
