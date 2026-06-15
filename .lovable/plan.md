## Objectif

Permettre de changer dynamiquement le thème de marque Stella (rouge bordeaux Shiva, bleu ES Interdomicilio, etc.) sur la page `/study/$id`, via un helper global `setBrand(slug)` qui injecte un `<link id="stella-theme">` dans le `<head>`.

## Ce qui sera créé

### 1. Helper `setBrand` — `src/lib/stella-brand.ts`

Fonction pure qui ajoute ou met à jour la balise `<link>` :

```ts
export function setBrand(slug: string) {
  const base = import.meta.env.VITE_STELLA_PUBLIC_URL ?? "http://127.0.0.1:8000";
  const href = `${base}/integration/css-vars.css?brand_slug=${encodeURIComponent(slug)}`;
  let link = document.getElementById("stella-theme") as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.id = "stella-theme";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  link.href = href;
}
```

- Exposé aussi sur `window.setBrand` (utile pour tests manuels en console et scripts externes).
- Helper symétrique `clearBrand()` qui retire la balise.

### 2. Composant `<BrandTheme slug={...} />` — `src/components/stella/BrandTheme.tsx`

Wrapper React minimal qui appelle `setBrand(slug)` dans `useEffect` (re-déclenché si `slug` change) et `clearBrand()` au unmount. Permet d'utiliser le helper de façon idiomatique depuis une route.

### 3. Intégration dans `/study/$id` — `src/routes/study.$id.tsx`

- Lire un slug de marque depuis :
  - le query param `?brand=shiva` (priorité 1, pour tester rapidement),
  - sinon un champ du pack (ex. `pack.brand_slug` si présent),
  - sinon rien (pas de thème injecté).
- Monter `<BrandTheme slug={resolvedSlug} />` en haut de la page quand un slug est résolu.
- Coexiste avec le `<BrandStyleInjector>` existant (qui injecte les variables du pack en inline `<style>`) : le `<link>` Stella charge en plus le CSS officiel de la marque servi par l'API.

## Détails techniques

- **URL de l'API** : nouvelle variable publique `VITE_STELLA_PUBLIC_URL` (par défaut `http://127.0.0.1:8000`). Publique car le `<link>` est résolu par le navigateur, pas par le serveur — donc il faut une URL accessible depuis la machine de l'utilisateur final. Pour un test en local avec le preview Lovable, `127.0.0.1` fonctionne uniquement si l'utilisateur teste depuis sa propre machine où Stella tourne. Pour la prod ou un partage, il faudra exposer Stella (ngrok, cloudflared, déploiement) et mettre l'URL publique dans cette variable.
- **SSR** : `setBrand` touche au DOM → guard `typeof document !== "undefined"` au début du helper pour éviter un crash pendant le rendu serveur.
- **Pas de fetch côté serveur** : on charge un stylesheet via `<link>` côté client, pas de proxy serverFn nécessaire (option écartée).
- **Pas de migration, pas de secret, pas de table** ajoutés.

## Fichiers touchés

- `src/lib/stella-brand.ts` (nouveau)
- `src/components/stella/BrandTheme.tsx` (nouveau)
- `src/routes/study.$id.tsx` (édité — lecture du slug + montage de `<BrandTheme>`)
- `.env` (édité — ajout `VITE_STELLA_PUBLIC_URL=http://127.0.0.1:8000`)

## Hors scope

- UI de sélection de marque (sélecteur dropdown) — peut être ajouté ensuite si besoin.
- Persistance du choix de marque (localStorage).
- Préchargement / cache du CSS Stella.
