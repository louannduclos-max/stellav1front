## Good news

The zip is the **same framework** as this project (TanStack Start). No rewriting needed — I can drop the code straight in.

## What I'll do

1. **Back up** the current project's `src/` (rename to `src.backup-old/`) in case you want to look at it later.
2. **Extract the zip** to a temp folder.
3. **Copy these into this project**, overwriting what's here:
   - `src/` (all pages, components, routes, integrations)
   - `public/` (images, static files)
   - `package.json` + `bun.lock` (dependencies)
   - `components.json`, `tsconfig.json`, `vite.config.ts`, `eslint.config.js`, `bunfig.toml`, `wrangler.jsonc`
   - `.prettierrc`, `.prettierignore`
4. **Install dependencies** from the new `package.json`.
5. **Run the 16 Supabase migrations** from the zip against this project's Lovable Cloud — this creates all the database tables (companies, studies, presets, profiles, etc.).
6. Verify the build and report the result.

## Heads-up — what will NOT carry over automatically

- **Database data** (any existing rows from the old project's database) — only the table *structure* is recreated. If you need the actual data too, that's a separate export/import.
- **Secrets / API keys** stored in the old project (Maps, webhook secrets, etc.) — you'll need to re-add them in Cloud → Secrets once we know which ones the app uses. I'll list them at the end.
- **Existing user accounts** from the old project's login system.
- The old project's deployed URL — this project keeps its own URL.

## Confirm before I start

Reply **"go"** and I'll do it. Anything else (e.g. "skip the backup", "don't run migrations yet") — just tell me.
