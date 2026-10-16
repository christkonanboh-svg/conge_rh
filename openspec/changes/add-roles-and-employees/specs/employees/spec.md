# Spec Delta

## Purpose

Permettre au service RH de gérer les employés et les équipes de l'organisation, chaque employé étant rattaché à une équipe et à un manager, avec persistance locale.

## ADDED Requirements

### Requirement: Création d'un employé

Le système SHALL permettre de créer un employé en renseignant un profil (nom, prénom, identifiant de connexion, rôle, équipe, manager) et SHALL rejeter toute création dont l'identifiant de connexion est déjà utilisé.

#### Scenario: Création réussie

- **WHEN** un profil valide avec un identifiant de connexion encore libre est soumis
- **THEN** l'employé est créé et conservé de façon persistante

#### Scenario: Identifiant de connexion déjà utilisé

- **WHEN** un identifiant de connexion déjà utilisé est soumis
- **THEN** la création est refusée et aucun employé n'est ajouté

#### Scenario: Profil incomplet

- **WHEN** un profil dont des champs obligatoires (nom, prénom, identifiant, role) sont manquants est soumis
- **THEN** la création est refusée

### Requirement: Consultation des employés

Le système SHALL permettre de lister tous les employés enregistrés et d'en consulter le détail, en indiquant pour chacun son rôle, son équipe et son manager.

#### Scenario: Liste des employés

- **WHEN** les employés enregistrés sont demandés
- **THEN** la liste complète est affichée avec rôle, équipe et manager de chaque employé

#### Scenario: Détail d'un employé

- **WHEN** le détail d'un employé existant est demandé
- **THEN** son profil complet est affiché

### Requirement: Modification d'un employé

Le système SHALL permettre de modifier le profil d'un employé existant (nom, prénom, rôle, équipe, manager) et SHALL persister les modifications.

#### Scenario: Modification réussie

- **WHEN** un profil d'employé existant est modifié avec des valeurs valides
- **THEN** les modifications sont enregistrées de façon persistante

#### Scenario: Modification d'un employé inexistant

- **WHEN** une modification cible un employé qui n'existe pas
- **THEN** la modification est refusée

### Requirement: Suppression d'un employé

Le système SHALL permettre de supprimer un employé et SHALL préserver la cohérence des équipes et des affectations de manager restantes.

#### Scenario: Suppression réussie

- **WHEN** une suppression d'un employé existant est demandée
- **THEN** l'employé est retiré du stockage persistant

#### Scenario: Cohérence après suppression

- **WHEN** un employé qui était référencé comme manager d'autres employés est supprimé
- **THEN** les employés concernés ne conservent pas de référence vers le manager supprimé

### Requirement: Affectation d'un manager

Le système SHALL exiger qu'un manager soit affecté à chaque employé et SHALL valider que le manager référencé correspond à un employé existant dont le rôle est Manager ou RH/Admin.

#### Scenario: Création sans manager refusée

- **WHEN** un employé est créé ou modifié sans manager affecté
- **THEN** l'opération est refusée

#### Scenario: Manager inexistant refusé

- **WHEN** un employé est affecté à un manager qui n'existe pas
- **THEN** l'opération est refusée

#### Scenario: Manager au rôle incompatible refusé

- **WHEN** un employé est affecté à un manager dont le rôle n'est ni Manager ni RH/Admin
- **THEN** l'opération est refusée

#### Scenario: Affectation valide

- **WHEN** un employé est affecté à un manager existant
- **THEN** l'affectation est enregistrée de façon persistante

### Requirement: Cohérence de la hiérarchie

Le système SHALL refuser qu'un employé soit désigné comme son propre manager.

#### Scenario: Auto-affectation refusée

- **WHEN** un employé est affecté comme son propre manager
- **THEN** l'opération est refusée

### Requirement: Gestion des équipes

Le système SHALL permettre de créer, renommer et supprimer des équipes, et SHALL persister ces équipes de façon durable.

#### Scenario: Création d'une équipe

- **WHEN** une nouvelle équipe avec un nom unique est créée
- **THEN** l'équipe est enregistrée de façon persistante

#### Scenario: Renommage d'une équipe

- **WHEN** une équipe existante est renommée avec un nom valide
- **THEN** le nouveau nom est persisté

#### Scenario: Suppression d'une équipe

- **WHEN** une équipe existante est supprimée
- **THEN** l'équipe est retirée et les employés qui y étaient rattachés ne conservent pas de référence vers l'équipe supprimée

### Requirement: Persistance des employés et des équipes

Le système SHALL persister les employés et les équipes dans le LocalStorage via le StorageService centralisé, et SHALL les rendre disponibles après un rechargement de l'application.

#### Scenario: Persistance après rechargement

- **WHEN** l'application est rechargée après des modifications d'employés ou d'équipes
- **THEN** les employés et les équipes modifiés sont restaurés à l'identique

#### Scenario: Utilisation exclusive du StorageService centralisé

- **WHEN** des données d'employés ou d'équipes sont lues ou écrites
- **THEN** elles passent par le StorageService centralisé
