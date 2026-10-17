# Spec Delta

## Purpose

Update access control behavior so that authenticated users are redirected from root route `/` to `/app`, while preserving existing role-based access control and guards.

## MODIFIED Requirements

### Requirement: Redirection des utilisateurs non authentifiés

The system SHALL redirect to the login screen any unauthenticated user who attempts to access a protected route. Additionally, the root route SHALL behave such that unauthenticated users see the public landing page and authenticated users are redirected to `/app`.

#### Scenario: Accès protégé sans session
- **WHEN** un utilisateur sans session active tente d'accéder à une route protégée
- **THEN** il est redirigé vers l'écran de connexion

#### Scenario: Unauthenticated user views landing
- **WHEN** an unauthenticated user navigates to `/`
- **THEN** the public landing page is displayed

#### Scenario: Authenticated user redirected from root
- **WHEN** an authenticated user navigates to `/`
- **THEN** the system redirects the user to `/app`
