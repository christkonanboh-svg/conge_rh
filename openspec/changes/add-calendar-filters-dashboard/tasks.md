# Tasks

> Prérequis : le change `add-leave-requests` doit être implémenté (types, demandes, soldes).

## 1. Filtres et recherche

- [x] 1.1 Définir `LeaveRequestFilters` et implémenter `applyLeaveFilters(requests, filters, employees)` dans `core/leave-requests/leave-filters.util.ts` — vérifier avec `leave-filters.util.spec.ts` (statut, type, période par intersection, employé, texte, cumul, réinitialisation)
- [x] 1.2 Ajouter la barre de filtres et la recherche à l'écran des demandes (`features/leave-requests/`), avec réinitialisation — vérifier avec `leave-requests.spec.ts` (les filtres réduisent la liste, la réinitialisation la restaure)
- [x] 1.3 Garantir que les filtres s'appliquent après le filtrage par rôle — vérifier un scénario où un manager ne voit jamais de demandes hors de son équipe même après filtre

## 2. Calendrier d'équipe

- [x] 2.1 Implémenter `buildMonthGrid(year, month)` (semaines du lundi au dimanche via `date-fns`) dans `core/leave-requests/team-calendar.util.ts` — vérifier avec `team-calendar.util.spec.ts` (bornes de mois, alignement des semaines)
- [x] 2.2 Implémenter `detectOverlaps(requests, employees, month)` : jours couverts et drapeau chevauchement si ≥ 2 absents — vérifier (un absent = pas de chevauchement ; deux = chevauchement)
- [x] 2.3 Créer `features/team-calendar/team-calendar.ts` : grille mensuelle des congés approuvés, navigation mois précédent/suivant, jours de chevauchement signalés — vérifier avec `team-calendar.spec.ts` (affichage, changement de mois)
- [x] 2.4 Restreindre la sélection d'équipe selon le rôle (RH : toutes ; manager/employé : son équipe) — vérifier le rendu conditionnel du sélecteur
- [x] 2.5 Ajouter la route `/calendar` (tous rôles) dans `app.routes.ts` et l'entrée `NAV_ITEMS` — vérifier avec `app.routes.spec.ts` et `shell.spec.ts`

## 3. Tableau de bord

- [x] 3.1 Implémenter `computeKpis` (répartition par statut, jours approuvés, taux d'absence) dans `core/leave-reporting/leave-reporting.util.ts` — vérifier avec `leave-reporting.util.spec.ts` (calcul du taux d'absence, jours approuvés)
- [x] 3.2 Implémenter `buildCharts` (congés par mois, congés par type, taux d'absence) — vérifier avec `leave-reporting.util.spec.ts`
- [x] 3.3 Enregistrer Chart.js au bootstrap (`provideCharts(withDefaultRegisterables())` dans `app.config.ts`) — vérifier que l'application démarre et que le build passe
- [x] 3.4 Créer `features/dashboard/dashboard.ts` avec cartes KPI et graphiques `BaseChartDirective`, données filtrées selon le rôle — vérifier avec `dashboard.spec.ts` (les données affichées correspondent au périmètre du rôle)
- [x] 3.5 Ajouter la route `/dashboard` (tous rôles) dans `app.routes.ts` et l'entrée `NAV_ITEMS` — vérifier avec `app.routes.spec.ts` et `shell.spec.ts`

## 4. End-to-end verification

- [ ] 4.1 Lancer la suite complète `npx ng test --watch=false` et corriger toute régression — vérifier : tout est vert
- [ ] 4.2 Lancer `npm run build` et vérifier que le build de production réussit (Chart.js compris)
- [ ] 4.3 Vérification navigateur (Chrome headless/CDP) : filtres fonctionnels, calendrier d'équipe avec chevauchement signalé, tableau de bord cohérent par rôle, persistance après rechargement

## Workflow follow-up

- Archiver le change une fois la revue satisfaite (créera `team-calendar` et `leave-reporting` dans les specs principales), après l'implémentation de `add-leave-requests`.
