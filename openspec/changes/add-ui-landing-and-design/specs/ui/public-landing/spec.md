# Spec Delta

## Purpose

Provide a public-facing landing page at route `/` that introduces the HR leave management application, showcases its features, and guides unauthenticated users to login or register.

## ADDED Requirements

### Requirement: Public landing route and navigation

The system SHALL serve the public landing page at route `/` for unauthenticated users. Authenticated users SHALL be redirected to `/app` when accessing `/`.

#### Scenario: Unauthenticated user views landing
- **WHEN** an unauthenticated user navigates to `/`
- **THEN** the public landing page is displayed with navigation showing "Connexion" and "Créer un compte" links

#### Scenario: Authenticated user redirected from root
- **WHEN** an authenticated user navigates to `/`
- **THEN** the system redirects the user to `/app`

### Requirement: Hero section

The landing page SHALL include a hero section with a compelling headline, descriptive subtext, and two call-to-action buttons (primary "Commencer" or "Créer un compte", secondary "Se connecter").

#### Scenario: Hero content present
- **WHEN** viewing the landing page
- **THEN** the hero section displays the headline, description, and primary/secondary CTAs

#### Scenario: CTAs navigate to auth
- **WHEN** clicking the primary or secondary CTA in the hero
- **THEN** the user is navigated to the login or registration page as appropriate

### Requirement: Product mockup

The landing page SHALL include a CSS-based visual mockup (card showing balance, mini calendar, approved request) that illustrates the application UI.

#### Scenario: Mockup visible
- **WHEN** viewing the landing page
- **THEN** a CSS-styled mockup demonstrating key interface elements is displayed

### Requirement: Features, workflow, audience and CTA sections

The landing page SHALL include: features grid (6 cards: demande de congé, circuit de validation, solde de jours, calendrier d'équipe, tableau de bord, rôles), "Comment ça marche" (3 steps), "Pour qui" (employé, manager, RH), statistics banner, final CTA, and footer.

#### Scenario: Features section present
- **WHEN** viewing the landing page
- **THEN** exactly 6 feature cards are displayed with their respective titles and descriptions

#### Scenario: How it works steps
- **WHEN** viewing the landing page
- **THEN** 3 numbered steps are displayed explaining the workflow

#### Scenario: Audience sections present
- **WHEN** viewing the landing page
- **THEN** three audience sections (Employé, Manager, RH) are displayed with explanatory text

#### Scenario: Final CTA and footer present
- **WHEN** viewing the landing page
- **THEN** a final call-to-action section and a footer with branding/text are present
