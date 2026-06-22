@echo off
cd /d "%~dp0"
echo.
echo === Stella Frontend Push ===
echo.

REM Exclure .env du suivi git
git rm --cached .env 2>nul
git rm --cached .env.local 2>nul

git add -A

echo.
echo === Fichiers stages ===
git status --short
echo.

git commit -m "feat(sprint2): company picker Supabase, CSS vars brand, useBrandCssVars, types multi-tenant"
git push

echo.
echo === Done ===
echo Repo: https://github.com/louannduclos-max/stella-frontend
pause
