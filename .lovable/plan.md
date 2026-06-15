# Intégration du `lovable-pack` Stella

Objectif : récupérer le pack JSON depuis l'API Stella (`/integration/study/{id}/lovable-pack`), injecter ses variables CSS dans `:root`, afficher la liste des KPI, et afficher le HTML de prévisualisation dans une iframe — le tout accessible via une page `/study/$id` ET via un hook et des composants réutilisables ailleurs.

## Ce qui sera créé

### 1. Server function proxy (`src/lib/stella-pack.functions.ts`)
- `getStellaPack({ id })` — `createServerFn` qui appelle `${STELLA_API_URL}/integration/study/${id}/lovable-pack` côté serveur et retourne le JSON.
- Permet d'éviter les soucis de CORS / `127.0.0.1` et de pouvoir changer plus tard d'URL (dev local → prod) sans toucher le frontend.
- L'URL de base sera lue depuis `process.env.STELLA_API_URL` (avec fallback `http://127.0.0.1:8000` pour le dev). Note importante : `127.0.0.1` côté serveur Lovable ne pointera **pas** vers ta machine — pour tester depuis le preview Lovable, il faudra exposer ton serveur Stella publiquement (ngrok, Cloudflare tunnel, ou déployer). On en reparle après le plan.

### 2. Hook React (`src/hooks/useStellaPack.ts`)
- `useStellaPack(id)` — wrappe `useServerFn(getStellaPack)` dans un `useQuery` (TanStack Query déjà présent).
- Retourne `{ pack, isLoading, error }`.

### 3. Composants réutilisables (`src/components/stella/`)
- `BrandStyleInjector.tsx` — prend `pack.css.variables` (objet `{ "--stella-primary": "#...", ... }`) et injecte un `<style>{`:root { ... }`}</style>` dans le DOM via un portail dans `<head>` (ou un `<style>` inline). Nettoyage au démontage.
- `KpiList.tsx` — affiche `pack.lovable_config.payload.metrics` sous forme de liste/cards, en marquant visuellement les KPI `optional`.
- `StudyPreview.tsx` — iframe pointant sur `pack.data_endpoints.preview_html` (sandbox approprié).

### 4. Page dynamique (`src/routes/study.$id.tsx`)
- Route `/study/$id` qui :
  1. Charge le pack via `useStellaPack(id)` (loader + `useSuspenseQuery`).
  2. Monte `<BrandStyleInjector vars={pack.css.variables} />`.
  3. Affiche un header simple, puis `<KpiList metrics={...} />` et `<StudyPreview src={...} />` côte à côte / empilés.
  4. `head()` avec titre dérivé de l'étude si disponible.
- `errorComponent` + `notFoundComponent` standards.

## Détails techniques

- **Types** : un fichier `src/types/stella-pack.ts` décrivant la forme attendue (`StellaPack`, `StellaCssVars`, `StellaMetric`, `StellaDataEndpoints`). Si tu as une spec/OpenAPI, je peux la raffiner — sinon je pars de ce que tu m'as montré (`css.variables`, `lovable_config.payload.metrics`, `data_endpoints.preview_html`) et je rends le reste tolérant.
- **CORS** : géré côté serveur (le proxy `createServerFn` fait l'appel HTTP côté Worker, pas le navigateur).
- **Sécurité iframe** : `sandbox="allow-scripts allow-same-origin"` par défaut (à ajuster selon ce que `preview_html` doit faire).
- **Pas de secret nécessaire** (tu as confirmé que l'endpoint est public).

## Ce que je ne fais PAS dans ce plan

- Pas de base de données / table en local pour cacher le pack — appel direct à chaque fois (rapide à ajouter ensuite avec TanStack Query `staleTime`).
- Pas de gestion multi-tenant / sélection de `brand_slug` — le pack contient déjà ses propres variables CSS par étude.
- Pas de fallback offline.

## Question pratique avant que tu valides

Pour que le preview Lovable puisse réellement atteindre `http://127.0.0.1:8000`, ton serveur local doit être exposé sur Internet (les serveurs Lovable ne peuvent pas appeler ton `localhost`). Solutions simples : **ngrok** ou **cloudflared tunnel**. On peut aussi mettre l'URL en variable d'environnement pour que tu changes facilement entre local et prod. **Je le mets en place dans cette implémentation** (variable `STELLA_API_URL` + fallback), tu n'auras qu'à me donner l'URL publique quand tu l'auras.

Valide ce plan et je passe à l'implémentation.
