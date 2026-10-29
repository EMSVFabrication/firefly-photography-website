# Firefly Photography website

New site for Firefly Photography (Shelly Bowman, Denver & Littleton, CO), replacing fireflyphotography.org.
Redesign plan and progress: `PLAN.md`. What's left before launch: `docs/launch-checklist.md`.

## How it fits together
- `scripts/site.mjs`: the starting content (business details, services, packages and prices, reviews, Experience/About
  copy, FAQs, redirects) plus `SITE` / `LAUNCHED`. `scripts/journal-seed.mjs` holds the first Journal stories.
- **The ERP** (`/admin`, plain JS + Firebase): Shelly edits all of that there. Saved content lives in Firebase
  (`firefly_*` collections, `firefly/` in Storage) and is laid over the seed at build time (`scripts/content.mjs`).
- `scripts/render.mjs`: renders every page in memory (`scripts/pages.mjs` + `scripts/lib.mjs`). Used by
  `scripts/build.mjs` (writes `public/`) and by the Publish function (`functions-firefly`, rebuilds and releases the site when
  Shelly presses "Publish to website", and hourly for scheduled stories).
- `public/assets/site.css`, `site.js`: the look and the behaviour (fireflies, galleries, carousel, inquiry form, live Journal page).
- `public/img/<gallery>/NN.webp` (+ `-sm`): the site's own photos, listed in `scripts/photos.json`.
- `firebase/`: which Firebase project is used (`config.json`) and Firefly's rules (`firestore.rules`, `storage.rules`).

## Commands
- `npm install`: once (includes the Firebase tools).
- `npm run serve`: the site on this PC at http://localhost:5210 (ERP at /admin/).
- `npm run build`: build `public/` (reads the ERP's saved content; `FF_OFFLINE=1` = seed only).
- `npm run check`: broken links, missing alt text, titles and descriptions, one H1 per page.
- `npm run use-firebase`: point the folder at a Firebase project (`firebase/config.json` + `.firebaserc`).
- `npm run deploy` (website), `deploy-rules`, `deploy-functions`, `deploy-all`: to the project in `.firebaserc`.
  In the shared project, rules are deployed as the Firefly block only (through `..\BIC App`).

**Moving to Shelly's laptop and Firebase:** `docs/handover.md`.

## Shared Firebase (temporary)
Firefly borrows the ASAP/BIC project `bic-dev-e2618` until launch. ERP → Settings → Move Firebase copies everything to
Shelly's own project and switches over (`docs/notes.md`, `docs/launch-checklist.md`).

## TEST PERIOD
- ERP sign-in is built but not required (`public/admin/js/config.js AUTH_REQUIRED`, rules `fireflyOpenForTesting()`).
- The "Report / Request" button at the top shows for everyone and saves notes to `firefly_requests`. Take it out before launch.

## "Do the system requests" (for Claude)
When the owner says this, don't ask them to paste anything: read the notes straight from the database, build each one,
mark it done, then publish (`npm run deploy`; if the release step fails with "Failed to make request", run it again).
- Read: `GET https://firestore.googleapis.com/v1/projects/bic-dev-e2618/databases/(default)/documents/firefly_requests?pageSize=100&key=<REQUESTS.apiKey>`
  Each note: `kind` (bug / change), `text`, `pageLabel`, `status` (new / working / done), `createdAt`, `device`, `errors`, `hasPicture`.
- Picture: `GET .../firefly_requests/<id>/picture/screen?key=<apiKey>`, field `dataUrl` (JPEG base64).
- Mark done: `PATCH .../firefly_requests/<id>?updateMask.fieldPaths=status&updateMask.fieldPaths=doneAt&updateMask.fieldPaths=doneBy&updateMask.fieldPaths=doneNote&key=<apiKey>`
  with `{"fields":{"status":{"stringValue":"done"},"doneAt":{"stringValue":"<ISO>"},"doneBy":{"stringValue":"Claude"},"doneNote":{"stringValue":"<what was built>"}}}`

The inquiry form emails ShellyLBowman@gmail.com through FormSubmit (with an automatic confirmation to the client) and also
saves each inquiry to `firefly_inquiries` for the ERP. The very first inquiry sends her an "activate" email to click once.
