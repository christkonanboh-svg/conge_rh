# Spec Delta

## Purpose

Provide a shared design system with Tailwind CSS tokens and reusable UI components to ensure consistent styling, spacing, typography, and interactive states across public and authenticated areas of the application.

## ADDED Requirements

### Requirement: Design tokens defined

The system SHALL define Tailwind CSS design tokens (colors, typography with Plus Jakarta Sans, spacing, border radius, shadows, z-index) in a central location (styles or Tailwind configuration) that are applied consistently across all application areas.

#### Scenario: Typography uses Plus Jakarta Sans
- **WHEN** the application loads
- **THEN** the default font family applied to the UI is Plus Jakarta Sans

#### Scenario: Primary color tokens available
- **WHEN** styling components with primary brand color
- **THEN** the design system provides indigo-600 as the primary color token for use in buttons, links and accents

#### Scenario: Semantic color tokens for statuses
- **WHEN** displaying leave request statuses
- **THEN** the design system provides semantic colors (emerald for approved, amber for pending, red for rejected)

### Requirement: Shared UI components

The system SHALL provide a library of reusable UI components (Button, Card, Badge, Input/Select/Textarea, Table, EmptyState, Spinner, Toast, ConfirmationModal, KpiCard) that follow the design tokens and are used by feature components.

#### Scenario: Button variants available
- **WHEN** a component needs an action button
- **THEN** shared button supports primary, secondary and destructive variants with consistent styling and disabled/loading states

#### Scenario: Empty state component available
- **WHEN** a list or view has no data
- **THEN** the shared EmptyState component renders a message and optional action button

#### Scenario: Toast component for notifications
- **WHEN** an operation succeeds or fails
- **THEN** the system can display success and error toast notifications using the shared toast component
