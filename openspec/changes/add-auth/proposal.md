# Proposal

## Why

L'application RH (congé) nécessite une authentification locale sans backend pour gérer les accès selon les rôles (Employé, Manager, RH/Admin). Il faut garantir que les mots de passe ne sont jamais stockés en clair (hachage avec sel via Web Crypto PBKDF2) et que la session reste persistée dans le LocalStorage, tout en fournissant des comptes de démonstration au premier lancement.

## What Changes

- Ajouter un système d'authentification complet côté client (inscription, connexion, déconnexion)
- Implémenter le stockage sécurisé des comptes : hachage PBKDF2 + sel (Web Crypto), jamais de mot de passe en clair
- Gérer la persistance des comptes et de la session dans le LocalStorage via le StorageService centralisé
- Assurer la création automatique de comptes de démonstration au premier lancement (seed)
- Ajouter les guards/contrôles de rôles nécessaires au fonctionnement du flux d'auth
- Respect strict : aucune communication avec un backend

## Capabilities

### New Capabilities

- `auth`: Couverture de l'authentification locale (inscription, connexion, déconnexion), de la gestion des comptes stockés localement, du hachage PBKDF2 + sel, de la persistance de session et du seeding de comptes de démonstration au premier lancement.

### Modified Capabilities

Aucune (nouvelle capability).

## Impact

- Code applicatif Angular (auth, services, guards, routes) sous `src/`
- Utilisation du StorageService centralisé pour toute persistance (LocalStorage)
- Données locales (comptes, session) - pas d'impact backend/API externe
- Conformité aux conventions TypeScript strict, UI responsive, textes en français
