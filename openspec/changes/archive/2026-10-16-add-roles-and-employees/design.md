# Design

## Context

Voir `proposal.md`. État actuel : la capability `auth` gère des comptes (`StoredUser` : `id`, `email`, `role`, hash/sel) persistés sous `conge_rh.users` via le `StorageService` centralisé (`conge_rh.` préfixe), une session (`conge_rh.session`) et un seed de comptes de démo. `UserRole = 'employe' | 'manager' | 'rh'` existe déjà, ainsi qu'un `roleGuard(requiredRole)` à égalité stricte dans `core/auth/auth.guards.ts`. Il n'existe ni données RH (profils, équipes) ni navigation filtrée par rôle ; la route `/` est protégée par `authGuard` mais identique pour tous.

## Goals / Non-Goals

**Goals:**

- Étendre les comptes existants avec un profil employé (nom, prénom, équipe, manager) — un seul référentiel persistant.
- Fournir des opérations CRUD employés et équipes, plus l'affectation d'un manager, exécutables uniquement par le RH.
- Rendre l'accès et la navigation dépendants du rôle (guards multi-rôles, menu filtré, écran d'atterrissage par rôle).
- Réutiliser le `StorageService` centralisé et le hachage `PasswordHasher` existants.

**Non-Goals:**

- Pas de circuit de validation de congés, de soldes ni de calendrier d'équipe (changes ultérieurs).
- Pas de suppression du rôle ou de renommage de `UserRole`.
- Pas de gestion des mots de passe oubliés/renouvellement avancé.

## Decisions

### D1 — Employé = compte utilisateur enrichi

`StoredUser` est étendu de champs profil optionnels au niveau du type, obligatoires côté RH : `firstName`, `lastName`, `teamId: string | null`, `managerId: string | null`. L'employé n'est pas dupliqué : le profil enrichit le compte existant dans `conge_rh.users`.

- Alternatives : entité `Employee` séparée référençant un compte → deux référentiels à synchroniser, écarté.
- Conséquence : le seed doit produire des profils complets pour les comptes de démo.

### D2 — Dépôt de comptes partagé (`UserRepository`)

Pour éviter que `AuthService` et le nouveau service RH possèdent tous deux la clé `conge_rh.users`, un `UserRepository` (`core/users/user.repository.ts`) devient l'unique propriétaire de la lecture/écriture de cette clé (`list`, `findById`, `findByEmail`, `add`, `update`, `remove`). `AuthService` s'appuie dessus pour `register`/`login`/`seed`/`restoreSession`, sans changement de comportement observable.

- Alternatives : un `EmployeeService` qui écrit directement `conge_rh.users` en parallèle d'`AuthService` → double propriétaire, risque de désynchronisation, écarté.
- Alternatives : tout ajouter à `AuthService` → mélange des responsabilités auth/RH, écarté.
- La capability `auth` n'a pas de delta : aucune de ses exigences ne change, seul son accès aux données est refactoré.

### D3 — Services RH dédiés

- `EmployeeService` (`core/employees/employee.service.ts`) : expose des signals (`employees`, `loading`) et les opérations `create`, `update`, `remove`, `assignManager`, `validateProfile`. Il valide : champs obligatoires, unicité de l'identifiant, existence du manager, rôle compatible (`manager`/`rh`), non auto-affectation. Les créations passent un mot de passe initial haché via `PasswordHasher`.
- `TeamService` (`core/employees/team.service.ts`) : CRUD des équipes sous `conge_rh.teams`. À la suppression d'une équipe, les employés référencés passent `teamId` à `null` ; à la suppression d'un employé, les `managerId` qui le référencent passent à `null`.

- Alternatives : un seul service fourre-tout → responsabilités mêlées, écarté.

### D4 — Modèles et clés de stockage

- `EmployeeProfile` / `EmployeeInput` et `Team` (`core/employees/employee.models.ts`).
- Clés : `conge_rh.employees` n'est **pas** utilisée ; les profils vivent dans `conge_rh.users` (D1). `conge_rh.teams` pour les équipes. `conge_rh.demo_seeded` reste le marqueur de seed.

### D5 — Contrôle d'accès par rôle (capability `access-control`)

- `roleGuard(...allowed: UserRole[])` remplace le `roleGuard(requiredRole)` d'auth et accepte un ou plusieurs rôles. Non authentifié → `/login` ; authentifié non autorisé → écran d'accueil de son rôle (`ROLE_HOME[user.role]`). L'ancien `roleGuard` de `auth.guards.ts` est supprimé (aucun appelant en production à ce jour).
- `NAV_ITEMS`: table `{ label, route, roles }` ; un composant de coquille affiche les entrées dont `roles` contient le rôle courant.
- `ROLE_HOME: Record<UserRole, string>` : `employe → /home`, `manager → /home`, `rh → /employees`.
- Routes : `/login`, `/register` publiques ; coquille protégée par `authGuard` avec enfants `/home` (tous), `/employees` et `/teams` (`roleGuard('rh')`). `/` redirige vers `ROLE_HOME` du rôle courant (sinon `/login`).

- Alternatives : réutiliser l'égalité stricte et multiplier les guards mono-rôle → duplication, écarté.

### D6 — Seed étendu

Au premier lancement, en plus des comptes par rôle, créer au moins une équipe et des profils complets (noms, équipe, manager) cohérents entre eux, sans reseed si des données existent déjà.

## Risks / Trade-offs

- [Refactor d'`AuthService` via `UserRepository`] → tests existants (`auth.*.spec.ts`) doivent rester verts ; lancer la suite après refactor et garantir des signatures inchangées.
- [Contrainte « chaque employé a un manager »] → les comptes de démo et le compte RH fondateur doivent avoir un `managerId` valide ; par convention le RH est le sommet et peut être l'unique cas sans manager (exception documentée), sinon sa propre équipe.
- [Suppression d'un manager/équipe référencés] → réaffecter à `null` ; l'interface doit prévenir des employés orphelins.
- [Un seul référentiel `conge_rh.users`] → toute écriture hors `UserRepository` casse la cohérence ; le réserver comme unique point d'accès.
- [Stockage LocalStorage] → non partagé et limité en taille ; acceptable pour un devoir sans backend.

## Migration Plan

1. Introduire `UserRepository` et rebrancher `AuthService` dessus ; faire passer la suite existante.
2. Étendre `StoredUser` et le seed (champs profil + équipe).
3. Ajouter `core/employees` (modèles, `TeamService`, `EmployeeService`).
4. Ajouter `core/access-control` (guard multi-rôles, `NAV_ITEMS`, `ROLE_HOME`) et la coquille de navigation.
5. Ajouter les composants `features/employees` et `features/teams`, brancher les routes et les guards.
6. Rollback : retirer les nouvelles clés LocalStorage suffit (aucune migration irréversible).

## Open Questions

- Aucune bloquante : les écrans de tableau de bord par rôle arriveront avec les changes suivants ; en attendant, `ROLE_HOME` peut pointer vers `/home` pour tous les rôles sauf RH.
