# Joy Drive App - TODO List

## Phase 1: Layout & Menu Fixes
- [x] Corriger z-index du menu hamburger
- [x] Vérifier layout 40/60 (carte/options)
- [x] Ajouter "Delete Account" au menu

## Phase 2: Address Search & Maps Integration
- [x] Intégrer Google Maps API pour recherche d'adresses en temps réel
- [x] Afficher suggestions d'adresses pendant la saisie
- [ ] Ajouter option "Stop" pour adresses intermédiaires
- [x] Implémenter géocodage inverse pour afficher adresses réelles

## Phase 3: Vehicle System
- [x] Ajouter système de véhicules avec couleurs différentes
  - [x] Lite (couleur 1)
  - [x] Economy (couleur 2)
  - [x] Express (couleur 3)
  - [x] VIP (couleur 4)
  - [x] Packages (couleur 5)
  - [x] Moving (couleur 6)
- [x] Implémenter calcul dynamique des prix basé sur distance et tarif SA
- [x] Afficher prix et "Joy" à côté du véhicule sur la carte
- [x] Créer véhicule stylé moderne pour le trajet

## Phase 4: Driver & Communication System
- [x] Implémenter tableau chauffeur avec:
  - [x] Nom et post-nom
  - [x] Couleur du véhicule
  - [x] Numéro matricule
  - [x] Options message et appel
- [x] Ajouter système de messagerie en temps réel (Supabase)
  - [x] Schema de base de donnees
  - [x] Composant ChatBox
  - [x] Procedures tRPC
  - [x] Tests vitest
- [ ] Ajouter système d'appel (intégration)

## Phase 5: Trip & Notifications
- [x] Afficher position du chauffeur en temps réel
- [x] Afficher trajet respectant les avenues réelles
- [ ] Ajouter sonnerie d'arrivée du chauffeur
- [ ] Ajouter sonnerie d'arrivée à destination
- [ ] Implémenter système de notification temps réel

## Phase 6: Rating System
- [x] Implémenter système de notation avec étoiles jaunes
- [x] Ajouter options d'avis:
  - [x] Chauffeur poli ou pas
  - [x] Véhicule propre ou pas
  - [x] Bonne conduite ou pas
- [ ] Sauvegarder les ratings dans Supabase

## Phase 7: Stripe Integration
- [x] Configurer Stripe pour paiements
- [ ] Implémenter paiement après trajet
- [ ] Ajouter historique des paiements

## Phase 8: Become a Driver
- [x] Créer formulaire complet avec tous les champs:
  - [x] Informations personnelles
  - [x] Documents (permis, assurance, etc)
  - [x] Informations véhicule
  - [x] Informations bancaires
- [x] Ajouter option "Become a Driver" sur page d'enregistrement
- [ ] Implémenter validation des documents

## Phase 9: Settings & Pages
- [x] Implémenter page "About"
- [x] Implémenter page "Privacy Policy"
- [ ] Implémenter sélecteur de langue
- [x] Implémenter "Delete Account"
- [x] Tous les textes en anglais

## Phase 10: Button Styling
- [x] Changer "Find a Driver" en bleu très foncé
- [x] Rendre "Find a Driver" opérationnel

## Phase 11: Testing & Deployment
- [x] Tester toutes les fonctionnalités
- [x] Vérifier l'intégration Supabase
- [x] Vérifier l'intégration Stripe
- [ ] Déployer sur Vercel

## Phase 12: Recent Updates (March 18, 2026)
- [x] Ajouter upload de photo de profil depuis galerie
- [x] Corriger l'affichage des pages Profile, Notifications, History, Language, ShareLocation
- [x] Ajouter animation "Searching for drivers..." au bouton Find a Driver
- [x] Ajouter simulation de trajet avec délai (2s recherche, 5s arrivée)
- [x] Vérifier que le numéro +27788002462 est présent dans About
- [ ] Vérifier la connexion Supabase et les tables créées
- [ ] Tester l'authentification Supabase


## Phase 13: Favorites System (March 18, 2026)
- [x] Créer la table `favorites` dans la base de données
- [x] Ajouter les helpers de base de données (get, add, delete, update)
- [x] Créer les procédures tRPC pour gérer les favoris
- [x] Créer le composant FavoritesPanel avec UI complète
- [x] Intégrer les favoris dans la page principale avec bouton "Show Favorites"
- [x] Ajouter les tests vitest pour les favoris (12 tests passés)
- [x] Permettre aux utilisateurs de sauvegarder/supprimer/modifier les destinations favorites


## Phase 14: Google Maps Integration for Favorites (March 18, 2026)
- [ ] Configurer Google Maps API et vérifier les clés
- [ ] Créer composant MapFavoritesSelector avec marqueurs interactifs
- [ ] Implémenter géocodage inversé pour convertir coordonnées en adresses
- [ ] Ajouter recherche Google Places pour les adresses
- [ ] Intégrer drag & drop pour affiner la localisation
- [ ] Tester et sauvegarder les changements

- [x] Configurer Google Maps API et vérifier les clés
- [x] Créer composant MapFavoritesSelector avec marqueurs interactifs
- [x] Implémenter géocodage inversé pour convertir coordonnées en adresses
- [x] Ajouter recherche Google Places pour les adresses
- [x] Intégrer drag & drop pour affiner la localisation
- [x] Créer service de géocodage complet
- [x] Créer composant PlacesAutocomplete avec recherche Places
- [x] Créer utilitaires pour marqueurs draggables
