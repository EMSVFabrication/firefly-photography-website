# Setting up Shelly's laptop and moving to her Firebase

About 30–45 minutes. Do it together on her laptop, signed in to **her** Google account (the one that owns her Firebase project).

## 1. Install the tools (once)
1. **Node.js** — https://nodejs.org → download the **LTS** version → install with the default options.
2. **Git** — https://git-scm.com/downloads → install with the default options.
3. **Claude Code** — https://claude.com/claude-code → install the desktop app (or the CLI) and sign in with her Claude account.

## 2. Download the code
Open **Terminal** (Mac) or **PowerShell** (Windows) and run these one at a time:

```bash
cd ~/Documents
```

```bash
git clone https://github.com/EMSVFabrication/firefly-photography-website.git "Firefly Photography website"
```

```bash
cd "Firefly Photography website"
```

```bash
npm install
```

No GitHub login is needed to download. `npm install` takes a minute or two.

## 3. Connect her Firebase
1. Sign the Firebase tools in to her Google account:

   ```bash
   npx firebase login
   ```

   A browser opens; choose her Google account and allow access.
2. In the **Firebase console** (console.firebase.google.com) → her project → ⚙ **Project settings** → **Your apps**.
   If there's no web app yet, click **</>** (Web), name it "Firefly website", don't tick Hosting, and register it.
   Under **SDK setup and configuration** choose **Config** and copy the whole `{ … }` block.
3. Make sure these are on in her project (left menu): **Firestore Database** (Create database → production mode),
   **Storage** (Get started), **Authentication → Sign-in method → Email/Password** (enable), and the **Blaze** plan.
4. Point the folder at her project:

   ```bash
   npm run use-firebase
   ```

   It creates `firebase/new-project.txt` — open that file, paste the config block in, save, then run the same command again.
   It answers "✓ This folder now uses Firebase project …".

## 4. Put everything on her Firebase

```bash
npm run deploy-all
```

This deploys the database rules, the Publish function and the website. It prints the new address, like
`https://<her-project>.web.app`. The very first function deploy can stop while Google switches on what it needs —
just run `npm run deploy-all` again.

## 5. Move the data (content, Journal, reviews, inquiries, people, photo library)
1. Open the **old** ERP: https://firefly-photography.web.app/admin/ → **Settings → Move Firebase**.
2. Paste the same config block → **1. Check the new project** (both lines should get a ✓).
3. **2. Copy everything** → **3. Compare** (the numbers should match) → **4. Switch to the new Firebase**.
4. Open the **new** ERP at `https://<her-project>.web.app/admin/` and press **Publish to website** (top right).
   After a minute the new site shows everything that was moved. Check a few pages.

*(If "Copy everything" reports failed files: the old bucket must allow the copy once — Settings → System shows the command for
Brad to run. Right now there are no uploaded photos to copy, so this shouldn't come up.)*

## 6. Save the switch in the code
In the project folder, open Claude Code (desktop app: **Open folder** → choose "Firefly Photography website"; CLI: run `claude`
in that folder) and say:

> Commit the switch to my Firebase project.

(Saving changes back to GitHub needs a GitHub account with access to the repository. Without one, her changes stay safely on her laptop.)

From then on she can ask Claude Code for changes in plain words — for example *"Do the system requests"*, *"Add a FAQ about
pets"*, or *"Deploy the website"*. `CLAUDE.md` in the folder tells Claude how everything works and what not to touch
(prices, the fireflies, genuine reviews).

## 7. Afterwards (Brad / Claude, from this PC)
- Clean up the shared project once her site checks out: remove the `firefly` functions
  (`npx firebase functions:delete publishOnRequest publishScheduled --project bic-dev-e2618`) and the Firefly block in
  `..\BIC App\firestore.rules` / `storage.rules`, then redeploy BIC's rules from the BIC folder.
- Pull her changes before working here: `git pull`.
- Continue with `docs/launch-checklist.md` (sign-in on, demo data out, domain, Google).
