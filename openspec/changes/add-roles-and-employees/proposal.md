# Proposal

## Why

L'application ne gère aujourd'hui que l'authentification : après connexion, tous les utilisateurs voient la même page d'accueil et aucun rôle ne restreint réellement la navigation. Il manque le socle RH de base — des employés identifiables et des équipes — sans lequel les modules à venir (demande de congé, circuit de validation, soldes, calendrier d'équipe) ne peuvent pas être rattachés à des personnes et à des responsables.

## What Changes

- Contrôle d'accès par rôle côté client : guards de routes autorisant un ou plusieurs rôles (Employé, Manager, RH/Admin), écran ou menu adapté au rôle connecté, et restriction des écrans de gestion aux utilisateurs RH.
- Gestion des employés : les comptes existants sont enrichis d'un profil (nom, prénom, équipe, manager) ; le RH peut créer, consulter, modifier et désactiver des employés.
- Gestion des équipes : le RH peut créer, renommer et supprimer des équipes.
- Affectation d'un manager à chaque employé, avec contrôle de cohérence (le manager doit exister et avoir un rôle compatible).
- Persistance de l'ensemble (profils employés, équipes, affectations) dans le LocalStorage via le StorageService centralisé.

## Capabilities

### New Capabilities

- `access-control`: Contrôle d'accès côté client fondé sur le rôle — garde de routes acceptant un ou plusieurs rôles autorisés, résolution du rôle courant, et adaptation de la navigation (menu, écran d'atterrissage) au rôle de l'utilisateur connecté.
- `employees`: Gestion des employés et des équipes — CRUD des profils employés (enrichissant les comptes d'auth), CRUD des équipes, affectation et validation d'un manager par employé, persistance dans le LocalStorage.

### Modified Capabilities

<!-- Aucune : la création des comptes, l'attribution des rôles et la session restent
     couvertes par la capability `auth` ; ce change ajoute l'application des rôles
     (guards/navigation) et la gestion RH des employés/équipes. -->

## Impact

- Code : `src/app/core/auth/auth.models.ts` (extension du profil utilisateur), nouveau domaine `src/app/core/access-control/` (guards par rôles), nouveau domaine `src/app/core/employees/` (services modèles + persistance), `src/app/app.routes.ts` (routes et guards par rôle), nouvelle coquille de navigation et nouveaux composants `src/app/features/employees/`.
- Données LocalStorage : nouvelle clé `conge_rh.teams` (équipes) ; les profils employés enrichissent les comptes existants sous `conge_rh.users` (pas de clé `conge_rh.employees`).
- Dépendances : aucune nouvelle — Angular standalone + signals et le StorageService existant.
