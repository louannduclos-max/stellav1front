# Plan de migration vers Supabase "cowork"

Objectif : déplacer toute la base actuelle (Lovable Cloud) vers ton propre projet Supabase appelé **cowork**, sans rien perdre (schéma, données, fichiers, users).

---

## Ce qu'on va migrer

1. **Structure** : 22 tables, types enum, fonctions (`has_role`, `is_admin`, `is_owner_global`, `user_company_ids`, `touch_updated_at`, `handle_new_user`), triggers, RLS + GRANTs
2. **Données** : contenu de chaque table (companies, studies, masters, profiles, user_roles, study_deliverables, etc.)
3. **Auth users** : comptes utilisateurs (emails, mots de passe hashés, providers)
4. **Storage** : bucket `deliverables` + tous les fichiers
5. **Secrets serveur** : `GENERATION_WEBHOOK_SECRET`, `LOVABLE_API_KEY` (à recréer côté cowork)
6. **Config Auth** : providers activés (Google), URLs de redirection

---

## Étapes (baby steps)

### Étape 1 — Préparer le projet "cowork"
- Tu crées (ou tu as déjà) le projet Supabase **cowork** sur supabase.com
- Tu me donnes :
  - L'URL du projet (`https://xxxxx.supabase.co`)
  - La **clé anon/publishable** (pour le front)
  - La **clé service_role** (pour la migration — je l'utilise une fois puis on la supprime du chat)
  - Le **mot de passe de la base** (pour `pg_dump` / restore direct)

### Étape 2 — Exporter le schéma actuel
Je génère un fichier SQL complet à partir des migrations Lovable + introspection :
- `cowork_schema.sql` → CREATE TYPE, CREATE TABLE, GRANT, RLS, POLICIES, FUNCTIONS, TRIGGERS
- Idempotent (IF NOT EXISTS partout) pour pouvoir le rejouer sans risque

### Étape 3 — Exporter les données
Deux options selon ce que tu peux faire :
- **Option A (recommandée, rapide)** : `pg_dump --data-only` depuis la base actuelle → `cowork_data.sql`. Nécessite l'accès à `SUPABASE_DB_URL` côté Lovable Cloud (à voir si dispo).
- **Option B (fallback)** : export CSV table par table depuis Lovable Cloud → import CSV dans cowork (plus long mais toujours faisable).

### Étape 4 — Importer dans cowork
1. Je joue `cowork_schema.sql` sur cowork (SQL editor ou `psql`)
2. Je joue `cowork_data.sql` (ou j'importe les CSV)
3. Vérification : `SELECT COUNT(*)` sur chaque table comparé à la source

### Étape 5 — Migrer les users Auth
- Export des users via Auth Admin API (`GET /auth/v1/admin/users`) depuis Lovable Cloud
- Import dans cowork via `POST /auth/v1/admin/users` (avec `password_hash` pour préserver les mots de passe)
- **Attention** : les `id` UUID des users doivent être conservés (sinon `user_id` dans `profiles` / `user_roles` / `studies` cassent)

### Étape 6 — Migrer le bucket `deliverables`
- Liste tous les fichiers du bucket Lovable Cloud
- Téléchargement → upload dans le bucket `deliverables` côté cowork (même nom, même path)
- Recrée les policies du bucket à l'identique

### Étape 7 — Basculer le front
- Mise à jour de 3 valeurs dans `.env` :
  - `VITE_SUPABASE_URL` → URL cowork
  - `VITE_SUPABASE_PUBLISHABLE_KEY` → anon key cowork
  - `VITE_SUPABASE_PROJECT_ID` → ref cowork
- Recréation des secrets serveur (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GENERATION_WEBHOOK_SECRET`, `LOVABLE_API_KEY`) côté cowork
- **Note importante** : si tu sors de Lovable Cloud, tu perds l'AI Gateway intégrée — il faut soit garder `LOVABLE_API_KEY` (si encore valide hors Lovable Cloud), soit basculer sur OpenAI/Anthropic direct

### Étape 8 — Reconfigurer Auth côté cowork
- Activer Google provider (mêmes Client ID / Secret OAuth Google)
- Ajouter les Redirect URLs (preview + prod)
- Désactiver les sign-ups anonymes
- Vérifier la config email (confirm email on/off selon ton réglage actuel)

### Étape 9 — Mettre à jour le webhook Cloud Run
- Le webhook `/api/public/generation-webhook` ne change pas d'URL (c'est ton domaine front)
- Mais le `SUPABASE_SERVICE_ROLE_KEY` que **Cloud Run** utilise pour écrire en direct (si c'est le cas) doit être remplacé par celui de cowork

### Étape 10 — Tests de bout en bout
- Login Google → OK
- Création d'une étude → écriture en DB cowork
- Trigger pipeline Stella → webhook → fichiers dans bucket cowork
- Vérif RBAC (admin / owner_global / user) toujours fonctionnel

### Étape 11 — Décommission
- Une fois confirmé OK pendant quelques jours, désactiver Lovable Cloud
- Garder un dump complet de la base actuelle en backup local (au cas où)

---

## Points d'attention

- **Downtime** : prévoir une fenêtre courte (15-30 min) où on coupe les écritures côté front pour éviter une désync pendant le dump
- **IDs des users** : on DOIT conserver les UUID auth, sinon toutes les FK `user_id` cassent
- **Service role key Lovable Cloud** : non accessible — donc Option A de l'étape 3 nécessite `SUPABASE_DB_URL` (qui n'est pas non plus directement exposée). En pratique on partira sans doute sur **Option B (CSV)** + une approche hybride pour les users (script via API admin)
- **Coût** : tu sors du free tier mutualisé Lovable Cloud → tu prends en charge le projet Supabase cowork (free tier suffit au démarrage)

---

## Ce dont j'ai besoin de toi pour démarrer

1. Le projet **cowork** existe-t-il déjà sur supabase.com ? Si non → tu le crées (région EU recommandée pour la latence)
2. Tu confirmes que tu veux bien **sortir de Lovable Cloud** (perte AI Gateway intégrée, gestion des clés côté toi)
3. Tu me transmets les credentials de cowork quand tu es prêt (étape 1)

Dis-moi quand tu veux qu'on commence et par quelle étape.
