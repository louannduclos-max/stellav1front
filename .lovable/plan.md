# Wizard React natif — branchement complet sur la base

## Objectif

Supprimer l'iframe `public/stella/Louann.html` sur `/app/studies/new` et la remplacer par un wizard React natif qui lit **les vraies marques** (et leurs activités/cibles/branding) depuis la base Lovable Cloud.

Résultat attendu :
- Sélecteur de marque alimenté par `companies` + `user_company_permissions`
- Activités et publics cibles pré-cochés depuis `company_activity_families` / `company_target_publics`
- Couleurs de la marque appliquées au thème pendant la wizard
- Création de l'étude dans la table `studies` à la soumission

## Périmètre

Le contenu de la démo (`public/stella` ~4600 lignes) couvre 6 étapes + landing + écran de génération. La V1 native couvre **uniquement le tunnel de création d'étude**, pas la landing marketing ni l'écran de génération (qui existe déjà dans `app/studies/$id`).

### Étapes conservées (mappées sur le schéma actuel de `studies`)

1. **Marque + type d'étude** — `company_id`, `study_category`, `study_subtype`
2. **Où** — pays, ville, communes types, zone focus
3. **Activités SAP** — `sap_activities` (pré-cochées depuis la marque)
4. **Cibles** — `target_publics` (pré-cochées depuis la marque)
5. **Concurrence & KPIs** — `competition_kpis`, KPIs sélectionnés
6. **Récap** — bouton "Lancer l'étude" → INSERT studies + redirect `/app/studies/$id`

### Hors périmètre (V1)

- Landing animée Stella
- Mini-jeu pendant la génération
- Édition d'une étude existante en wizard (édition reste sur la page détail)
- Étape "axes routiers" avancée (gardée simple : champ texte libre)

## Architecture

```text
src/routes/_authenticated/app.studies.new.tsx     ← réécrit (plus d'iframe)
src/components/wizard/
  WizardShell.tsx          ← stepper + provider context
  useWizardStore.ts        ← état local (Zustand-like via useReducer)
  steps/
    Step1Brand.tsx
    Step2Location.tsx
    Step3Activities.tsx
    Step4Targets.tsx
    Step5Competition.tsx
    Step6Recap.tsx
src/lib/wizard.functions.ts ← createWizardStudy({ data: WizardPayload })
```

Les server functions existantes (`listMyAllowedCompanies`, `getCompany`, masters) sont réutilisées. Une seule nouvelle server fn pour créer l'étude finale (utilise `requireSupabaseAuth`).

Le branding de la marque sélectionnée applique les couleurs via CSS variables sur le conteneur wizard (réutilise `useBrandCssVars`).

## Détails techniques

- **Routing** : la route `/app/studies/new` accepte toujours les search params `?company_id=&category=&subtype=` pour démarrer à l'étape 2.
- **Validation** : Zod par étape ; bouton "Suivant" désactivé tant que invalide.
- **Persistance** : aucune (état en mémoire). Si l'utilisateur quitte → tout est perdu. Brouillon en base = phase 2 plus tard.
- **UI** : shadcn (Card, Button, Select, Checkbox, Input) ; pas de nouvelle dépendance.
- **Suppression** : `public/stella/` reste en place pour la route `/stella-visual` (preview slides) ; on ne supprime rien.

## Plan de livraison (1 PR, vérification visuelle à chaque étape)

1. Server fn `createWizardStudy` + types partagés
2. `WizardShell` + state + stepper UI vide
3. Step 1 (marque + type) — branding live
4. Step 2 (où)
5. Step 3 + 4 (activités, cibles) avec pré-cochage depuis la marque
6. Step 5 (concurrence/KPIs)
7. Step 6 (recap + submit → redirect `/app/studies/$id`)
8. Réécriture de `app.studies.new.tsx` pour monter `WizardShell` (suppression iframe)

## Risques / questions

- Le wizard de démo a beaucoup de finition visuelle (animations, micro-interactions). La V1 native sera **fonctionnellement équivalente mais visuellement plus sobre** (shadcn par défaut). On pourra polir ensuite.
- Si tu veux **garder** la wizard de démo accessible quelque part (ex: `/demo/wizard`), dis-le — sinon elle reste joignable seulement via URL directe `/stella/Louann.html`.

Confirme et je démarre par l'étape 1 (server fn + shell). Tu verras la wizard se construire pas à pas.
