# Design

## Context

See proposal.md - Why. This is a UI/UX enhancement to an existing Angular standalone application using signals, Tailwind CSS 4, and LocalStorage for persistence. No backend communication.

## Goals / Non-Goals

**Goals:**
- Establish a consistent design system with shared tokens and components
- Add public landing page and improve auth UX
- Introduce app shell with role-aware navigation
- Add connected home and restyle existing screens

**Non-Goals:**
- Changing business logic, validation rules, or data models beyond UI needs
- Adding new external runtime dependencies

## Decisions

**D1: Shared UI components location** - Place reusable components under `src/app/shared/components/` (buttons, cards, badges, inputs, table, empty state, spinner, toast, modal, kpi-card). Rationale: clear separation from features; promotes reuse.

**D2: Design tokens** - Define CSS custom properties and Tailwind extensions in `src/styles.css` (or Tailwind config). Rationale: single source of truth; matches existing Tailwind setup.

**D3: Landing page** - Implement as standalone component under `src/app/features/public/landing/` with route `/`. Use CSS for mockup (no images). Rationale: lightweight, aligns with existing patterns.

**D4: Auth UX** - Update `login` and `register` components to use split-screen layout; add password visibility toggle. Keep existing form logic unchanged.

**D5: App shell** - Create `src/app/features/shell/app-shell/` as wrapper for authenticated routes. Move sidebar/topbar into shell; update routing so authenticated children render under app shell. Rationale: clean separation of concerns.

**D6: Connected home** - Standalone component at `src/app/features/home/connected-home/` (or rename/extend). Route `/app`. Use existing guards; role-aware rendering.

**D7: Routing** - Root `/` shows landing for unauthenticated, redirects to `/app` for authenticated. Add `canActivate` logic or use route resolver/guard. Rationale: matches access-control requirement.

## Risks / Trade-offs

- [Risk] Bundle size increase from shared components → Mitigation: tree-shakeable standalone components, lazy load routes
- [Risk] Scope creep if over-styling → Mitigation: reuse components, focus on tokens
- [Risk] Breaking existing shell behavior → Mitigation: evolve existing shell gradually or create new app shell; preserve existing auth guards
