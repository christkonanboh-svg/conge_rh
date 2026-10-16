# Design

## Context

Voir `proposal.md` pour la motivation. Contraintes structurantes :

- Angular 22, composants standalone, signals (`@angular/core`), routing via `provideRouter`.
- Aucune communication backend : toute persistance passe par le LocalStorage.
- La persistance doit être centralisée dans un `StorageService` (contrainte projet dans `openspec/config.yaml`).
- Hachage obligatoire via Web Crypto (`crypto.subtle`, PBKDF2 + sel).
- Aucun module d'auth n'existe encore (`src/app` ne contient que le squelette `app.ts`, `app.config.ts`, `app.routes.ts`).
- Prétexte de tests : Vitest + jsdom déjà présents (`devDependencies`).

## Goals / Non-Goals

**Goals:**
- Un service d'authentification unique exposant l'état via des signals (utilisateur courant, session).
- Un `StorageService` centralisé, seule voie d'accès au LocalStorage.
- Hachage PBKDF2 + sel isolé dans un utilitaire dédié (testable et réutilisable).
- Seed idempotent des comptes de démonstration au démarrage.
- Guards de route basés sur la session et le rôle.

**Non-Goals:**
- Toute communication réseau/backend (interdit par le projet).
- Récupération de mot de passe, MFA, verrouillage de compte (hors périmètre).
- Cryptographie résistante à un attaquant ayant un accès complet au LocalStorage (limite intrinsèque du client-only).
- Gestion complète des employés/équipes (capabilities ultérieures).

## Decisions

### 1. Découpage des responsabilités
- `StorageService` : lectures/écritures LocalStorage typées, JSON sérialisé, préfixage des clés et gestion des erreurs (données corrompues, quota).
- `PasswordHasher` (utilitaire) : `hash(password, salt?)` → `{ hash, salt, iterations, algorithm }` et `verify(password, stored)` via `crypto.subtle`.
- `AuthService` : orchestration (inscription, connexion, déconnexion, seed, état session) exposé par signals.
- `authGuard` / `roleGuard` : guards fonctionnels Angular lisant `AuthService`.
- Composants d'auth standalone : formulaires inscription/connexion (Reactive Forms), textes en français.

Alternative écartée : tout mettre dans `AuthService`. Rejeté car la contrainte projet impose un `StorageService` centralisé et parce que le hachage isolé est plus testable.

### 2. Schéma de stockage local
- Clé `conge_rh.users` : tableau de `StoredUser { id, email, role, passwordHash, salt, iterations, createdAt }`. Aucun champ mot de passe en clair.
- Clé `conge_rh.session` : `{ userId, issuedAt }` (référence au compte, pas de secret). Restaurée au démarrage et invalidée si l'utilisateur référencé n'existe plus.
- Alternative écartée : stocker le hash dans la session — inutile et augmente la surface d'exposition.

### 3. Hachage PBKDF2
- `crypto.subtle.importKey` (PBKDF2, UTF-8) puis `deriveBits` avec SHA-256, sel aléatoire de 16 octets (`crypto.getRandomValues`), itérations ≥ 100 000, sortie 256 bits encodée en base64.
- Sel propre à chaque compte, stocké à côté du hash.
- Vérification en recalculant la dérivation avec le sel stocké, puis comparaison.
- Alternative écartée : SHA-256 simple — non adapté aux mots de passe (pas de coût, pas de sel).

### 4. Seed idempotent
- Au démarrage (APP_INITIALIZER ou appel au bootstrap), `AuthService.seedDemoAccounts()` vérifie si `conge_rh.users` est vide. Si oui, crée un compte par rôle (Employé, Manager, RH/Admin) avec mots de passe hachés et identifiants documentés.
- Alternative écartée : reseed à chaque lancement — écraserait les comptes utilisateurs.

### 5. État réactif
- `AuthService.currentUser` et `isAuthenticated` exposés comme `signal`/`computed` dérivés de la session en mémoire. Les guards et composants consomment ces signals (pas d'abonnement RxJS nécessaire).
- Alternative écartée : `BehaviorSubject` — signals est la convention Angular 22 du projet.

## Risks / Trade-offs

- [Sécurité limitée côté client] Un utilisateur avec accès au LocalStorage peut modifier les comptes → Mitigation : clairement assumé (pas de backend) ; le hachage protège la confidentialité des mots de passe, pas l'intégrité des données.
- [Coût PBKDF2 sur appareils lents] Itérations élevées = latence au login → Mitigation : cible 100k itérations, ajustable ; exécution asynchrone sans bloquer l'UI.
- [Données LocalStorage corrompues ou indisponibles] (navigation privée, quota) → Mitigation : `StorageService` capture et gère les erreurs, retourne des valeurs par défaut sûres.
- [Enumération d'emails à l'inscription] message différent si l'email existe → Mitigation : accepté pour un devoir ; le message reste en français et non technique.
- [Fuites de session] pas d'expiration → Mitigation possible dans une évolution ; hors périmètre initial.

## Migration Plan

- Changement purement additif : aucun code d'auth existant à migrer.
- Rollback : retirer les nouvelles routes/guards et composants ; les clés LocalStorage peuvent être supprimées manuellement.
- Aucune migration de données externe (aucun backend).
