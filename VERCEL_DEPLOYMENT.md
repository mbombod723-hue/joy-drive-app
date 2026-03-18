# Guide de Déploiement sur Vercel

## Prérequis

- Compte Vercel (https://vercel.com)
- Token Vercel CLI (fourni)
- Repository GitHub avec le code du projet
- Base de données Supabase configurée

## Étapes de Déploiement

### 1. Exporter le code vers GitHub

L'application est déjà prête pour être exportée. Vous pouvez :

**Option A : Via l'interface Manus**
- Allez dans Settings → GitHub
- Connectez votre compte GitHub
- Exportez le projet vers un nouveau repository

**Option B : Manuellement**
```bash
cd /home/ubuntu/joy-drive-app
git init
git add .
git commit -m "Initial commit: Joy Drive App with favorites and Google Maps integration"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/joy-drive-app.git
git push -u origin main
```

### 2. Configurer Vercel

**Via CLI :**
```bash
npm i -g vercel
vercel login --token YOUR_VERCEL_TOKEN
cd joy-drive-app
vercel
```

**Via Interface Web :**
1. Allez sur https://vercel.com/dashboard
2. Cliquez "Add New" → "Project"
3. Importez votre repository GitHub
4. Configurez les variables d'environnement (voir section ci-dessous)
5. Cliquez "Deploy"

### 3. Variables d'Environnement Requises

Configurez ces variables dans Vercel (Settings → Environment Variables) :

```env
# Base de données Supabase
DATABASE_URL=postgresql://user:password@host:port/database

# Authentication
JWT_SECRET=your_jwt_secret_key
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# Propriétaire
OWNER_OPEN_ID=your_owner_id
OWNER_NAME=Your Name

# APIs Manus
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your_api_key
VITE_FRONTEND_FORGE_API_KEY=your_frontend_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key

# Analytics (optionnel)
VITE_ANALYTICS_ENDPOINT=your_analytics_endpoint
VITE_ANALYTICS_WEBSITE_ID=your_website_id

# App Configuration
VITE_APP_TITLE=Joy Drive
VITE_APP_LOGO=https://your-logo-url.png
```

### 4. Vérifier la Connexion Supabase

Assurez-vous que :
- La chaîne de connexion DATABASE_URL est correcte
- Les tables sont créées (favorites, users, conversations, messages)
- Les migrations sont appliquées

Commande pour vérifier :
```bash
pnpm db:push
```

### 5. Déployer

```bash
vercel --prod
```

### 6. Tester le Déploiement

Après le déploiement :
1. Visitez votre URL Vercel
2. Testez les fonctionnalités principales :
   - Connexion utilisateur
   - Ajout de favoris
   - Recherche Google Places
   - Drag & drop sur la carte
   - Envoi de messages

## Dépannage

### Erreur : "Cannot find module"
- Vérifiez que toutes les dépendances sont installées : `pnpm install`
- Vérifiez le fichier `package.json`

### Erreur de base de données
- Vérifiez la variable `DATABASE_URL`
- Assurez-vous que Supabase accepte les connexions externes
- Activez SSL si nécessaire

### Erreur Google Maps
- Vérifiez que `VITE_GOOGLE_MAPS_API_KEY` est configurée
- Vérifiez que l'API est activée dans Google Cloud Console
- Vérifiez les restrictions de domaine

### Erreur OAuth
- Vérifiez que `VITE_APP_ID` est correct
- Vérifiez que `OAUTH_SERVER_URL` est accessible
- Vérifiez que le redirect URI est configuré dans Manus

## Optimisations de Performance

### Caching
Vercel met en cache automatiquement :
- Les fichiers statiques (images, CSS, JS)
- Les réponses API (selon les headers)

### Edge Functions (Optionnel)
Pour les API critiques, utilisez les Edge Functions Vercel :
```bash
# Créer une Edge Function
mkdir -p api/edge
# Ajouter votre logique
```

## Monitoring

Utilisez le dashboard Vercel pour :
- Surveiller les déploiements
- Vérifier les logs
- Analyser les performances
- Configurer les alertes

## Support

Pour toute question :
- Documentation Vercel : https://vercel.com/docs
- Support Supabase : https://supabase.com/support
- Support Google Maps : https://developers.google.com/maps/support

## Rollback

Pour revenir à une version précédente :
1. Allez sur Vercel Dashboard
2. Sélectionnez le projet
3. Allez dans "Deployments"
4. Cliquez sur le déploiement précédent
5. Cliquez "Redeploy"
