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

The landing page SHALL include a hero section with a compelling headline, descriptive subtext, and two call-to-action buttons: primary "Créer un compte" linking to `/register`, secondary "Se connecter" linking to `/login`.

#### Scenario: Hero content present
- **WHEN** viewing the landing page
- **THEN** the hero section displays the headline, description, primary "Créer un compte" button linking to `/register`, and secondary "Se connecter" button linking to `/login`

#### Scenario: CTAs navigate to auth
- **WHEN** clicking the "Créer un compte" CTA in the hero
- **THEN** the user is navigated to `/register`
- **AND** when clicking the "Se connecter" CTA in the hero
- **THEN** the user is navigated to `/login`

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

#### Scenario: Statistics banner present
- **WHEN** viewing the landing page
- **THEN** a statistics banner displays at least four key figures (e.g., 3 rôles, 100 % en ligne, 0 papier, validation en un clic)

#### Scenario: Final CTA and footer present
- **WHEN** viewing the landing page
- **THEN** a final call-to-action section and a footer with branding/text are present

### Requirement: Responsive layout and navigation anchors

The landing page SHALL be responsive (mobile: single column layout with compact navigation menu; desktop: multi-column layout) and SHALL include navigation anchor links to "Fonctionnalités", "Comment ça marche", and "Pour qui".

#### Scenario: Desktop layout
- **WHEN** viewed on a desktop viewport
- **THEN** the landing page renders in a multi-column layout appropriate for wide screens

#### Scenario: Mobile layout
- **WHEN** viewed on a mobile viewport
- **THEN** the landing page renders in a single column layout with a compact navigation menu

#### Scenario: Navigation anchor links present
- **WHEN** the public navigation is displayed
- **THEN** it contains anchor links to "Fonctionnalités", "Comment ça marche", and "Pour qui"
