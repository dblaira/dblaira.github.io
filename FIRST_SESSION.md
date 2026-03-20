# First session — how to work on this site

Plain-language guide for editing **`dblaira.github.io`** in Cursor (or any editor) and seeing changes locally and online.

## 1) What kind of site this is

| Piece | What it means |
| ----- | ------------- |
| **Next.js 15** | A React-based framework; pages and UI live mostly under `src/app/` and `src/components/`. |
| **TypeScript** | Source files use `.ts` / `.tsx` (typed JavaScript). |
| **Tailwind CSS** | Styling via utility classes; config in `tailwind.config.ts` and `postcss.config.js`. |
| **Supabase** | Cloud database/API for features like **Inbox** (`src/lib/supabase.ts`, inbox-related components). |
| **Vercel** | Hosting: when you push to GitHub, Vercel usually builds and deploys automatically. Live URL is often `dblaira-github-io.vercel.app` (check the repo **About** on GitHub). |

This is **not** a Jekyll/Ruby “classic GitHub Pages” site. You do **not** need Ruby for normal work here.

**Terms:** **Commit** = saved snapshot of your changes in git. **Push** = upload commits to GitHub. **Branch** = a line of history; this repo uses **`main`**.

---

## 2) Main folders you’ll touch

| Path | Purpose |
| ---- | ------- |
| **`src/app/`** | Routes: `page.tsx` files (home, `/inbox`, `/sleep`, etc.) and `layout.tsx` (shared chrome). |
| **`src/components/`** | Reusable UI (e.g. dashboards, inbox workflow). |
| **`src/lib/`** | Shared code (e.g. Supabase client, types). |
| **`public/`** | Static files served as-is (images, favicon, etc.). |
| **`package.json`** | Dependencies and **npm scripts** (`dev`, `build`, …). |
| **`next.config.ts`** | Next.js build/runtime settings — change only when you know why. |

---

## 3) Open this project in Cursor

1. In Cursor: **File → Open Folder…**
2. Choose the folder that contains **`package.json`** at the top level.  
   - If you use GitHub Desktop, pick the folder Desktop cloned (often something like `dblaira.github.io` on your Mac).  
   - This machine also has a clone at **`/Users/adamblair/Developer/dblaira.github.io`** — you can open that folder if you want.

Start a **new chat** in that window when you want help scoped to this repo.

---

## 4) Preview on your computer

**You need Node.js** (includes `npm`). **Why:** Next.js runs on Node for dev and build. **Simplest on macOS:** install **LTS** from [nodejs.org](https://nodejs.org), then quit and reopen Terminal so `node` and `npm` work.

**On your Mac, try this first:**

1. Open **Terminal**.
2. `cd` into the repo folder (the one with `package.json`).
3. Install dependencies (first time, or after pulling big changes):

   ```bash
   npm install
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

5. In the terminal output, open the URL it prints — usually **`http://localhost:3000`**.

**Fallback:** If `npm install` fails, copy the error text into a Cursor chat *with this folder open* so the assistant can suggest a fix (Node version, network, etc.).

---

## 5) What to avoid changing at first

- **`next.config.ts`** — easy to break builds.
- **`.env` / `.env.local`** — secrets and Supabase URLs/keys; don’t paste these into chats.
- **`src/lib/supabase.ts`** and server/client wiring — until you’re ready for backend/auth topics.

For a **first edit**, change visible **text** or layout in **`src/app/page.tsx`** or **`src/app/layout.tsx`**, or a string inside a component under **`src/components/`**.

---

## 6) How changes get to the live site (GitHub Desktop)

1. Save files in Cursor.
2. Open **GitHub Desktop**; select the **`dblaira.github.io`** repository.
3. Review changed files; write a short **Summary** (commit message), e.g. `Tweak home page heading`.
4. Click **Commit to main**.
5. Click **Push origin** (uploads to GitHub).

**Vercel** (connected to the repo) normally **builds after each push** to `main`. Wait for the deployment to finish, then refresh your live URL. **Custom domain:** this repo includes **`CNAME`** (`adamdblair.com`) for domain setup; hosting still flows through your connected provider (Vercel).

---

## 7) One small safe first edit (sanity check)

1. Run **`npm run dev`** and open **`http://localhost:3000`**.
2. Edit **`src/app/page.tsx`**: change a heading or paragraph text you can recognize.
3. Save — the browser should **hot-reload**; if not, refresh once.
4. When ready, **commit + push** with GitHub Desktop and confirm the same text appears on the deployed site after Vercel finishes.

---

## 8) Optional: paste this into a new Cursor chat (with this folder open)

```
CONTEXT
- Repo: dblaira.github.io — Next.js 15 + TypeScript + Tailwind, Vercel deploy, Supabase for inbox features.
- I use GitHub Desktop for git and Cursor for editing. Beginner: plain language, one-line definitions for terms.
- Open folder is this repo only.

My GitHub username is dblaira; repo is dblaira/dblaira.github.io; GitHub About links to dblaira-github-io.vercel.app.

YOUR JOB
1) Confirm stack from package.json and src/ and list the folders I edit most.
2) Minimal checklist: local preview (exact npm commands for this repo), what to avoid until I understand it, how push reaches Vercel.
3) Say if anything besides Node/npm is required on macOS and the simplest install or skip.
4) Suggest one tiny visible edit and what I should see after refresh.

STYLE: Short sections, numbered steps, no jargon without a one-line definition.
```

---

*Generated for first-session onboarding; keep this file in the repo root or move to `docs/` if you prefer.*
