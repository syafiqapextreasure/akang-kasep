# Akang Kasep website

Eleven responsive screens based on the approved Warm Architectural designs: Home, About, Services, Projects, Project detail, Before & After, Credentials, Contact, Privacy, Enquiry confirmation and 404. About combines both approved panels; historical contracts appear on Projects.

Built as prerendered HTML with local fonts, lossless WebP photographs, a small JavaScript enhancement layer, and a Cloudflare Worker/D1 enquiry endpoint. Public URLs have no `.html` suffix. No frontend framework or third-party runtime is required.

## Local preview

Use Node.js 24 LTS and npm.

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:4321`. Local test enquiries use an in-memory SQLite database and disappear when the preview stops. `npm run build` regenerates `dist/`; restart the preview after changing Worker code. Do not serve `dist/` directly as a production site: the Worker supplies canonical URLs, the form endpoint and status handling.

## Install on Cloudflare Workers

```sh
npm ci
npx wrangler login
npm run deploy
```

`npm run deploy` builds the website, runs `cf:setup`, then publishes the Worker only after setup succeeds. Setup creates or reuses the exact database name `akang-kasep-enquiries`, writes its real ID into the build's `wrangler.jsonc`, and applies pending D1 migrations. Repeated builds reuse the database and preserve enquiries. No account-specific ID needs to be committed. The script handles paths containing spaces on Windows. `npm run cf:setup` remains available for database setup alone.

For a Git-connected Cloudflare Worker, use these settings under **Settings > Build > Build configuration**:

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Deploy command | `npm run deploy` |
| Root directory | repository root (`/`) |

**Change an existing `npx wrangler deploy` deploy command to `npm run deploy`.** The direct Wrangler command skips this application's migration step. Save the setting and retry the latest commit. The build's Cloudflare credentials need D1 read/write access as well as Worker deployment access. If setup reports a permissions error, check the build API token's account and D1 permissions in Cloudflare; never paste the token into source code or chat.

Deployment error **10181** with database `00000000-0000-0000-0000-000000000000` means an older checkout attempted to bind a placeholder database. That placeholder has been removed. Select the latest commit and the deploy command above; the setup step resolves the real ID before publishing. Database setup/migration failure stops deployment instead of publishing a form with missing tables. Account credentials stay in Wrangler/Cloudflare, never in Git.

The default canonical origin is the request's HTTPS hostname. When a custom domain is connected, add `SITE_URL` to `vars` in `wrangler.jsonc`, for example `https://your-approved-domain.example`, and redeploy. Keep one primary public hostname. No DNS changes or live deployment were performed during the build task.

Optional production hardening: set independent random secrets using `npx wrangler secret put RATE_LIMIT_SALT` and `npx wrangler secret put RECEIPT_SECRET`; enter values only into Wrangler's secure prompt. Rotating the receipt secret changes new receipt tokens; existing stored receipts remain valid until their one-hour browser cookie expires.

## Enquiry handling

Accepted submissions are stored in your Cloudflare D1 `enquiries` table. Read them through your Cloudflare account's D1 console, with account access limited to the people handling enquiries. A stored submission is not a sent email or a qualified lead. **Automatic email notifications and a public admin dashboard are not configured.** The company telephone/email links are available independently of the form.

The endpoint validates required fields, requires either email or phone, checks origin, uses a honeypot, limits submission volume, and prevents duplicate requests. It records a reference only after storage succeeds. A receipt cookie is HttpOnly, SameSite=Lax and Secure on HTTPS. Direct visits to `/thank-you` show a neutral state until a valid receipt is present. Failure preserves the visitor's inputs and provides direct contact alternatives.

A daily scheduled Worker removes enquiry records older than 90 days and short-lived rate-limit records. Keep `RETENTION_DAYS` consistent with the public Privacy Notice; update both if the owner changes the policy. Confirm the responsible enquiry handler and retention policy when installing. Cloudflare may retain recovery history beyond application deletion under its platform backup policy.

