# auth Specification

## Purpose

Permettre l'authentification locale côté client (inscription, connexion, déconnexion) sans backend, avec hachage PBKDF2 + sel, persistance dans le LocalStorage via le StorageService centralisé, session persistée et création automatique de comptes de démonstration au premier lancement.

## Requirements

### Requirement: Inscription avec validation locale

Le système SHALL permettre l'inscription d'un nouvel utilisateur via un formulaire local, en validant les champs obligatoires, en vérifiant l'unicité de l'identifiant (email/utilisateur), et en refusant l'inscription si les données sont invalides.

#### Scenario: Inscription réussie

- **WHEN** un utilisateur soumet des identifiants valides et non existants
- **THEN** un compte est créé et stocké localement avec le mot de passe haché (PBKDF2 + sel)

#### Scenario: Identifiant déjà existant

- **WHEN** un utilisateur tente de s'inscrire avec un identifiant déjà utilisé
- **THEN** l'inscription est refusée et aucun compte n'est créé

#### Scenario: Données d'inscription invalides

- **WHEN** l'utilisateur soumet un formulaire incomplet ou mal formé
- **THEN** l'inscription est refusée sans créer de compte

### Requirement: Connexion avec vérification sécurisée

Le système SHALL permettre la connexion en comparant le mot de passe fourni avec le hash PBKDF2 + sel stocké. Les mots de passe MUST NOT jamais être stockés en clair.

#### Scenario: Connexion réussie

- **WHEN** l'utilisateur fournit des identifiants corrects
- **THEN** une session est créée et persistée localement

#### Scenario: Identifiants incorrects

- **WHEN** l'utilisateur fournit des identifiants incorrects
- **THEN** la connexion est refusée et aucune session n'est établie

#### Scenario: Échec si mot de passe en clair stocké

- **WHEN** un compte serait stocké avec un mot de passe en clair
- **THEN** le système NE DOIT PAS permettre cela (seule la forme hachée+sel est acceptée)

### Requirement: Déconnexion

Le système SHALL permettre à l'utilisateur connecté de se déconnecter, ce qui met fin à la session courante.

#### Scenario: Déconnexion depuis session active

- **WHEN** l'utilisateur se déconnecte alors qu'il est connecté
- **THEN** la session est terminée et les informations de session sont supprimées

#### Scenario: Déconnexion sans session active

- **WHEN** l'utilisateur demande une déconnexion sans session active
- **THEN** le système reste dans un état cohérent sans erreur bloquante

### Requirement: Persistance des comptes et de la session

Le système SHALL persister les comptes et la session dans le LocalStorage via le StorageService centralisé. La persistance SHALL être effective entre les rechargements de l'application.

#### Scenario: Persistance après rechargement

- **WHEN** l'utilisateur se recharge la page après connexion
- **THEN** la session est restaurée si elle est valide

#### Scenario: Comptes persistés après rechargement

- **WHEN** l'application se charge
- **THEN** les comptes existants restent accessibles depuis le LocalStorage

#### Scenario: Utilisation exclusive du StorageService centralisé

- **WHEN** des données d'auth sont lues/écrites
- **THEN** elles DOIVENT passer par le StorageService centralisé

### Requirement: Hachage des mots de passe avec Web Crypto PBKDF2 + sel

Le système SHALL hacher les mots de passe avec Web Crypto (PBKDF2) en utilisant un sel unique par compte. Aucun mot de passe en clair MUST NOT être enregistré ou exposé.

#### Scenario: Hachage à l'inscription

- **WHEN** un compte est créé lors de l'inscription
- **THEN** le mot de passe est transformé en hash PBKDF2 avec un sel généré aléatoirement

#### Scenario: Validation via dérivation PBKDF2

- **WHEN** l'utilisateur se connecte
- **THEN** le hash est recalculé à partir du mot de passe fourni et du sel stocké, puis comparé au hash stocké

#### Scenario: Sel unique par compte

- **WHEN** plusieurs comptes sont créés
- **THEN** chaque compte DOIT avoir son propre sel généré indépendamment

### Requirement: Comptes de démonstration au premier lancement

Le système SHALL créer automatiquement des comptes de démonstration au premier lancement si aucun compte n'existe. Ces comptes SHALL respecter les rôles attendus (Employé, Manager, RH/Admin).

#### Scenario: Seed au premier lancement

- **WHEN** l'application démarre et qu'aucun compte n'est présent dans le stockage
- **THEN** au moins un compte de démonstration par rôle est créé avec des identifiants connus

#### Scenario: Pas de reseed si comptes existent déjà

- **WHEN** l'application démarre et qu'il existe déjà des comptes
- **THEN** aucun compte de démonstration supplémentaire n'est créé

#### Scenario: Comptes de démo avec mots de passe hachés

- **WHEN** les comptes de démonstration sont créés
- **THEN** leurs mots de passe DOIVENT être hachés avec PBKDF2 + sel, jamais en clair

### Requirement: Gestion des rôles et accès

Le système SHALL associer chaque compte à un rôle (Employé, Manager, RH/Admin) et SHALL permettre la vérification de ce rôle pour restreindre l'accès aux fonctionnalités appropriées.

#### Scenario: Attribution de rôle à l'inscription

- **WHEN** un compte est créé
- **THEN** un rôle valide lui est attribué selon les règles définies

#### Scenario: Vérification de rôle

- **WHEN** l'application vérifie les droits
- **THEN** seul un utilisateur avec le rôle requis peut accéder à une ressource protégée

#### Scenario: Rôles supportés

- **WHEN** le système définit des rôles
- **THEN** les rôles DOIVENT inclure au moins Employé, Manager, RH/Admin
