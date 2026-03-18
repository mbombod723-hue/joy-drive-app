# Variables d'Environnement - Joy Drive App

Ce document décrit toutes les variables d'environnement requises pour déployer Joy Drive App sur Vercel.

## Configuration Supabase

### DATABASE_URL
**Description:** Chaîne de connexion PostgreSQL pour Supabase  
**Format:** `postgresql://user:password@host:port/database`  
**Où l'obtenir:**
1. Allez sur https://app.supabase.com
2. Sélectionnez votre projet
3. Allez dans Settings → Database → Connection String
4. Sélectionnez "URI" et copiez la chaîne
5. Remplacez `[YOUR-PASSWORD]` par votre mot de passe

**Exemple:**
```
postgresql://postgres:abc123xyz@db.supabase.co:5432/postgres
```

## Configuration Authentication

### JWT_SECRET
**Description:** Clé secrète pour signer les tokens JWT  
**Générer une nouvelle clé:**
```bash
openssl rand -base64 32
```

### VITE_APP_ID
**Description:** ID de l'application Manus OAuth  
**Où l'obtenir:** Manus Dashboard → Settings → OAuth

### OAUTH_SERVER_URL
**Description:** URL du serveur OAuth Manus  
**Valeur:** `https://api.manus.im`

### VITE_OAUTH_PORTAL_URL
**Description:** URL du portail OAuth Manus  
**Valeur:** `https://oauth.manus.im`

## Configuration Propriétaire

### OWNER_OPEN_ID
**Description:** ID unique du propriétaire de l'application  
**Où l'obtenir:** Manus Dashboard → Account Settings

### OWNER_NAME
**Description:** Nom du propriétaire de l'application  
**Exemple:** `John Doe`

## APIs Manus Built-in

### BUILT_IN_FORGE_API_URL
**Description:** URL de base pour les APIs Manus  
**Valeur:** `https://api.manus.im`

### BUILT_IN_FORGE_API_KEY
**Description:** Clé API pour accéder aux APIs Manus côté serveur  
**Où l'obtenir:** Manus Dashboard → API Keys

### VITE_FRONTEND_FORGE_API_KEY
**Description:** Clé API pour accéder aux APIs Manus côté client  
**Où l'obtenir:** Manus Dashboard → API Keys

### VITE_FRONTEND_FORGE_API_URL
**Description:** URL de base pour les APIs Manus côté client  
**Valeur:** `https://api.manus.im`

## Google Maps API

### VITE_GOOGLE_MAPS_API_KEY
**Description:** Clé API Google Maps pour les fonctionnalités cartographiques  
**Où l'obtenir:**
1. Allez sur https://console.cloud.google.com
2. Créez un nouveau projet
3. Activez les APIs suivantes:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Directions API
4. Allez dans Credentials → Create Credentials → API Key
5. Restreignez la clé à:
   - HTTP referrers
   - Domaines: `*.vercel.app`, `*.joy-drive.com`

**Restrictions recommandées:**
```
https://*.vercel.app/*
https://*.joy-drive.com/*
```

## Analytics (Optionnel)

### VITE_ANALYTICS_ENDPOINT
**Description:** URL endpoint pour envoyer les données d'analytics  
**Exemple:** `https://analytics.example.com/api/events`

### VITE_ANALYTICS_WEBSITE_ID
**Description:** ID du site pour les analytics  
**Exemple:** `website-123`

## Configuration App

### VITE_APP_TITLE
**Description:** Titre de l'application affiché dans le navigateur  
**Valeur:** `Joy Drive`

### VITE_APP_LOGO
**Description:** URL du logo de l'application  
**Exemple:** `https://cdn.example.com/logo.png`

## Configuration Vercel

Pour configurer ces variables dans Vercel:

1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet
3. Allez dans Settings → Environment Variables
4. Ajoutez chaque variable avec sa valeur
5. Sélectionnez les environnements (Production, Preview, Development)
6. Cliquez "Save"

### Variables pour Production

Assurez-vous que ces variables sont configurées pour l'environnement Production:
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

### Variables pour Development

Vous pouvez utiliser les mêmes valeurs ou des valeurs différentes (par exemple, une base de données de développement).

## Vérification

Pour vérifier que toutes les variables sont correctement configurées:

```bash
# Vérifier localement
pnpm build

# Vérifier sur Vercel
vercel env list
```

## Sécurité

⚠️ **Important:**
- Ne commitez JAMAIS les fichiers `.env` ou `.env.local` dans Git
- Utilisez Vercel Environment Variables pour les secrets en production
- Rotez régulièrement les clés API
- Utilisez des clés différentes pour développement et production
- Activez les restrictions de domaine pour les clés API publiques

## Support

Pour toute question:
- Documentation Supabase: https://supabase.com/docs
- Documentation Vercel: https://vercel.com/docs
- Documentation Google Maps: https://developers.google.com/maps
- Support Manus: https://help.manus.im