After deployment, submit one controlled enquiry and confirm its reference in D1 before directing visitors to the form. Check the scheduled trigger in Cloudflare. The local tests do not establish production delivery or database access.

## Editing content and assets

| Location | Purpose |
| --- | --- |
| `src/content/*.html` | Editable page bodies; one source per screen |
| `src/components.mjs` | Shared header/footer, brand, metadata, JSON-LD and reusable helpers |
| `src/data.mjs` | Company/schema values, route metadata and documented content records |
| `public/styles.css` | Responsive layout, paper/forest backgrounds, typography and motion |
| `public/site.js` | Menus, gallery, filters, stage story and form enhancement |
| `src/worker.mjs` | Clean routes, enquiry API, receipt handling and retention |
| `public/assets/` | Original-logo derivatives, photographs, textures and licensed local fonts |
| `docs/` | Source review, asset provenance, design audit, search research and final review |

When changing company facts, update the matching page HTML and `src/data.mjs` schema record together. Keep image `srcset` widths and `data-photo-id` consistent. Portrait photos use deliberate crops in cards; the full original remains available. Avoid reusing a lead image across pages or showing the same photo twice on one page. The progress gallery hides the stage currently shown in the main viewer.

The supplied project is still labelled **Ongoing / Working title**. Do not change it to Completed based on photographs. Historical dates are labelled **Profile date**, not completion dates. The 2009 experience entry is excluded because attribution predates the stated incorporation. The source review explains the older director/capital discrepancies and the newer SSM source used.

The original 23-page company-profile PDF contains private information and is not in the public assets. Credentials provide document details and a request path. Add a public-safe approved PDF only after preparing the appropriate version. No client logo, testimonial, review rating or unverified project value has been invented.

The raster designs contain no font metadata. DM Serif Display and Manrope are the documented visual match. Main reading text starts at 18px and scales to approximately 28px on a 2560px display. Native browser zoom remains available. Some page heights/line breaks intentionally differ from the raster references to preserve readability.

## Checks and visual review

```sh
npm run build
npm test
npx wrangler deploy --dry-run
```

With the local preview running, on a machine with Microsoft Edge:

```sh
node scripts/capture.mjs --matrix
node scripts/browser-check.mjs
node scripts/accessibility-check.mjs
node scripts/performance-check.mjs
```

Set `BROWSER_PATH` for another installed Chromium browser in the capture/browser/accessibility scripts. The performance script uses Edge. Results are in `review/*.json`; screenshots are ignored by Git. Browser tests use only the local preview and synthetic `example.test` enquiries.

See `docs/final-review.txt` for the specification audit, measured results and verification limits. Full-resolution side-by-side images are delivered separately in the local review package, not as website assets.

The optional `scripts/prepare-assets.mjs` uses the original local source pack and is not needed to build or deploy this repository. All required web assets are committed. `scripts/optimize-responsive.mjs` can regenerate extra responsive derivatives from the committed originals.

## Search and operations

Route titles/descriptions target relevant construction/maintenance searches in Kuala Terengganu. Visible company facts, semantic HTML, GeneralContractor/Breadcrumb JSON-LD, canonical links and a generated XML sitemap support indexing and machine understanding. Placeholder project detail/progress, confirmation and 404 routes are excluded from the sitemap and marked noindex. No analytics or advertising pixels are installed. No search or AI-answer placement is guaranteed.

Git records the source history. Roll back with a reviewed Git revert, build and redeploy. D1 recovery uses Cloudflare Time Travel within the window available to your plan. Avoid destructive schema changes; preserve backups before migrations. Do not log enquiry bodies or copy enquiry exports into Git.

Official platform references checked for this implementation:

- [Worker assets binding](https://developers.cloudflare.com/workers/static-assets/binding/)
- [Clean HTML URL handling](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/)
- [D1 Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/)
- [Scheduled Worker triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)

Font licenses are included in `public/assets/LICENSE-*.txt`. Photographs and company branding remain the owner's materials.
