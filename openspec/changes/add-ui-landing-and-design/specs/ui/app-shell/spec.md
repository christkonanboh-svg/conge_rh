# Spec Delta

## Purpose

Provide a connected application shell that includes a collapsible, role-filtered sidebar navigation, a responsive mobile layout, and a top bar displaying user identity (avatar, name, role badge) with a logout button.

## ADDED Requirements

### Requirement: App shell layout

The authenticated application SHALL be wrapped in an app shell component that provides a sidebar, top bar, and main content area.

#### Scenario: Shell renders for authenticated routes
- **WHEN** an authenticated user navigates to any authenticated route
- **THEN** the app shell is displayed containing sidebar navigation and top bar

### Requirement: Role-filtered sidebar navigation

The sidebar SHALL display navigation items filtered by the authenticated user's role. Each navigation item SHALL include an icon and label.

#### Scenario: RH sees all navigation items
- **WHEN** a user with role RH is authenticated
- **THEN** the sidebar displays navigation items appropriate for RH including employees, teams, leave types, calendar, dashboard, and requests

#### Scenario: Manager sees only authorized items
- **WHEN** a user with role manager is authenticated
- **THEN** the sidebar displays only navigation items authorized for managers

#### Scenario: Employe sees only authorized items
- **WHEN** a user with role employe is authenticated
- **THEN** the sidebar displays only navigation items authorized for employees

### Requirement: Collapsible sidebar with responsive behavior

The sidebar SHALL be collapsible and the layout SHALL be responsive (mobile-first). On mobile viewports, the sidebar SHALL be collapsible/retractable.

#### Scenario: Sidebar collapsible on desktop
- **WHEN** the user toggles the sidebar collapse control
- **THEN** the sidebar expands or collapses showing/hiding labels while keeping icons visible in collapsed state

#### Scenario: Mobile layout behavior
- **WHEN** the viewport width is mobile-sized
- **THEN** the sidebar can be collapsed/retracted to maximize content area

### Requirement: Top bar with user identity and logout

The top bar SHALL display the user's avatar, full name, role badge, and a logout button.

#### Scenario: Top bar shows user info
- **WHEN** authenticated in the app shell
- **THEN** the top bar displays the user's name, role badge, and avatar

#### Scenario: Logout action
- **WHEN** the user clicks the logout button in the top bar
- **THEN** the session is terminated and the user is redirected to the login page
