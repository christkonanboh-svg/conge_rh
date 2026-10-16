# Proposal

## Why

Les écrans de gestion existants (employés, équipes, rôles) n'ont encore aucune fonction RH à administrer : il manque le cœur du domaine, la demande de congé et son circuit de validation. Sans ce socle, ni le solde de jours, ni le calendrier d'équipe, ni le tableau de bord ne peuvent exister.

## What Changes

- Types de congés : le RH peut créer, modifier et supprimer des types (nom, couleur d'affichage), utilisés par les demandes et futurs filtres/graphiques.
- Demande de congé : un employé crée une demande (type, date de début, date de fin) ; le nombre de jours ouvrés est calculé automatiquement ; la demande démarre au statut « en attente ».
- Circuit de validation : le manager valide ou refuse les demandes des employés de son équipe ; le RH/Admin peut valider ou refuser toute demande. Toute décision est persistée avec son auteur et sa date.
- Statuts de demande : `en_attente`, `approuvée`, `refusée` et `annulée` (l'employé peut annuler sa propre demande tant qu'elle est en attente).
- Consultation des demandes : chaque acteur voit le périmètre lié à son rôle (l'employé ses propres demandes, le manager celles de son équipe, le RH l'ensemble).
- Soldes de congés : un solde annuel par employé et par type de congé, dont les jours consommés sont dérivés des demandes approuvées et le solde restant calculé automatiquement.
- Persistance de l'ensemble (types, demandes, soldes) dans le LocalStorage via le StorageService centralisé, avec données de démonstration au premier lancement.

## Capabilities

### New Capabilities

- `leave-requests`: Types de congés, création et consultation des demandes de congé, statuts, et circuit de validation par le manager ou le RH.
- `leave-balances`: Soldes annuels de congés par employé et par type, avec consommation dérivée des demandes approuvées et solde restant.

### Modified Capabilities

<!-- Aucune : `access-control`, `auth` et `employees` ne changent pas de comportement
     spécifié ; ce change ajoute un nouveau domaine métier. -->

## Impact

- Code : nouveau domaine `src/app/core/leave-requests/` (modèles, `LeaveTypeService`, `LeaveRequestService`), nouveau domaine `src/app/core/leave-balances/` (modèles, `LeaveBalanceService`), nouvelles fonctionnalités `src/app/features/leave-types/` et `src/app/features/requests/`, `src/app/app.routes.ts` (nouvelles routes avec guards par rôle), `src/app/core/access-control/access-control.ts` (`NAV_ITEMS` enrichi), extension du seed dans `AuthService`/services.
- Données LocalStorage : nouvelles clés `conge_rh.leaveTypes`, `conge_rh.leaveRequests`, `conge_rh.leaveBalances`.
- Dépendances : `date-fns` (déjà présente) pour le calcul des jours ouvrés ; aucune nouvelle dépendance ajoutée.
