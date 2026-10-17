// Firefly ERP settings.
// TEST PERIOD (owner 2026-10-17: "do not worry about creating log ins … don't require a log in until we launch"):
// AUTH_REQUIRED = false opens the ERP without signing in. At launch set it to true AND fireflyOpenForTesting() to
// false in firebase/firestore.rules + storage.rules (then sync + deploy the rules). The sign-in screen, the people list
// (Settings → People) and the roles are already built; they just aren't enforced yet.
export const AUTH_REQUIRED = false;

export const SDK = 'https://www.gstatic.com/firebasejs/10.12.2';

// every collection Firefly owns (the Firebase move copies all of these + the firefly/ Storage folder)
export const COLLECTIONS = ['firefly_site', 'firefly_journal', 'firefly_reviews', 'firefly_media', 'firefly_inquiries', 'firefly_users', 'firefly_meta', 'firefly_requests'];
export const SUBCOLLECTIONS = { firefly_requests: ['picture'] };
export const STORAGE_ROOT = 'firefly';

// ERP content areas → the seed field they start from (same list as scripts/content.mjs CONTENT_KEYS)
export const CONTENT_KEYS = { business: 'BIZ', settings: 'SETTINGS', packages: 'PACKAGES', services: 'SERVICES', experience: 'EXPERIENCE',
    process: 'PROCESS', about: 'ABOUT', home: 'HOME', faqs: 'FAQS', categories: 'JOURNAL_CATEGORIES' };
