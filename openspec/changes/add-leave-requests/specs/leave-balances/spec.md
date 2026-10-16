# Spec Delta

## Purpose

Suivre le solde annuel de congés de chaque employé par type, en déduisant les jours des demandes approuvées et en exposant le solde restant.

## ADDED Requirements

### Requirement: Solde annuel par employé et par type

Le système SHALL attribuer à chaque employé un solde annuel de jours pour chaque type de congé, et SHALL permettre au service RH de définir ou de modifier ce solde.

#### Scenario: Attribution d'un solde

- **WHEN** le RH définit un solde annuel pour un employé et un type de congé
- **THEN** le solde est enregistré de façon persistante pour cette année

#### Scenario: Modification d'un solde

- **WHEN** le RH modifie le solde annuel d'un employé pour un type de congé
- **THEN** le nouveau montant est persisté et remplace le précédent

### Requirement: Consommation dérivée des demandes approuvées

Le système SHALL calculer les jours consommés d'un employé pour un type donné comme la somme des jours ouvrés de ses demandes approuvées sur l'année en cours.

#### Scenario: Consommation après approbation

- **WHEN** une demande d'un employé est approuvée
- **THEN** son nombre de jours ouvrés est déduit du solde du type concerné

#### Scenario: Demande refusée ou en attente

- **WHEN** une demande est refusée, annulée ou encore en attente
- **THEN** ses jours ne sont pas déduits du solde

### Requirement: Calcul du solde restant

Le système SHALL calculer le solde restant d'un employé pour un type comme la différence entre le solde annuel et les jours consommés.

#### Scenario: Solde restant affiché

- **WHEN** le solde d'un employé pour un type est consulté
- **THEN** le solde annuel, les jours consommés et le solde restant sont présentés

#### Scenario: Solde négatif impossible

- **WHEN** une demande approuvée ferait passer le solde restant sous zéro
- **THEN** l'approbation est refusée et le solde reste inchangé

### Requirement: Consultation des soldes selon le rôle

Le système SHALL permettre à un employé de consulter ses propres soldes et au RH de consulter les soldes de tous les employés.

#### Scenario: Consultation par un employé

- **WHEN** un employé consulte ses soldes
- **THEN** seuls ses propres soldes lui sont présentés

#### Scenario: Consultation par le RH

- **WHEN** le RH consulte les soldes
- **THEN** les soldes de tous les employés lui sont présentés

### Requirement: Persistance des soldes

Le système SHALL persister les soldes annuels dans le LocalStorage via le StorageService centralisé et SHALL les restituer après un rechargement de l'application.

#### Scenario: Persistance après rechargement

- **WHEN** l'application est rechargée après modification d'un solde
- **THEN** les soldes enregistrés sont restaurés à l'identique
