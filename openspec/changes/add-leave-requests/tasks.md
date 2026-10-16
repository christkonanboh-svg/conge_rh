# Tasks

## 1. Domain models and leave types

- [ ] 1.1 Créer `src/app/core/leave-requests/leave-request.models.ts` (types `LeaveType`, `LeaveRequest`, `LeaveStatus`, `LEAVE_STATUSES`, `LEAVE_STATUS_LABELS`, `LEAVE_TYPES_STORAGE_KEY`, `LEAVE_REQUESTS_STORAGE_KEY`) — vérifier le build TypeScript (`npm run build`)
- [ ] 1.2 Implémenter `LeaveTypeService` (CRUD, nom unique insensible à la casse, signaux) — vérifier avec `src/app/core/leave-requests/leave-type.service.spec.ts` (création, doublon refusé, renommage, suppression)
- [ ] 1.3 Étendre le seed de démonstration pour créer des types de congé et des soldes initiaux si absents — vérifier via un test de seed (pas de reseed quand des données existent)

## 2. Leave request workflow

- [ ] 2.1 Implémenter `LeaveRequestService.submit` (validation type/date, calcul des jours ouvrés via `date-fns`) — vérifier avec `leave-request.service.spec.ts` (période invalide refusée, week-end exclu, statut initial `en_attente`)
- [ ] 2.2 Implémenter `approve`/`refuse` avec contrôle de périmètre manager et traçabilité (`decidedBy`, `decidedAt`) — vérifier : approbation hors périmètre refusée ; décision enregistrée
- [ ] 2.3 Implémenter `cancel` réservé à l'auteur d'une demande `en_attente` — vérifier : annulation d'une demande traitée refusée
- [ ] 2.4 Implémenter la lecture filtrée par rôle (employé : ses demandes ; manager : son équipe via `UserRepository` ; RH : toutes) — vérifier avec des scénarios de filtrage dans le spec
- [ ] 2.5 Intégrer le contrôle de solde à l'approbation (types `requiresBalance`) — vérifier qu'une approbation dépassant le solde restant est refusée

## 3. Leave balances

- [ ] 3.1 Implémenter `LeaveBalanceService` (CRUD des soldes annuels par employé/type, clé `leaveBalances`) — vérifier avec `leave-balance.service.spec.ts`
- [ ] 3.2 Implémenter le calcul `used`/`remaining` à partir des demandes approuvées de l'année — vérifier : refusée/en attente non déduites, approuvée déduite
- [ ] 3.3 Exposer les consultations de soldes selon le rôle (employé : lui-même ; RH : tous) — vérifier avec des scénarios de filtrage

## 4. UI features and routing

- [ ] 4.1 Créer `src/app/features/leave-requests/leave-requests.ts` : formulaire de demande + liste adaptée au rôle (création, approbation/refus, annulation) — vérifier avec `leave-requests.spec.ts` (rendu et actions de base)
- [ ] 4.2 Créer `src/app/features/leave-types/leave-types.ts` : écran RH de gestion des types — vérifier avec `leave-types.spec.ts`
- [ ] 4.3 Ajouter les routes `/requests` (tous rôles) et `/leave-types` (`roleGuard('rh')`) dans `app.routes.ts` et mettre à jour `NAV_ITEMS` — vérifier avec `app.routes.spec.ts` (accès RH et non-RH) et le menu filtré par rôle dans `shell.spec.ts`
- [ ] 4.4 Afficher les soldes de l'utilisateur (ou de tous pour le RH) sur l'écran des demandes ou un panneau dédié — vérifier le rendu conditionnel par rôle

## 5. End-to-end verification

- [ ] 5.1 Lancer la suite complète `npx ng test --watch=false` et corriger toute régression — vérifier : tout est vert
- [ ] 5.2 Lancer `npm run build` et vérifier que le build de production réussit sans erreur
- [ ] 5.3 Vérification navigateur (Chrome headless/CDP) : un employé crée une demande, son manager l'approuve, le solde est mis à jour ; une demande hors périmètre ne peut pas être validée ; les données persistent après rechargement

## Workflow follow-up

- Archiver le change une fois la revue satisfaite (les capabilities `leave-requests` et `leave-balances` seront alors créées dans les specs principales).
