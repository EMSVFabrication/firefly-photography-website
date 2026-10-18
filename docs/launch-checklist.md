# Firefly Photography: pre-launch checklist

The redesign is built and tested on this PC. Nothing below has been done to the live domain. Work through it in order.

## A. Done 2026-10-17 (rules, Publish function and test site deployed with Brad’s OK)
These change the **shared** Firebase project (`bic-dev-e2618`, also used by BIC and ASAP), so the automatic safety check
stopped them until you approve. Each one only touches Firefly's own part.
1. **Deploy the Firefly database rules.** `npm run sync-rules` (copies Firefly's block into `..\BIC App\*.rules`), then
   `npm run deploy-rules` (deploys rules only, no BIC code). Until then the ERP opens and shows everything but can't save,
   and website inquiries arrive by email but aren't stored in the ERP.
   *Check first:* `..\BIC App\firestore.rules` and `storage.rules` have uncommitted ASAP + Firefly blocks. The ASAP block
   is already live (verified), so deploying sends nothing new except Firefly's section.
2. **Deploy the Publish function.** `npm run deploy-functions` (codebase `firefly` only). This makes the ERP's
   "Publish to website" button work, plus the hourly check for scheduled Journal stories.
3. **Publish the test site** for Shelly to review: `npm run deploy` → https://firefly-photography.web.app
   (stays hidden from Google: `LAUNCHED = false`).

## B. Shelly to confirm or provide
- [ ] **Prices and packages.** Nothing was changed from the old site, but please re-check every price, retainer, session length,
      delivery time and inclusion (ERP → Pricing).
- [ ] **Newborns and headshots:** which package or price applies? (They currently show Portrait & Lifestyle, $500. The old site
      didn't list them by name.)
- [ ] **Boudoir:** keep advertising it? (ERP → Settings → "Advertise boudoir". Its gallery is "shared privately" by design.)
- [ ] **Photo permissions:** every photo on the site is used with the client's permission (especially the intimate
      portraits in Headshots 17–27, and anything in Journal stories).
- [ ] **The four starting Journal stories** were drafted in her voice: read and adjust them (ERP → Journal).
- [ ] **FAQ answers, the About personal details and the wedding process steps.** Drafted from her brief and the old site;
      please confirm, especially that "Planning the day" and the 6-week delivery match how she works.
- [ ] **Behind-the-scenes photos** for the Experience page (ERP → Pages & text → The Firefly Experience).
- [ ] **Google:** the "Read reviews" and "Leave a review" links, current rating/count, GA4 measurement ID, and the Search
      Console verification code (ERP → Settings → Website & Google).
- [ ] **Google Business Profile API:** apply for access (docs/google-reviews.md) so reviews sync automatically.
- [ ] **FormSubmit:** click the one-time "activate" email after the first real inquiry. Inquiries go to ShellyLBowman@gmail.com.
      Is that the right business email?
- [ ] **Contact details** correct (ERP → Pages & text → Contact & business info).

## C. Move to Shelly's own Firebase
1. Shelly creates a Firebase project in her Google account and adds a Web app.
2. Turn on Firestore, Storage, and Authentication → Email/Password in it.
3. Deploy `firebase/firestore.rules` and `firebase/storage.rules` **as whole files** to that project.
4. Allow browser downloads from the old bucket once (ERP → Settings → System shows the `gsutil cors` command).
5. ERP → Settings → Move Firebase: paste config → Check → Copy everything → Compare → **Switch**.
6. Update `firebase/config.json` to the new project, `npm run build`.
7. Hosting: add a hosting site in her project (or keep this one). Update `package.json` deploy scripts
   (`--project`, site name), `functions-firefly` deploy target, and run `npm run deploy` + `npm run deploy-functions` there.
8. Add people (Shelly = owner) in ERP → Settings → People & sign-in. (Sign-in accounts don't copy from the browser:
   use `firebase auth:export` / `auth:import` if any already exist.)

## D. Switch on security
- [ ] `public/admin/js/config.js` → `AUTH_REQUIRED = true`.
- [ ] `firebase/firestore.rules` and `storage.rules` → `fireflyOpenForTesting()` returns `false`. Deploy.
- [ ] ERP → Settings → System → **Remove demo data** (demo records are also left out of the site automatically once `LAUNCHED` is true).
- [ ] Remove the ERP shortcut (header `erp-btn` + menu `nav__erp` in `scripts/lib.mjs`, and its CSS at the end of site.css).
- [ ] Remove the Report / Request test button: the header button in `scripts/lib.mjs`, the `requests.js` script tag,
      `REQUESTS` in `scripts/site.mjs`, `public/assets/requests.js`, and the `firefly_requests` rules block.
- [ ] Sign in to the ERP as Shelly and confirm a save works.

## E. Domain and Google (launch day)
- [ ] `scripts/site.mjs`: `SITE = 'https://www.fireflyphotography.org'` and `LAUNCHED = true`. Build + deploy.
- [ ] Firebase Hosting → Add custom domain `www.fireflyphotography.org` (and the bare domain → redirect to www). Update DNS at the
      registrar / Squarespace Domains: remove Squarespace's records for the site and add Firebase's A/TXT records. Keep any
      email (MX) records untouched.
- [ ] Old Squarespace addresses redirect automatically (`REDIRECTS` in `scripts/site.mjs` → firebase.json).
- [ ] Search Console: verify the domain property, submit `https://www.fireflyphotography.org/sitemap.xml`, and use
      "URL inspection" on the home page and a service page.
- [ ] Check the share previews (paste a link in Messages/Facebook) and Google Analytics real-time.
- [ ] Cancel the Squarespace site plan only after the new site is confirmed live (keep the domain).

## F. Final QA on the live domain (brief section 16)
Prices and packages accurate · fireflies preserved · galleries display · images used with permission · all links work
(`npm run check`) · the inquiry form delivers (send a real test) · Google reviews showing · mobile looks right · no placeholder
content · contact info correct · domain configured · site indexable · social links and share previews · ERP content
editing, publishing and Journal scheduling work · no client-facing labels that don't belong (the Report / Request
button is gone).
