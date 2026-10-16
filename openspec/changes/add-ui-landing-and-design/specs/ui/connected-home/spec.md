# Spec Delta

## Purpose

Provide a role-aware connected home page at `/app` that greets the user, displays relevant KPIs, and offers quick shortcuts based on their role.

## ADDED Requirements

### Requirement: Connected home route

The system SHALL provide a connected home page accessible at route `/app` for authenticated users only.

#### Scenario: Authenticated access to /app
- **WHEN** an authenticated user navigates to `/app`
- **THEN** the connected home page is displayed

#### Scenario: Unauthenticated redirected from /app
- **WHEN** an unauthenticated user navigates to `/app`
- **THEN** the user is redirected to the login page

### Requirement: Welcome message and user context

The connected home page SHALL display a personalized welcome message including the user's name.

#### Scenario: Welcome message shows name
- **WHEN** viewing the connected home page
- **THEN** a welcome message is displayed that includes the authenticated user's name

### Requirement: Role-aware KPIs and shortcuts

The connected home page SHALL display KPI cards and quick shortcut actions tailored to the authenticated user's role (employé, manager, or RH).

#### Scenario: Employe sees relevant shortcuts and KPIs
- **WHEN** an employé views the connected home page
- **THEN** the page shows KPIs and shortcut links relevant to an employé's responsibilities

#### Scenario: Manager sees team-focused content
- **WHEN** a manager views the connected home page
- **THEN** the page shows KPIs and shortcuts relevant to managing their team

#### Scenario: RH sees global content
- **WHEN** an RH views the connected home page
- **THEN** the page shows KPIs and shortcuts relevant to global HR management
