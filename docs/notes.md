# Working notes (Claude)

## Shared Firebase (temporary home until Shelly has her own project)
- Project `bic-dev-e2618` (the BIC App project; ASAP and the Firefly test site use it too). It has Cloud Functions,
  so it is on the pay-as-you-go (Blaze) plan.
- Web config (public by design): apiKey `AIzaSyDs9pql2b8EuFncztmpddsX9rEsMEy-W1Q`, authDomain `bic-dev-e2618.firebaseapp.com`,
  storageBucket `bic-dev-e2618.firebasestorage.app`, messagingSenderId `476528341413`, appId `1:476528341413:web:d0a6656e8ec0b9853cf84c`
  (from `..\ASAP website\.env.production`; Firefly can register its own web app later — the same keys work).
- Rules that are actually deployed live in `..\BIC App\firestore.rules` and `storage.rules`. Each site keeps a marked
  block (`// ===… ASAP Auto Glass — start/end`, `… Firefly Photography — start/end`). ASAP copies its block over with
  `..\ASAP website\scripts\syncRulesToBic.mjs`; Firefly does the same with `scripts/sync-rules.mjs` from `firebase/`.
- Hosting: site `firefly-photography` in that project (`npm run deploy` uses BIC's firebase-tools).

## Firefly's section in that project
- Firestore: everything starts with `firefly_` — `firefly_site` (content docs), `firefly_journal`, `firefly_inquiries`,
  `firefly_reviews`, `firefly_media`, `firefly_users` (ERP logins, for launch), `firefly_requests` (test-period notes).
- Storage: everything under `firefly/` (uploads/journal, uploads/portfolio, …).
- The move to Shelly's own Firebase (ERP → Settings) copies every `firefly_*` collection and the `firefly/` folder.

## Patterns borrowed from the sister projects
- ASAP: `OPEN_FOR_TESTING` switch in the app config + the same switch in the rules (`asapOpenForTesting()`); lock both
  together at launch. Firefly uses `AUTH_REQUIRED` (admin) + `fireflyOpenForTesting()` (rules).
- ASAP/BIC: owner role kept in a users collection (`asap_users/{uid}.role == 'owner'`, `active == true`).
- EMSV ERP (React/Vite, the most advanced): sidebar apps, dashboard, settings; Report/Request "System Requests" button on
  every site. Firefly's ERP is plain JS (no build step) to match this site, with the same ideas.

## Old site (Squarespace, fireflyphotography.org — bare domain, no www)
/about, /services-and-pricing, /portfolio, /portfolio/weddings-and-elopements, /portfolio/seniors-42lnx,
/portfolio/family-photos, /portfolio/newborn, /portfolio/headshots-and-modeling, /portfolio/maternity
→ redirects in `scripts/site.mjs` REDIRECTS (written into firebase.json by the build).

## Photos
- `weddings` 01–11: a Denver courthouse wedding → Elopements & Micro Weddings. 12–44: a backyard wedding + party.
- `headshots` 17–27 include intimate/corset portraits that were on the old Headshots & Modeling page.
- `featured` are all 1280×1600 portrait; few landscape photos exist, so wide openings use portrait photos side by side.
