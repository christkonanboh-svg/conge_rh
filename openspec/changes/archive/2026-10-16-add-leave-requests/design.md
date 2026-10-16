# Design

## Context

See `proposal.md` - Why. The project already has an auth domain (`AuthService`, `UserRepository` owning `conge_rh.users`), an employees domain (profiles with `teamId`/`managerId`), a `StorageService` that prefixes keys with `conge_rh.`, role-based guards, and route/nav wiring. This change adds the first business domain; it must reuse those foundations rather than introduce parallel concepts.

Constraints: no backend, all persistence through `StorageService`; Angular standalone components with signals; TypeScript strict; UI in French; one commit per OpenSpec change.

## Goals / Non-Goals

**Goals:**
- Modéliser types de congé, demandes, et soldes avec persistance LocalStorage.
- Réutiliser l'employé existant (`StoredUser`) comme identité de demandeur et le lien `managerId` pour le périmètre du manager.
- Rendre chaque écran lisible selon le rôle (employé / manager / RH).

**Non-Goals:**

- Pas de jours fériés ni de demi-journées (seuls samedi/dimanche sont exclus).
- Pas de notification/email (aucun backend).
- Pas de calendrier ni de graphiques : couverts par le change `add-calendar-filters-dashboard`.
- Pas de délégation de validation ni de circuit multi-niveaux.

## Decisions

### Modèles et clés de stockage

Trois clés LocalStorage, via `StorageService` (préfixe automatique `conge_rh.`) :

- `leaveTypes` : `LeaveType { id, name, color, requiresBalance, createdAt }`.
- `leaveRequests` : `LeaveRequest { id, employeeId, leaveTypeId, startDate, endDate, workingDays, status, createdAt, decidedAt?, decidedBy?, reason? }`.
- `leaveBalances` : `LeaveBalance { id, employeeId, leaveTypeId, year, allowance }` — la consommation est **dérivée**, jamais stockée.

Statuts : `LeaveStatus = 'en_attente' | 'approuvee' | 'refusee' | 'annulee'`.

Alternative écartée : stocker `used`/`remaining` dans le solde. Rejetée car la source de vérité resterait les demandes, avec risque de désynchronisation ; on recalcule à la lecture.

### Services et répartition

- `core/leave-requests/leave-request.models.ts` : types, statuts, labels FR, `LEAVE_STATUSES`.
- `core/leave-requests/leave-type.service.ts` : CRUD des types (nom unique insensible à la casse), signaux.
- `core/leave-requests/leave-request.service.ts` : création, transition de statut (`submit`, `approve`, `refuse`, `cancel`), lecture filtrée par rôle, calcul des jours ouvrés.
- `core/leave-balances/leave-balance.service.ts` : gestion des soldes annuels + calcul `used`/`remaining` en croisant `leaveRequests`.

Chaque service suit le pattern existant : `StorageService`, `signal` public en lecture seule, `MutationResult { success, error?, ... }`, messages d'erreur en français.

### Périmètre du manager

Réutilise l'affectation existante : le manager est `employee.managerId`. Le périmètre = demandes dont `employeeId ∈ { employés avec managerId === currentUser.id }`. Lu via `UserRepository` (déjà source de vérité des utilisateurs). Le RH n'a pas de filtre.

### Jours ouvrés

Calcul avec `date-fns` (`eachDayOfInterval` + `isWeekend`) : on compte les jours de l'intervalle inclusif hors samedi/dimanche. `differenceInCalendarDays` sert au contrôle de cohérence. Alternative écartée : lib de jours ouvrés + jours fériés FR ; sur-dimensionné et dépendant d'un calendrier de fériés hors périmètre.

### Contrôle du solde à l'approbation

À l'approbation d'une demande dont le type `requiresBalance` est vrai, on vérifie `remaining >= workingDays`; sinon l'approbation échoue avec un message explicite. Les types sans suivi de solde (ex. maladie, sans solde) ne sont pas bloqués.

### Routes et navigation

Nouvelles routes sous la coquille existante (`authGuard` + `roleGuard`) :
- `/requests` (tous rôles) : la vue s'adapte au rôle (mes demandes / demandes de l'équipe / toutes).
- `/leave-types` (`roleGuard('rh')`) : gestion des types.

`NAV_ITEMS` (`core/access-control/access-control.ts`) reçoit l'entrée `Demandes` (tous) et `Types de congé` (rh).

### Seed

Étend le seed de démonstration : 3–4 types (Congé payé, RTT, Maladie, Sans solde), quelques soldes annuels pour l'année courante et quelques demandes réparties entre employé/manager/RH (au moins une en attente dans le périmètre du manager démo, une approuvée, une refusée). Idempotent sur présence de données, comme `auth.seed`.

## Risks / Trade-offs

- [Recalcul du solde à chaque lecture] → coût négligeable ici (petits volumes) ; on garde une fonction pure testable.
- [Dérivation `used` couplée aux statuts] → centralisée dans `LeaveBalanceService` pour éviter la duplication.
- [Seed qui crée des demandes référençant des comptes] → le seed s'exécute après celui des comptes ; on lit les utilisateurs via `UserRepository` et on tolère l'absence (pas de demande créée).
- [Jours fériés ignorés] → assumé et documenté ; pourra être un change ultérieur.

## Open Questions

- Faut-il autoriser un employé à poser une demande sur une période déjà couverte par une demande à lui ? Traité par défaut : non bloqué dans ce change (le chevauchement d'équipe est traité par le change calendrier).
