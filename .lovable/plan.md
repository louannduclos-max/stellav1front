## Objectif

1. Préparer un message clair à renvoyer à ton autre IA pour qu'elle ait toute l'info technique sur la base Lovable Cloud (Supabase) actuelle.
2. Appliquer la migration RLS "company RBAC" (owner_global / admin_filiale / analyst / reader) dans Lovable Cloud, adaptée au schéma réel du projet.

---

## Partie 1 — Message à copier-coller à ton autre IA

```
Le projet front est sur Lovable Cloud (Supabase managé). Voici l'état réel
de la base à date — utilise ça comme référence, ne suppose rien d'autre.

BACKEND
- URL et clés gérées par Lovable Cloud, exposées au front via
  VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY.
- Côté serveur (webhook Cloud Run), utilise SUPABASE_URL +
  SUPABASE_SERVICE_ROLE_KEY → bypass RLS automatique, OK pour écrire
  les livrables après génération.
- Secrets déjà configurés côté Cloud : GENERATION_WEBHOOK_SECRET,
  LOVABLE_API_KEY, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_SERVICE_ROLE_KEY, SUPABASE_DB_URL.

STORAGE
- Un seul bucket : `deliverables` (privé). Sert à stocker les fichiers
  générés (PPTX / PDF / images). URLs signées à générer côté serveur.

TABLES (schéma public, déjà existantes)
- companies(id uuid PK, name, display_name, slug, actor_type,
  group_name, status, created_by, created_at, updated_at, …)
- profiles(id uuid PK = auth.users.id, email, full_name, role, …)
- studies(id uuid PK, company_id uuid → companies, user_id uuid,
  created_by uuid, title, status, generation_status,
  generation_started_at/completed_at/error_message, study_type,
  study_category_code, study_subtype_code, country_code, city_name,
  postal_code, palette_key, + jsonb : included_activity_families,
  main_target_public, synthesis_kpis, market_kpis, hr_kpis,
  competition_kpis, transport_kpis, commune_types, zone_focus,
  risks, reference_years, road_axes, demographic_segments, …)
- study_deliverables(id, study_id → studies, type, file_url,
  file_name, file_size, mime_type, generated_at, created_at)
- user_company_permissions(id, user_id, company_id, granted_by, …)
- user_roles(id, user_id, role) — table dédiée aux rôles (NE PAS
  stocker les rôles sur profiles, sinon faille d'élévation).
- Tables master : study_types_master, study_categories_master,
  study_subtypes_master, target_publics_master, kpi_master,
  risks_master, commune_types_master, zone_focus_master,
  territory_modes_master, service_modes_master, sap_activities_master,
  company_activity_families, company_target_publics,
  company_branding, company_study_presets, internal_crm_logs.

RLS ACTUELLE (résumé)
- companies : admin manage tout, user lit si user_company_permissions
  lui donne accès à la company.
- studies : admin all, sinon user_id = auth.uid() ou created_by =
  auth.uid().
- study_deliverables : admin all, sinon lecture si study appartient
  à l'utilisateur.
- Fonction d'aide existante : private.is_admin(uuid) (security definer).

MIGRATION RLS À APPLIQUER (RBAC company-scoped)
- Nouveau type enum public.app_role :
  ('owner_global','admin_filiale','analyst','reader').
- user_roles.role passe sur ce enum (+ colonne optionnelle company_id
  pour scoper le rôle à une filiale).
- Fonctions security definer :
  - has_role(_user uuid, _role app_role) bool
  - is_owner_global(_user uuid) bool
  - user_company_ids(_user uuid) setof uuid
- Politiques :
  - owner_global → SELECT/INSERT/UPDATE/DELETE sur tout.
  - admin_filiale → CRUD limité à sa/ses company_id.
  - analyst → SELECT + UPDATE limité à sa company_id.
  - reader → SELECT only sur sa company_id.
  - service_role (webhook Cloud Run) bypass naturel.

WEBHOOK CLOUD RUN
- Endpoint backend appelé après génération. Header attendu :
  x-webhook-signature: HMAC-SHA256(body, GENERATION_WEBHOOK_SECRET).
- Vérifier la signature AVANT toute écriture.
- Écrit dans studies (generation_status, *_completed_at) et insère
  des lignes study_deliverables (+ upload dans bucket `deliverables`).
- Côté front, je vais exposer une route publique
  /api/public/webhooks/generation si tu veux que le backend tape
  directement Lovable plutôt que Supabase — sinon tu écris en direct
  via SERVICE_ROLE_KEY, plus simple.

CE QUE J'AI BESOIN DE TOI
1. Le SQL exact du fichier
   supabase/migrations/20260622_rls_company_rbac.sql que tu as
   généré, pour que je l'adapte au schéma ci-dessus avant
   exécution (les rôles owner_global/admin_filiale/analyst/reader
   n'existent pas encore, et user_roles.role est aujourd'hui un text).
2. Le FRONT_WEBHOOK_URL exact que tu veux appeler après génération.
3. Confirme que tu écris bien via SUPABASE_SERVICE_ROLE_KEY (bypass
   RLS) côté Cloud Run — pas via la publishable key.
```

---

## Partie 2 — Migration RLS à appliquer dans Lovable Cloud

Je vais créer une migration unique qui :

1. Crée le type `public.app_role` avec les 4 rôles.
2. Ajoute `company_id uuid NULL` à `user_roles` (pour scoper analyst/admin_filiale/reader à une filiale ; owner_global laisse NULL).
3. Convertit `user_roles.role` (text) vers le nouveau enum, en mappant les valeurs existantes (`admin` → `owner_global`, sinon `reader`).
4. Crée les fonctions security definer : `has_role`, `is_owner_global`, `user_company_ids`.
5. Remplace les policies actuelles sur `companies`, `studies`, `study_deliverables` par les nouvelles policies RBAC.
6. Garde la policy `user_roles` existante (lecture de ses propres rôles) et ajoute une policy "owner_global gère tous les rôles".
7. Vérifie que les GRANTS sont posés (`authenticated`, `service_role`).

Important :
- Je ne touche pas aux tables master (lecture publique, déjà OK).
- Je ne touche pas au bucket `deliverables` (reste privé, accès via URL signée côté serveur).
- Tu valideras la migration (bouton Approuver) avant qu'elle s'exécute, comme d'habitude.

---

## Partie 3 — Après la migration

- Tu pourras attribuer les rôles via un simple `INSERT INTO user_roles (user_id, role, company_id) VALUES (...)`. Je peux te préparer un petit écran d'admin si tu veux, mais ce n'est pas obligatoire pour que la migration parte.
- Côté Cloud Run, rien à changer : le service_role bypass RLS, donc la nouvelle RLS n'impacte pas le webhook.
- Côté front, les requêtes existantes continueront de marcher pour les owner_global ; les autres rôles ne verront que les studies/deliverables de leur company_id.

Dis-moi si tu veux que je :
(a) parte direct avec la migration telle que décrite, **ou**
(b) attende d'abord le SQL exact de ton autre IA pour le reprendre tel quel.