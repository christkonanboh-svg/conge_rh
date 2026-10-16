# Tasks

## 1. Fondations et modèles

- [ ] 1.1 Créer les modèles/types d'auth (`UserRole`, `StoredUser`, `Session`, `AuthResult`) dans `src/app/core/auth/` et vérifier la compilation `npm run build`
- [ ] 1.2 Implémenter le `StorageService` centralisé (get/set/remove typés, préfixage des clés, gestion des erreurs JSON/quota) et vérifier par tests unitaires Vitest couvrant lecture, écriture et donnée corrompue
- [ ] 1.3 Implémenter le `PasswordHasher` (PBKDF2 + sel via `crypto.subtle`) avec `hash(password)` et `verify(password, stored)` et vérifier que les tests prouvent : hash ≠ clair, sels uniques, vérification correcte/incorrecte

## 2. Service d'authentification et seed

- [ ] 2.1 Implémenter `AuthService` (signals `currentUser`/`isAuthenticated`, inscription avec unicité d'email, connexion, déconnexion) et vérifier chaque scénario de login/logout par tests unitaires (identifiants corrects/incorrects, doublon d'inscription)
- [ ] 2.2 Persister comptes et session via `StorageService` et vérifier que la session est restaurée après rechargement (test recréant le service à partir du même stockage)
- [ ] 2.3 Implémenter le seed idempotent des comptes de démonstration (un par rôle: Employé, Manager, RH/Admin, mots de passe hachés) et vérifier : seed au premier lancement, pas de reseed si des comptes existent

## 3. Guards et routing

- [ ] 3.1 Implémenter `authGuard` et `roleGuard` basés sur `AuthService` et vérifier par tests que l'accès est autorisé/refusé selon la session et le rôle
- [ ] 3.2 Ajouter les routes d'authentification (inscription, connexion) dans `app.routes.ts` et brancher le seed au démarrage dans `app.config.ts`, puis vérifier le build et la navigation manuelle dans `npm start`

## 4. Interface d'authentification

- [ ] 4.1 Créer les composants standalone d'inscription et de connexion (Reactive Forms, textes en français, validation des champs) et vérifier que les formulaires invalides bloquent la soumission (tests composant)
- [ ] 4.2 Connecter les formulaires à `AuthService` (affichage des erreurs, redirection après connexion/déconnexion) et vérifier le flux complet manuellement : inscription → connexion → déconnexion
- [ ] 4.3 Ajouter les indications de comptes de démonstration à l'écran de connexion et vérifier que les identifiants affichés correspondent bien aux comptes seedés

## 5. Vérification d'intégration

- [ ] 5.1 Exécuter la suite de tests complète (`npm test`) et corriger toute régression liée à l'auth
- [ ] 5.2 Vérifier de bout en bout dans le navigateur : premier lancement (seed), persistance après rechargement F5, hachage absent en clair dans le LocalStorage, blocage des routes protégées sans session

## Workflow follow-up

- Archiver le change après validation (un commit OpenSpec par change, conforme aux conventions projet).
