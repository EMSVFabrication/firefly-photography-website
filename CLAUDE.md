# Firefly Photography website — notes for Claude Code

Website + back office (ERP) for **Firefly Photography**, Shelly Bowman's photography business in Denver & Littleton, CO.
Plain HTML/CSS/JS built by small Node scripts; Firebase (Hosting, Firestore, Storage, Auth, Cloud Functions). No framework.

## Ground rules (from the owners)
- **Never change prices, retainers, session lengths, delivery promises or package inclusions without Shelly confirming.**
- **Keep the moving fireflies** (canvas in `public/assets/site.js`) — they're the signature of the brand. Respect reduced motion.
- Reviews must always be genuine Google reviews, word for word. Never write or edit a review's text.
- Luxury editorial look: ivory / champagne / charcoal / soft gold, Cormorant Garamond + Manrope. No cheesy marketing copy.
- Nothing goes to the real domain (www.fireflyphotography.org) until the launch checklist (`docs/launch-checklist.md`) is done.
- Before deploying, run `npm run build` and `npm run check` (links, alt text, titles, one H1 per page). After deploying, open the site and check it.

## How it fits together
- `scripts/site.mjs` — starting content ("seed"): business info, services/galleries, packages & prices, reviews, Experience,
  process timeline, About, FAQs, Journal categories, old-site redirects, `SITE` and `LAUNCHED`.
- `scripts/journal-seed.mjs` — the first Journal stories. `scripts/photos.json` — the site's own photos (`public/img/<set>/NN.webp` + `-sm`).
- **ERP** at `/admin/` (`public/admin/`, plain ES modules + Firebase SDK from gstatic): Shelly edits content there. It saves to
  Firestore `firefly_site/{area}` (`{ value }`), `firefly_journal`, `firefly_reviews`, `firefly_media`, `firefly_inquiries`,
  `firefly_users`, `firefly_meta`; photos to Storage `firefly/media/<id>/{full,sm}.webp`.
- `scripts/content.mjs` lays the ERP's saved content over the seed. `scripts/render.mjs` renders every page in memory
  (`scripts/pages.mjs` = the pages, `scripts/lib.mjs` = page frame, header/footer, shared blocks).
- `scripts/build.mjs` writes `public/` and the hosting part of `firebase.json`.
- **Publish button**: the ERP adds a doc to `firefly_publish`; the Cloud Function in `functions-firefly/` (codebase `firefly`)
  re-renders with the same code (copied in by `scripts/prepare-functions.mjs`) and releases to Hosting. It also checks hourly for
  scheduled Journal stories that came due.
- `public/assets/site.css` / `site.js` — the whole look and behaviour (fireflies, galleries/lightbox, review carousel, process tabs,
  inquiry form → FormSubmit email + `firefly_inquiries`, live page for Journal stories newer than the last build).
- `firebase/config.json` — which Firebase project the site and ERP use. `firebase/firestore.rules`, `storage.rules` — the rules.

## Commands
- `npm install` — once (includes the Firebase tools).
- `npm run serve` — site at http://localhost:5210 (ERP at /admin/). `npm run build` — build `public/` (`FF_OFFLINE=1` = seed only).
- `npm run check` — site checker.
- `npm run use-firebase` — point the folder at a Firebase project (paste its config into `firebase/new-project.txt` first).
- `npm run deploy` (website) · `npm run deploy-rules` · `npm run deploy-functions` · `npm run deploy-all` — to the project in `.firebaserc`.
  If a website deploy fails with "Failed to make request", run it again (the script already retries once).

## Test period switches (flip at launch — see docs/launch-checklist.md)
- `public/admin/js/config.js` `AUTH_REQUIRED = false` and `fireflyOpenForTesting()` = true in both rules files: ERP needs no sign-in.
- `scripts/site.mjs` `LAUNCHED = false`: search engines are kept away (robots + noindex). `SITE` = the test address.
- "Report / Request" button and the "ERP" shortcut in the header (`scripts/lib.mjs`, `public/assets/requests.js`).
- Demo data (Brad Dinges, Danielle Fritz, Avrie Fritz — all `demo: true`): ERP → Settings → System → Remove demo data.

## "Do the system requests"
Read the open notes from Firestore `firefly_requests` (REST, public during testing; project + apiKey in `firebase/config.json`),
build each one, mark it done (`status: done`, `doneAt`, `doneBy: Claude`, `doneNote`), then deploy. A note with `hasPicture`
has its screenshot at `firefly_requests/<id>/picture/screen` (`dataUrl`).
