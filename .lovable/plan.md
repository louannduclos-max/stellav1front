## Objectif
Définir le mot de passe du compte admin `louann.duclos@ouicare.com` à `louann`.

## Méthode
Lovable Cloud ne permet pas de changer un mot de passe depuis l'interface admin existante. J'utilise une migration SQL one-shot qui met à jour `auth.users.encrypted_password` via la fonction officielle `crypt()` de Supabase (extension `pgcrypto`, déjà installée).

## Étapes
1. Créer une migration SQL :
   ```sql
   UPDATE auth.users
   SET encrypted_password = crypt('louann', gen_salt('bf')),
       updated_at = now()
   WHERE email = 'louann.duclos@ouicare.com';
   ```
2. Exécuter la migration (un seul appel, pas de rollback nécessaire).
3. Te confirmer que tu peux te connecter sur `/login` avec :
   - Email : `louann.duclos@ouicare.com`
   - Mot de passe : `louann`

## Notes
- ⚠️ `louann` est un mot de passe très faible (6 caractères, dans des dictionnaires courants). Je te recommande de le changer après ta première connexion via un vrai gestionnaire de mots de passe. Dis-moi si tu veux que j'ajoute une page "changer mon mot de passe" dans l'espace authentifié.
- Aucune modification de schéma, aucune table publique touchée, aucun secret à ajouter.
- Pas d'email de reset envoyé — c'est un changement direct côté base.

## Hors périmètre
- Création d'un nouveau compte.
- Mise en place du flow "mot de passe oublié" (page `/reset-password`).
