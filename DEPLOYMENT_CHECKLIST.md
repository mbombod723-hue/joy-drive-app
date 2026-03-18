# Checklist de Déploiement - Joy Drive App

Utilisez cette checklist pour vous assurer que tout est prêt avant de déployer sur Vercel.

## Avant le Déploiement

### Code et Dépendances
- Tous les fichiers sont committés dans Git
- Pas de fichiers .env ou .env.local dans le repository
- pnpm install s'exécute sans erreur
- pnpm check passe sans erreur TypeScript
- pnpm build génère les fichiers de production
- pnpm test passe tous les tests

### Configuration
- vercel.json est configuré correctement
- .vercelignore exclut les fichiers inutiles
- package.json contient tous les scripts nécessaires
- Pas de dépendances manquantes

### Base de Données
- Supabase project est créé
- DATABASE_URL est valide et testée
- Toutes les migrations sont appliquées (pnpm db:push)
- Les tables sont créées: users, favorites, conversations, messages

### APIs et Clés
- VITE_GOOGLE_MAPS_API_KEY est valide
- Google Maps APIs sont activées
- VITE_APP_ID (Manus OAuth) est valide
- BUILT_IN_FORGE_API_KEY est valide

## Déploiement sur Vercel

### Étape 1: Créer le Repository GitHub
- Code poussé sur GitHub
- Repository est public ou accessible à Vercel
- Branch main est la branche par défaut

### Étape 2: Configurer Vercel
- Compte Vercel créé
- Projet créé sur Vercel
- Repository GitHub connecté
- Build settings sont corrects

### Étape 3: Configurer les Variables d'Environnement
Configurer dans Vercel Settings > Environment Variables:
- DATABASE_URL
- JWT_SECRET
- VITE_APP_ID
- OAUTH_SERVER_URL
- VITE_OAUTH_PORTAL_URL
- OWNER_OPEN_ID
- OWNER_NAME
- BUILT_IN_FORGE_API_URL
- BUILT_IN_FORGE_API_KEY
- VITE_FRONTEND_FORGE_API_KEY
- VITE_FRONTEND_FORGE_API_URL
- VITE_GOOGLE_MAPS_API_KEY
- VITE_APP_TITLE
- VITE_APP_LOGO

### Étape 4: Déployer
- Cliquez "Deploy" sur Vercel
- Build s'exécute sans erreur
- Deployment preview est accessible

## Après le Déploiement

### Tests Fonctionnels
- Page d'accueil charge correctement
- Connexion utilisateur fonctionne
- Création de compte fonctionne
- Ajout de favoris fonctionne
- Recherche Google Places fonctionne
- Carte Google Maps affiche correctement
- Drag & drop des marqueurs fonctionne
- Envoi de messages fonctionne

### Performance
- Page charge en moins de 3 secondes
- Pas d'erreurs dans la console
- Images sont optimisées
- CSS et JS sont minifiés

### Sécurité
- HTTPS est forcé
- Pas de secrets exposés
- CORS fonctionne correctement
- Authentication fonctionne
- Database est sécurisée

## Support

- Vercel Support: https://vercel.com/support
- Supabase Support: https://supabase.com/support
- Google Maps Support: https://developers.google.com/maps/support
- Manus Support: https://help.manus.im
