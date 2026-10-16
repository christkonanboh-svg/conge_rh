# Design

## Context

Ce change s'appuie sur le domaine introduit par `add-leave-requests` (types, demandes avec statuts, soldes) — voir proposal.md - Why. Il suppose `LeaveRequestService`, `LeaveTypeService`, `LeaveBalanceService`, `UserRepository`/`TeamService` et la navigation par rôle déjà en place. `chart.js`, `ng2-charts` et `date-fns` sont déjà des dépendances ; aucun backend, tout est dérivé du LocalStorage.

## Goals / Non-Goals

**Goals:**
- Fournir une vue calendaire mensuelle d'équipe des congés approuvés, avec signalement des chevauchements.
- Fournir recherche et filtres sur la liste des demandes, dans le périmètre du rôle.
- Fournir un tableau de bord d'indicateurs et de graphiques Chart.js adapté au rôle.

**Non-Goals:**
- Aucune nouvelle persistance métier : ces vues **lisent** les données existantes.
- Pas d'export (PDF/CSV), pas de planification de capacité ni de suggestion d'arbitrage.
- Pas de modification des règles de demande/validation/solde.

## Decisions

### Calculs extraits en fonctions pures

Toute l'agrégation vit dans des utilitaires purs, testables sans DOM ni canvas :
- `core/leave-requests/leave-filters.util.ts` : `applyLeaveFilters(requests, filters, employees)`.
- `core/leave-requests/team-calendar.util.ts` : `buildMonthGrid(year, month)` et `detectOverlaps(requests, employees, month)` → jours + comptes d'absents.
- `core/leave-reporting/leave-reporting.util.ts` : `computeKpis(requests, employees, period)` et `buildCharts(kpis)`.

Rationale : Chart.js et le calendrier sont difficiles à tester en jsdom ; isoler la logique rend les scénarios des specs vérifiables par des tests unitaires. Alternative écartée : tout calculer dans les composants (non testable, duplication).

### Modèle de filtres

`LeaveRequestFilters { status?: LeaveStatus; leaveTypeId?: string; from?: string; to?: string; employeeId?: string; query?: string }`. Période = intersection avec `[from, to]`. Recherche = `firstName`/`lastName` (insensible à la casse). Les filtres s'appliquent **après** le filtrage par rôle, donc la portée reste garantie par le service.

### Calendrier

Grille générée avec `date-fns` (`startOfMonth`, `endOfMonth`, `startOfWeek(..., { weekStartsOn: 1 })`, `eachDayOfInterval`, `isSameMonth`, `isWeekend`). Chaque cellule référence les demandes approuvées couvrant le jour. Un jour est marqué « chevauchement » quand ≥ 2 membres de l'équipe y sont absents. Sélection d'équipe : RH → toutes les équipes (`TeamService`) ; manager/employé → son `teamId` (profil courant), sans sélecteur.

### Tableau de bord et Chart.js

Enregistrement global via `provideCharts(withDefaultRegisterables())` dans `app.config.ts`, rendu avec `BaseChartDirective` (`ng2-charts`). Trois graphiques : barres « congés par mois » (jours approuvés par mois), camembert/barres « congés par type », ligne/jauge « taux d'absence ». `taux d'absence = jours approuvés / jours ouvrés de la période` (même règle samedi/dimanche que les demandes). Le périmètre de données réutilise le filtrage par rôle de `LeaveRequestService` (employé : lui-même ; manager : son équipe ; RH : tous).

Alternative écartée : tracer les graphiques à la main en SVG — réimplémentation inutile alors que Chart.js est déjà une dépendance.

### Routes et navigation

- `/calendar` (tous rôles) : calendrier d'équipe.
- `/dashboard` (tous rôles) : tableau de bord ; les données s'adaptent au rôle.

`NAV_ITEMS` reçoit `Calendrier` et `Tableau de bord` (tous rôles), plus l'ajout des filtres sur l'écran `/requests` existant.

## Risks / Trade-offs

- [Chart.js en environnement de test/build] → isoler les données dans des fonctions pures et ne tester que celles-ci ; l'enregistrement se fait au bootstrap de l'app.
- [Calendrier peu lisible si une équipe est grande] → limiter l'affichage aux jours et initiales/agents par jour ; densité visuelle à ajuster en UI.
- [Taux d'absence sensible à la période choisie] → documenter la période de référence et l'afficher dans l'interface.
- [Dépendance d'ordre avec `add-leave-requests`] → ce change ne doit pas être implémenté avant que le domaine des demandes existe ; noté dans le proposal et les tâches.
