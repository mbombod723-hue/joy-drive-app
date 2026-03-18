#!/bin/bash

# Script de déploiement Vercel pour Joy Drive App
# Usage: ./scripts/deploy-vercel.sh [--prod]

set -e

echo "🚀 Joy Drive App - Vercel Deployment Script"
echo "============================================"

# Vérifier que Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI n'est pas installé"
    echo "Installez-le avec: npm i -g vercel"
    exit 1
fi

# Vérifier que pnpm est installé
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm n'est pas installé"
    echo "Installez-le avec: npm i -g pnpm"
    exit 1
fi

# Étape 1: Installer les dépendances
echo ""
echo "📦 Étape 1: Installation des dépendances..."
pnpm install

# Étape 2: Vérifier le build
echo ""
echo "🔨 Étape 2: Vérification du build..."
pnpm build

# Étape 3: Vérifier les tests
echo ""
echo "✅ Étape 3: Exécution des tests..."
pnpm test

# Étape 4: Vérifier le linting
echo ""
echo "🎨 Étape 4: Vérification du linting..."
pnpm check

# Étape 5: Déployer sur Vercel
echo ""
echo "🌐 Étape 5: Déploiement sur Vercel..."

if [ "$1" == "--prod" ]; then
    echo "Déploiement en PRODUCTION..."
    vercel --prod
else
    echo "Déploiement en STAGING..."
    vercel
fi

echo ""
echo "✨ Déploiement terminé avec succès!"
echo "Visitez votre application sur Vercel Dashboard"
