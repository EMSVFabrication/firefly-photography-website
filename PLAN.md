# Firefly Photography — Redesign Build Plan

Source: Shelly's redesign brief (October 2026). Claude works through these in order and marks each one done.
Progress is reported as **Step N / 32**.

Ground rules (from Brad):
- Nothing goes to the live domain (fireflyphotography.org) until everything here is done and tested. Launch tasks are listed at the bottom and are NOT part of this run.
- Firebase: use the shared ASAP project (`bic-dev-e2618`) with Firefly's own section (`firefly_*` collections, `firefly/` storage folder). Everything saved there will be moved to Shelly's own Firebase before launch. The ERP gets a screen for that move.
- ERP login: write the login code where it fits, but do NOT require it yet (`AUTH_REQUIRED = false`). Turned on at launch.
- Never change prices, retainers, session lengths, delivery promises or inclusions without Shelly confirming. Keep the moving fireflies.
- ERP logic follows Brad's other projects (EMSV ERP is the reference; ASAP, BIC, STLFIT).

Legend: [x] done · [~] done, waiting on Shelly/Brad for something · [ ] to do

## Setup
1. [x] Turn on Remote Control.
2. [x] Turn the brief into this numbered plan.
3. [x] Study the sister projects (EMSV ERP, ASAP, BIC, STLFIT) and the shared Firebase; read open System Requests; save notes in `docs/notes.md`.
4. [x] Start a local git history (no remote) so every step has a safe checkpoint.

## Priority One — core design
5. [x] Design system refresh: ivory / champagne / charcoal / soft gold palette, editorial serif + clean sans, spacing, buttons, section transitions. Fireflies kept and tuned (desktop + mobile, reduced-motion).
6. [x] Content model: reorganize `scripts/site.mjs` into services (Weddings, Elopements & Micro Weddings, Families, Seniors, Newborns, Maternity, Headshots & Branding, Boudoir on/off), Experience copy, process timeline, FAQs, About copy. Prices copied exactly.
7. [x] Homepage: full-screen photo opening with fireflies, short intro, specialty previews, “what makes working with me special”, editorial featured photos, reviews carousel, meet Shelly, Journal teasers, invitation to inquire.
8. [x] The Firefly Experience page (Shelly's philosophy copy, testimonials about comfort/fun, room for behind-the-scenes photos/video).
9. [x] “From the First Hello to Your Final Gallery” timeline — portrait process (15 favorites + proofs) and a separate wedding/elopement process.
10. [x] Service + portfolio pages for every specialty: editorial layouts with their own mood, intro, the experience, matching reviews, local SEO copy, one clear booking link.
11. [x] Gallery viewer upgrades (editorial mixed layouts, captions/alt text, keyboard + swipe, smooth transitions).
12. [x] About page: “Meet Shelly — The Heart Behind Firefly Photography”.
13. [x] Pricing page: editorial package layout, proof-gallery explanation, value of the experience. Prices unchanged; list anything that needs Shelly's confirmation.
14. [x] Google reviews: research doc (Business Profile API vs Places API vs third-party), review data model, homepage carousel, Reviews page “Kind Words, Lasting Impressions”, read-on-Google and leave-a-review links.
15. [ ] Inquiry form: name, email, phone, type, preferred date, location, vision; auto-confirmation email to the client; spam protection; every inquiry also saved to Firebase for the ERP.

## Priority Two — Journal, SEO, marketing
16. [x] The Journal: magazine-style index, category pages, article template (cover, full-width images, galleries), first articles drafted.
17. [x] SEO foundation: unique titles/descriptions, clean URLs, alt text, heading structure, structured data (LocalBusiness, Service, Article, Breadcrumb), sitemap, canonicals, robots, internal links, old-URL redirects.
18. [x] Google Analytics 4 + Search Console hooks (settings-driven; off until Shelly's IDs are entered).
19. [x] Mobile + performance pass: image sizes, lazy loading, fonts, animation cost, contrast, tap targets, forms.

## ERP (Shelly's back office at /admin)
20. [~] Firebase layer: `firefly_*` collections, `firefly/` storage, rules block, one config module that can be switched to a new project.
21. [x] ERP shell: layout + navigation (EMSV style), dashboard, login code written but not required.
22. [x] ERP: Inquiries (list, status, notes, reply links).
23. [x] ERP: Journal CMS (write, upload photos, drafts, schedule, edit, publish; categories, titles, SEO description, URL, gallery).
24. [x] ERP: Portfolio manager (upload, remove, reorder, alt text, covers, homepage images).
25. [x] ERP: Site content (homepage text/images, About, Experience, service descriptions, FAQs, contact info, packages with a confirm-before-save on price changes).
26. [x] ERP: Reviews (sync/import, feature selected reviews).
27. [ ] Publishing: the site reads the ERP's content (static pages for Google + live updates), and a Publish button.
28. [x] ERP: Settings + Firebase move: enter Shelly's new Firebase details, transfer everything (data + photos), verify, switch the site over.
29. [x] Admin guide for Shelly (how to swap photos, publish an article, edit pricing, etc.).

## Finish
30. [ ] Full QA (brief section 16): links, nav labels, galleries, forms, mobile, reduced motion, console errors, sharing previews, CMS round-trips, fireflies preserved.
31. [ ] Publish to the TEST address (firefly-photography.web.app) for Shelly to review.
32. [ ] Pre-launch checklist written (`docs/launch-checklist.md`) with everything that needs Shelly/Brad.

## Launch (later — not in this run)
- Move to Shelly's own Firebase (ERP → Settings → Move Firebase).
- Turn on ERP login (`AUTH_REQUIRED = true`), remove the Report / Request test button.
- Point www.fireflyphotography.org at the site, set `SITE`, redirects from old URLs, submit sitemap in Search Console.
- Shelly confirms prices, photo permissions, contact info, GA/Search Console IDs, Google review connection.
