@echo off
cd /d "%~dp0"
echo.
echo === Stella Frontend Push - Fix Cloudflare 404 ===
echo.

REM Supprimer le lock file stale si present
if exist ".git\index.lock" (
    echo Suppression du git index.lock stale...
    del /f ".git\index.lock"
)

REM Config auteur
git config user.name "louannduclos-max"
git config user.email "louann.ducloq@gmail.com"

REM Exclure .env du suivi git
git rm --cached .env 2>nul
git rm --cached .env.local 2>nul

REM Stage tous les fichiers modifies
git add vite.config.ts
git add src/lib/supabase-browser.ts
git add src/routes/login.tsx
git add .env.production

echo.
echo === Fichiers stages ===
git status --short
echo.

git commit -m "fix: migrate Supabase to cowork project + fix Google OAuth

1. supabase-browser.ts: point vers projet cowork (utwjfsomblhupghbgvgv)
   - Ancien fallback hardcode: knmvxeykwkcrlxwlvohi (Lovable Cloud)
   - Nouveau: utwjfsomblhupghbgvgv (projet utilisateur migre)

2. login.tsx: remplace lovableAuth.signInWithOAuth par Supabase natif
   - lovableAuth depandait de /~oauth/initiate (route Lovable Cloud uniquement)
   - Nouveau: supabaseBrowser.auth.signInWithOAuth (standard Supabase v2)

3. .env.production: VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY
   pour le build Cloudflare Pages CI (vars publiques, anon key)"

git push

echo.
echo === Done - Check Cloudflare Pages for new build ===
echo URL: https://dash.cloudflare.com/workers-and-pages
echo.
pause
