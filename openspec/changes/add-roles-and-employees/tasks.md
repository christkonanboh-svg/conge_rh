# Tasks

## 1. Dépôt de comptes partagé

- [ ] 1.1 Créer `src/app/core/users/user.repository.ts` (propriétaire unique de `conge_rh.users` : `list`, `findById`, `findByEmail`, `add`, `update`, `remove`) et vérifier avec `src/app/core/users/user.repository.spec.ts` que `npx ng test --include="src/app/core/users/user.repository.spec.ts" --watch=false` passe
- [ ] 1.2 Rebrancher `AuthService` sur `UserRepository` sans changer ses signatures, et vérifier que `npx ng test --include="src/app/core/auth/auth.service.spec.ts" --watch=false`, `--include="src/app/core/auth/auth.seed.spec.ts"` et `--include="src/app/core/auth/auth.persistence.spec.ts"` passent

## 2. Modèles et gestion des équipes

- [ ] 2.1 Étendre `StoredUser` dans `src/app/core/auth/auth.models.ts` avec `firstName`, `lastName`, `teamId: string | null`, `managerId: string | null` et vérifier que `npm run build` compile sans erreur TypeScript
- [ ] 2.2 Créer `src/app/core/employees/employee.models.ts` (`Team`, `EmployeeProfile`, `EmployeeInput`, listes de rôles autorisés comme manager) et vérifier que `npm run build` compile
- [ ] 2.3 Implémenter `src/app/core/employees/team.service.ts` (CRUD équipes sous `conge_rh.teams`, unicité du nom, dissociation des employés à la suppression) et vérifier avec `src/app/core/employees/team.service.spec.ts` que la création, le renommage, la suppression et la persistance passent

## 3. Gestion des employés

- [ ] 3.1 Implémenter `src/app/core/employees/employee.service.ts` (signals `employees`, `create`, `update`, `remove`, `assignManager`) avec validations : champs obligatoires, identifiant unique, manager existant au rôle `manager`/`rh`, non auto-affectation
- [ ] 3.2 Écrire `src/app/core/employees/employee.service.spec.ts` couvrant chaque règle (création réussie, identifiant dupliqué, profil incomplet, manager manquant/inexistant/incompatible, auto-affectation, suppression préservant la cohérence des `managerId`) et vérifier que `npx ng test --include="src/app/core/employees/employee.service.spec.ts" --watch=false` passe
- [ ] 3.3 Étendre le seed (`AuthService.seedDemoAccounts` ou collaborateur) pour créer au moins une équipe et des profils complets cohérents (noms, équipe, manager) sans reseed, et vérifier via `auth.seed.spec.ts` que chaque compte de démo dispose d'un profil et d'un `managerId` valide

## 4. Contrôle d'accès et navigation

- [ ] 4.1 Créer `src/app/core/access-control/access-control.ts` avec `roleGuard(...allowed: UserRole[])` (non authentifié → `/login`, rôle non autorisé → `ROLE_HOME[role]`) et retirer l'ancien `roleGuard` d'`auth.guards.ts`
- [ ] 4.2 Écrire `src/app/core/access-control/access-control.spec.ts` vérifiant l'accès autorisé, le refus par rôle, la redirection non authentifié et la redirection d'un rôle non autorisé vers son accueil, puis lancer `npx ng test --include="src/app/core/access-control/access-control.spec.ts" --watch=false`
- [ ] 4.3 Définir `NAV_ITEMS` (`{ label, route, roles }`) et `ROLE_HOME` (`employe → /home`, `manager → /home`, `rh → /employees`), puis créer la coquille de navigation qui n'affiche que les entrées du rôle courant et vérifier avec un test de composant que le menu RH voit « Employés »/« Équipes » et qu'un Employé/Manager ne les voit pas
- [ ] 4.4 Brancher `src/app/app.routes.ts` : `/login`/`/register` publiques, coquille protégée par `authGuard` avec `/home` (tous), `/employees` et `/teams` (`roleGuard('rh')`), et `/` redirigeant vers `ROLE_HOME` du rôle courant (sinon `/login`) ; vérifier par test que RH atteint `/employees` et qu'un Employé est renvoyé vers `/home`

## 5. Écrans RH employés et équipes

- [ ] 5.1 Créer `src/app/features/employees/` (liste + détail, formulaire de création/édition avec sélection d'équipe et de manager, suppression) et vérifier avec un test de composant que la liste affiche rôle/équipe/manager et que le formulaire crée puis modifie un employé
- [ ] 5.2 Créer `src/app/features/teams/` (liste, création, renommage, suppression) et vérifier avec un test de composant que les opérations mettent à jour la liste affichée

## 6. Intégration et vérification

- [ ] 6.1 Lancer toute la suite avec `npm test` (ou `npx ng test --watch=false`) et vérifier que tous les tests passent
- [ ] 6.2 Lancer `npm run build` et vérifier que le build de production réussit sans erreur
- [ ] 6.3 Vérifier de bout en bout sur l'application : un compte RH gère employés/équipes et affecte un manager ; un compte Employé/Manager ne voit pas les entrées RH et est redirigé s'il tente d'y accéder ; les données persistent après rechargement

## Workflow follow-up

- Archiver le change après implémentation et synchronisation des specs principales (`employees`, `access-control`).
