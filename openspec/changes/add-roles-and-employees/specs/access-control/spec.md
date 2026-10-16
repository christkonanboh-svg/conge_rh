# Spec Delta

## Purpose

Garantir que chaque utilisateur n'accède, côté client, qu'aux écrans autorisés par son rôle, et que la navigation proposée reflète ce rôle.

## ADDED Requirements

### Requirement: Protection des routes par rôle

Le système SHALL autoriser l'accès à une route protégée uniquement aux utilisateurs dont le rôle figure parmi les rôles autorisés pour cette route.

#### Scenario: Accès autorisé

- **WHEN** un utilisateur authentifié dont le rôle est autorisé tente d'accéder à une route protégée
- **THEN** l'accès à la route lui est accordé

#### Scenario: Accès refusé pour un rôle non autorisé

- **WHEN** un utilisateur authentifié dont le rôle n'est pas autorisé tente d'accéder à une route protégée
- **THEN** l'accès est refusé et l'utilisateur est redirigé vers l'écran d'accueil de son propre rôle

#### Scenario: Rôles multiples autorisés

- **WHEN** une route déclare plusieurs rôles autorisés
- **THEN** tout utilisateur dont le rôle fait partie de cette liste peut y accéder

### Requirement: Redirection des utilisateurs non authentifiés

Le système SHALL rediriger vers l'écran de connexion tout utilisateur non authentifié qui tente d'accéder à une route protégée.

#### Scenario: Accès protégé sans session

- **WHEN** un utilisateur sans session active tente d'accéder à une route protégée
- **THEN** il est redirigé vers l'écran de connexion

### Requirement: Navigation adaptée au rôle

Le système SHALL n'afficher, dans la navigation, que les entrées accessibles au rôle de l'utilisateur connecté et SHALL masquer les entrées réservées aux autres rôles.

#### Scenario: Menu filtré selon le rôle

- **WHEN** un utilisateur connecté affiche la navigation
- **THEN** seules les entrées autorisées pour son rôle sont visibles

#### Scenario: Entrées interdites masquées

- **WHEN** un utilisateur dont le rôle n'a pas accès à une fonctionnalité affiche la navigation
- **THEN** l'entrée correspondante n'est pas proposée

### Requirement: Écran d'atterrissage selon le rôle

Le système SHALL diriger l'utilisateur connecté vers un écran d'accueil cohérent avec son rôle après la connexion.

#### Scenario: Redirection après connexion

- **WHEN** un utilisateur se connecte
- **THEN** il est dirigé vers l'écran d'accueil correspondant à son rôle

### Requirement: Accès restreint aux fonctions de gestion RH

Le système SHALL réserver les écrans de gestion des employés et des équipes (création, consultation, modification, suppression) aux utilisateurs de rôle RH/Admin.

#### Scenario: Accès RH autorisé

- **WHEN** un utilisateur de rôle RH/Admin accède aux écrans de gestion des employés et des équipes
- **THEN** l'accès lui est accordé

#### Scenario: Accès non-RH refusé

- **WHEN** un utilisateur de rôle Employé ou Manager tente d'accéder aux écrans de gestion des employés ou des équipes
- **THEN** l'accès est refusé et il est redirigé vers l'écran d'accueil de son rôle
