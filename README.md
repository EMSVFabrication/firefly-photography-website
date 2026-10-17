# Firefly Photography website

New site for Firefly Photography (Shelly Bowman, Denver & Littleton, CO), replacing fireflyphotography.org.

- `scripts/site.mjs` — everything the site says: contact details, galleries, packages and prices, reviews, about text.
- `scripts/build.mjs` — writes the pages into `public/` (`npm run build`).
- `public/assets/site.css`, `site.js` — the look and the behaviour (fireflies, menu, photo viewer, inquiry form).
- `public/img/<gallery>/NN.webp` — the photos (from the old site), listed in `scripts/photos.json`.
- `npm run serve` — view it on this PC at http://localhost:5210.
- `npm run deploy` — build and publish to https://firefly-photography.web.app (Firebase Hosting, same project as the ASAP site).

TEST PERIOD: the "Report / Request" button at the top (public/assets/requests.js, the header button in
scripts/build.mjs, REQUESTS in scripts/site.mjs) shows for everyone and saves notes to firefly_requests in the shared
Firebase project (rules: the Firefly block in ..\BIC App\firestore.rules). Take it out before the site goes live.
Inside that window, "See requests" lists every note (To do / New / Working on it / Done / All) with its picture and
buttons to move it along; the top button shows how many are new.

## "Do the system requests" (for Claude)

When the owner says this, don't ask them to paste anything: read the notes straight from the database, build each one,
mark it done, then publish (`npm run deploy`; if the release step fails with "Failed to make request", run it again).

- Read the open notes (no login needed during the test period; the key is REQUESTS.apiKey in `scripts/site.mjs`):
  `GET https://firestore.googleapis.com/v1/projects/bic-dev-e2618/databases/(default)/documents/firefly_requests?pageSize=100&key=<apiKey>`
  Each note: `kind` (bug / change), `text`, `pageLabel`, `status` (new / working / done), `createdAt`, `device`, `errors`,
  `hasPicture`. Skip the ones whose status is `done`.
- Its screen picture (when `hasPicture` is true): `GET .../firefly_requests/<id>/picture/screen?key=<apiKey>`, field
  `dataUrl` (a JPEG as base64) — save it to a file and look at it.
- Mark one done when it's built and live:
  `PATCH .../firefly_requests/<id>?updateMask.fieldPaths=status&updateMask.fieldPaths=doneAt&updateMask.fieldPaths=doneBy&updateMask.fieldPaths=doneNote&key=<apiKey>`
  with `{"fields":{"status":{"stringValue":"done"},"doneAt":{"stringValue":"<ISO time>"},"doneBy":{"stringValue":"Claude"},"doneNote":{"stringValue":"<what was built>"}}}`

The inquiry form emails ShellyLBowman@gmail.com through FormSubmit (formsubmit.co). The very first inquiry sends her an
"activate" email that she clicks once; until then inquiries don't arrive.
