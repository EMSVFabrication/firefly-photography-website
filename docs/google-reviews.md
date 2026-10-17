# Google reviews on the Firefly site: options and recommendation

*Research for brief section 8, October 2026. Prices and approval rules change, so check them again when we set this up.*

## What Shelly asked for
Genuine Google reviews shown automatically: current star rating, total count, new reviews appearing on their own, a
beautiful carousel and a Reviews page, selected reviews featured, links to read reviews on Google and to leave one, and
access to the **full** review collection if possible.

## The three ways to do it

### 1. Google Business Profile API (official, full collection) — recommended
- **What it gives:** every review on the profile (paged), with star rating, text, reviewer display name, date and
  Shelly's replies, plus the data to compute the rating and count. Reviews are read through the v4 `accounts.locations.reviews`
  endpoints.
- **Cost:** no charge for the API itself.
- **Access:** Google approves each project by hand. Steps:
  1. A Google Cloud project, ideally inside Shelly's own Firebase/Google account (the same one we move to before launch).
  2. Submit Google's "Application for Basic API Access" **from an email that is an owner or manager of the Firefly
     Photography Business Profile**. The profile must be verified, typically active 60+ days, and list the website.
     **The website on the profile has to match the one on the application.** Rejections for a mismatch are common, so
     update the profile's website to www.fireflyphotography.org first.
  3. Until approval the quota shows 0 requests/minute; after approval it is about 300/minute, far more than needed.
  4. Approval reportedly takes anywhere from a few days to a few weeks.
- **Sign-in:** Shelly signs in once with Google (OAuth, `business.manage` scope) from ERP → Settings → Google reviews.
  The server keeps the refresh token; the browser never sees it.
- **Refresh:** a small scheduled Cloud Function (once a day, plus a "Sync now" button in the ERP) copies all reviews
  into `firefly_reviews`. The site rebuilds and shows them in our own design, so there's no third-party widget, nothing slows
  the page, and the styling matches the rest of the site exactly.
- **Rules we follow:** reviews are shown word for word with the reviewer's name and rating, never edited. Featuring
  selected reviews is fine, but the overall rating and count always reflect *all* reviews. We do **not** add
  review stars to Google search results through structured data on our own site (Google ignores
  "self-serving" review markup for a business's own reviews), so the site's structured data leaves `aggregateRating` out.

### 2. Google Places API (official, limited)
- **What it gives:** the profile's rating, total review count, and **at most 5 reviews** (Google's "most relevant").
  It cannot return the full collection.
- **Cost:** pay per request at the Places "Enterprise + Atmosphere" tier (the reviews field). One refresh a day is about
  30 calls a month, normally inside Google's monthly free usage, but it needs a billing account and an API key.
- **Access:** immediate (no approval), only the Place ID is needed.
- **Use it for:** the live rating and count while the Business Profile API application is pending.

### 3. Third-party review widgets
Trustindex, Elfsight, EmbedSocial and similar connect to the profile and embed a widget, roughly $0–$30/month depending on
plan and how many reviews are shown.
- Pros: quick to set up, auto-updates, some include "write a review" buttons.
- Cons: their script and styling sit on top of ours (harder to make truly elegant), they slow the page a little, branding
  on cheaper plans, and a monthly fee forever. Usable as a fallback if Google declines API access.

## Recommendation
1. **Now (built):** the site shows Shelly's 8 genuine Google reviews word for word, with rating and count settings, links,
   a carousel, a Reviews page with topic filters, and featured reviews. The ERP's Reviews screen manages them
   (feature, order, topics, add new ones by pasting them exactly as written on Google).
2. **Shelly applies for Business Profile API access** (steps above, about 15 minutes, from her Google account).
   Once approved, we turn on the daily sync. New reviews then appear automatically and the rating/count are calculated
   from all of them.
3. **Optional bridge:** if she wants the live rating/count before approval, add a Places API key in ERP → Settings and
   the sync fills in rating, count and the newest 5 reviews.
4. **Fallback:** if Google declines access, Trustindex (or similar) feeding the same `firefly_reviews` collection.

## What we need from Shelly
- Confirm she's an owner of the Firefly Photography Google Business Profile, and the email she uses for it.
- Her profile's "Read reviews" link and "Ask for reviews" (write a review) link. Both are in the Business Profile
  dashboard; enter them in ERP → Settings → Google reviews.
- Make sure the profile's website field matches www.fireflyphotography.org before applying.

Sources: [Google Business Profile API in 2026 (Slashpost)](https://slashpost.ai/blogs/google-business-profile/google-business-profile-api-documentation-2026),
[How to set up GBP API access (Unified.to)](https://unified.to/blog/how_to_set_up_google_business_profile_api_access_and_get_oauth_2_credentials),
[GBP quotas and limits (MapsLeads)](https://www.mapsleads.co/blog/google-business-profile-api-quotas-limits),
[Google forum: access request still 0 QPM](https://discuss.google.dev/t/gbp-api-access-request-no-response-quota-still-0-qpm-after-resubmission/380564),
[Places API usage and billing (Google)](https://developers.google.cn/maps/documentation/places/web-service/usage-and-billing?hl=en),
[Place data fields (Google)](https://developers.google.cn/maps/documentation/places/web-service/data-fields).
