# Proposal

## Why

This change improves the user experience by introducing a consistent, modern design system and clear entry points for both unauthenticated and authenticated users. The application currently has functional screens but lacks a polished public landing page, cohesive styling across features, and a structured app shell with role-aware navigation. A unified design system and improved layout will make the HR leave management app more professional and easier to use.

## What Changes

- **Design system**: Define Tailwind design tokens (colors, spacing, typography with Plus Jakarta Sans, borders, shadows) and shared UI components (buttons, cards, badges, forms, tables, empty states, spinners, toasts, confirmation modals, KPI cards) for consistent styling across the app.
- **Public landing page** (`/`): Add a marketing landing page with top navigation (Connexion, Créer un compte), hero section with call-to-action buttons, CSS-based application mockup, features grid (6 cards), "Comment ça marche" steps (3), "Pour qui" audience sections (Employé, Manager, RH), statistics banner, final CTA, and footer.
- **Authentication UX**: Restyle login and registration as split-screen layouts (branding left, forms right) with password visibility toggle and visible validation states.
- **App shell**: Create a connected application shell with collapsible role-filtered sidebar navigation (icons + labels), top bar showing avatar, name and role badge, and logout button. Shell is responsive (mobile-first with collapsible menu).
- **Connected home** (`/app`): Add role-aware dashboard landing with welcome message, KPI cards, and quick shortcuts tailored to each role.
- **Consistent styling**: Restyle existing screens (Employees, Teams, Leave Requests, Leave Types, Team Calendar, Dashboard) to use shared components and design tokens.
- **UX states**: Add loading states, empty states, and toast notifications across relevant interactions.
- **Routing behavior**: Configure root route (`/`) to redirect to `/app` when the user is already authenticated; unauthenticated users see the public landing page.

## Capabilities

### New Capabilities

- **ui/design-system**: A shared design system including Tailwind tokens, typography configuration, and reusable UI components (buttons, cards, badges, form fields, tables, empty states, spinners, toasts, modals, KPI cards) that ensure visual consistency across public and authenticated areas.
- **ui/public-landing**: A public-facing landing page at route `/` that introduces the application, showcases features, explains how it works, and provides clear entry points to authentication. Includes a CSS-based product mockup and footer.
- **ui/auth-ux**: Enhanced authentication experience with split-screen layouts for login and registration, password visibility toggle, and visible form validation states.
- **ui/app-shell**: A connected application shell with role-filtered collapsible sidebar navigation, responsive mobile behavior, top bar with user identity (avatar, name, role badge), and logout action.
- **ui/connected-home**: A role-aware home page at `/app` with welcome message, KPI cards, and quick shortcuts adapted to employé/manager/RH roles.

### Modified Capabilities

- **access-control**: Root route behavior updated so that authenticated users are redirected from `/` to `/app`, while unauthenticated users are presented with the public landing page. Role-aware navigation and guards remain consistent with existing access rules.

## Impact

- **Code**: New shared UI components under `src/app/shared/` (or existing shared location), new feature components for landing, auth layouts, app shell, and connected home. Updates to routing configuration (`app.routes.ts`), access control (redirect logic), and styling across existing feature components.
- **Styling**: Global styles and Tailwind configuration to define design tokens (colors, fonts, shadows, radii) used application-wide.
- **Dependencies**: Uses existing dependencies (Angular standalone, Tailwind CSS 4, signals). No new external runtime dependencies required.
- **UX/Behavior**: Minor routing behavior change for root path based on authentication state; all other business logic remains unchanged.
