# leave-requests Specification

## Purpose

Permettre aux employés de déposer des demandes de congé typées et à leur manager ou au service RH de les valider ou de les refuser, avec des statuts explicites et une persistance locale.

## Requirements

### Requirement: Gestion des types de congés

Le système SHALL permettre au service RH de créer, renommer et supprimer des types de congé identifiés par un nom unique, et SHALL interdire la création ou le renommage vers un nom déjà utilisé.

#### Scenario: Création d'un type de congé

- **WHEN** le RH crée un type de congé avec un nom encore libre
- **THEN** le type est enregistré et proposé pour les demandes

#### Scenario: Nom de type déjà utilisé

- **WHEN** le RH crée ou renomme un type de congé avec un nom déjà utilisé
- **THEN** l'opération est refusée et le type existant n'est pas modifié

#### Scenario: Suppression d'un type de congé

- **WHEN** le RH supprime un type de congé
- **THEN** le type est retiré et n'est plus proposé pour de nouvelles demandes

### Requirement: Création d'une demande de congé

Le système SHALL permettre à un employé de créer une demande de congé en choisissant un type, une date de début et une date de fin, et SHALL enregistrer la demande avec le statut « en attente ».

#### Scenario: Demande créée

- **WHEN** un employé soumet une demande avec un type, une date de début et une date de fin valides
- **THEN** la demande est enregistrée avec le statut « en attente » et rattachée à cet employé

#### Scenario: Type de congé inexistant

- **WHEN** une demande référence un type de congé qui n'existe pas
- **THEN** la demande est refusée et aucune demande n'est créée

#### Scenario: Période invalide

- **WHEN** une demande est soumise avec une date de fin antérieure à la date de début
- **THEN** la demande est refusée

### Requirement: Calcul des jours ouvrés

Le système SHALL calculer le nombre de jours ouvrés d'une demande en excluant les samedis et dimanches, et SHALL l'enregistrer avec la demande.

#### Scenario: Période couvrant un week-end

- **WHEN** une demande couvre une période incluant des samedis ou dimanches
- **THEN** les jours correspondants ne sont pas comptés dans le nombre de jours ouvrés

#### Scenario: Période d'un seul jour ouvré

- **WHEN** une demande porte sur une seule date tombant un jour ouvré
- **THEN** le nombre de jours ouvrés enregistré est de un

### Requirement: Consultation des demandes selon le rôle

Le système SHALL restreindre la consultation des demandes selon le rôle : un employé ne voit que ses propres demandes, un manager voit les demandes de son équipe, et le RH voit toutes les demandes.

#### Scenario: Consultation par un employé

- **WHEN** un employé consulte les demandes
- **THEN** seules ses propres demandes lui sont présentées

#### Scenario: Consultation par un manager

- **WHEN** un manager consulte les demandes
- **THEN** les demandes des employés qui lui sont rattachés lui sont présentées

#### Scenario: Consultation par le RH

- **WHEN** le RH consulte les demandes
- **THEN** l'ensemble des demandes lui est présenté

### Requirement: Validation par le manager

Le système SHALL permettre à un manager d'approuver ou de refuser une demande « en attente » d'un employé de son équipe, et SHALL interdire la validation des demandes hors de son périmètre.

#### Scenario: Approbation par le manager

- **WHEN** un manager approuve une demande « en attente » d'un employé rattaché à lui
- **THEN** la demande passe au statut « approuvée »

#### Scenario: Refus par le manager

- **WHEN** un manager refuse une demande « en attente » d'un employé rattaché à lui
- **THEN** la demande passe au statut « refusée »

#### Scenario: Demande hors périmètre

- **WHEN** un manager tente de valider une demande d'un employé qui ne lui est pas rattaché
- **THEN** l'opération est refusée

### Requirement: Validation par le RH/Admin

Le système SHALL permettre au service RH d'approuver ou de refuser toute demande « en attente », quel que soit son auteur.

#### Scenario: Approbation par le RH

- **WHEN** le RH approuve une demande « en attente »
- **THEN** la demande passe au statut « approuvée »

#### Scenario: Refus par le RH

- **WHEN** le RH refuse une demande « en attente »
- **THEN** la demande passe au statut « refusée »

### Requirement: Annulation d'une demande par son auteur

Le système SHALL permettre à l'employé auteur d'une demande « en attente » de l'annuler, et SHALL refuser l'annulation d'une demande déjà approuvée ou refusée.

#### Scenario: Annulation d'une demande en attente

- **WHEN** un employé annule sa propre demande « en attente »
- **THEN** la demande passe au statut « annulée »

#### Scenario: Annulation d'une demande déjà traitée

- **WHEN** un employé tente d'annuler une demande déjà approuvée ou refusée
- **THEN** l'opération est refusée et le statut reste inchangé

### Requirement: Traçabilité des décisions de validation

Le système SHALL enregistrer, pour chaque demande validée ou refusée, l'auteur de la décision et la date de la décision.

#### Scenario: Décision tracée

- **WHEN** une demande « en attente » est approuvée ou refusée
- **THEN** la demande conserve l'identité du validateur et la date de la décision

### Requirement: Persistance des types et des demandes

Le système SHALL persister les types de congé et les demandes dans le LocalStorage via le StorageService centralisé, et SHALL les restaurer après un rechargement de l'application.

#### Scenario: Persistance après rechargement

- **WHEN** l'application est rechargée après une création ou une validation
- **THEN** les types et les demandes sont restaurés à l'identique

#### Scenario: Utilisation exclusive du StorageService centralisé

- **WHEN** des types de congé ou des demandes sont lus ou écrits
- **THEN** elles passent par le StorageService centralisé

### Requirement: Données de démonstration des congés

Le système SHALL créer au premier lancement des types de congé et des demandes de démonstration lorsque ces données n'existent pas encore.

#### Scenario: Seed au premier lancement

- **WHEN** l'application démarre sans types ni demandes enregistrés
- **THEN** des types de congé et des demandes de démonstration sont créés

#### Scenario: Pas de reseed

- **WHEN** l'application démarre alors que des types ou des demandes existent déjà
- **THEN** aucune donnée de démonstration supplémentaire n'est créée
