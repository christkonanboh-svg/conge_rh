# Tasks

## 1. Design System Foundation

- [ ] 1.1 Configure Tailwind CSS design tokens (colors, typography with Plus Jakarta Sans, spacing, radius, shadows) in styles/config and verify styles load with correct fonts/colors in tests/build
- [ ] 1.2 Create shared UI components (Button, Card, Badge, Input, Select, Textarea, Table, EmptyState, Spinner, Toast, ConfirmationModal, KpiCard) under shared/components and verify components render correctly in unit tests
- [ ] 1.3 Add toast service and state management for notifications and verify toasts can be shown/hidden

## 2. Public Landing Page

- [ ] 2.1 Create Landing component under features/public/landing with all required sections (nav, hero, mockup, features, how-it-works, audience, stats, CTA, footer) and verify component renders
- [ ] 2.2 Add route `/` for landing; configure root redirect based on auth state in app routes and access control; verify authenticated users redirected to `/app`, unauthenticated see landing

## 3. Authentication UX

- [ ] 3.1 Restyle Login component with split-screen layout, password visibility toggle, and visible validation messages; verify toggle and validation behavior
- [ ] 3.2 Restyle Register component with split-screen layout, password visibility toggle, and visible validation messages; verify toggle and validation behavior

## 4. App Shell

- [ ] 4.1 Create AppShell component with collapsible role-filtered sidebar (icons+labels), responsive behavior, top bar with avatar/name/role badge and logout; verify role filtering and mobile collapse
- [ ] 4.2 Update routing to wrap authenticated routes under AppShell; verify navigation and guards still function

## 5. Connected Home

- [ ] 5.1 Create ConnectedHome component at `/app` with welcome message, role-aware KPIs and shortcuts; verify role-based rendering and auth guard
- [ ] 5.2 Wire /app route into app routes; verify unauthenticated redirected to login

## 6. Restyle Existing Screens

- [ ] 6.1 Restyle Employees, Teams, Leave Requests, Leave Types, Team Calendar, Dashboard to use shared components and design tokens; verify no regressions in existing unit tests
- [ ] 6.2 Add loading/empty states and toast integration where appropriate; verify UX states render correctly

## 7. End-to-end Verification

- [ ] 7.1 Run full test suite `npx ng test --watch=false` and verify all tests pass
- [ ] 7.2 Run production build `npm run build` and verify successful build

## Workflow follow-up

- Archive the change after implementation review and verification
