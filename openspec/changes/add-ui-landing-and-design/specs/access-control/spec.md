# Spec Delta

## Purpose

Update access control behavior so that authenticated users are redirected from root route `/` to `/app`, while preserving existing role-based access control and guards.

## MODIFIED Requirements

### Requirement: Root route behavior

The system SHALL redirect authenticated users from route `/` to `/app`, and SHALL present the public landing page to unauthenticated users accessing `/`.

#### Scenario: Unauthenticated user views landing
- **WHEN** an unauthenticated user navigates to `/`
- **THEN** the public landing page is displayed

#### Scenario: Authenticated user redirected from root
- **WHEN** an authenticated user navigates to `/`
- **THEN** the system redirects the user to `/app`
