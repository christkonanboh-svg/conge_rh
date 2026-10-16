# Proposal

## Why

Une fois les demandes de congé et leurs statuts en place, la liste brute devient difficile à exploiter : le manager n'a aucune vue partagée des absences de son équipe pour repérer les chevauchements, et le RH n'a aucun indicateur global. Chart.js et ng2-charts sont déjà des dépendances du projet mais ne sont pas encore utilisés.

## What Changes

- Calendrier mensuel d'équipe : vue mensuelle affichant les congés **approuvés** des membres d'une équipe, avec navigation d'un mois à l'autre ; les jours couverts par un employé sont mis en évidence.
- Détection des chevauchements : le calendrier signale les jours où plusieurs membres de l'équipe sont absents simultanément.
- Recherche et filtres sur la liste des demandes : filtrage par statut, type de congé, période et employé, complété par une recherche textuelle.
- Tableau de bord : indicateurs clés (nombre de demandes par statut, jours approuvés, taux d'absence) et graphiques Chart.js (congés par mois, congés par type, taux d'absence) adaptés au rôle — un employé voit ses propres données, un manager celles de son équipe, le RH l'ensemble.

## Capabilities

### New Capabilities

- `team-calendar`: Calendrier mensuel des congés approuvés d'une équipe, avec navigation par mois et détection des chevauchements d'absence entre membres.
- `leave-reporting`: Recherche et filtres sur les demandes de congé, et tableau de bord à indicateurs et graphiques (Chart.js) adapté au rôle de l'utilisateur.

### Modified Capabilities

<!-- Aucune : ce change ajoute des vues et agrégations au-dessus du domaine
     `leave-requests` / `leave-balances` introduit par `add-leave-requests`,
     sans modifier le comportement déjà spécifié. -->

## Impact

- Code : nouvelles features `src/app/features/team-calendar/` et `src/app/features/dashboard/` ; enrichissement de `src/app/features/leave-requests/` avec les filtres ; sélecteurs dérivés côté `src/app/core/leave-requests/` et `src/app/core/leave-balances/` ; routes `/calendar` et `/dashboard` dans `app.routes.ts` ; entrées correspondantes dans `NAV_ITEMS` (`core/access-control/access-control.ts`).
- Dépendances : `chart.js` et `ng2-charts` (déjà présents) ; `date-fns` (déjà présent). Aucune nouvelle dépendance.
- Dépendance fonctionnelle : suppose le change `add-leave-requests` (types, demandes, soldes) implémenté au préalable.
