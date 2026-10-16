# Spec Delta

## Purpose

Permettre d'explorer les demandes de congé par la recherche et le filtrage, et d'en synthétiser l'activité au moyen d'indicateurs et de graphiques adaptés au rôle de l'utilisateur.

## ADDED Requirements

### Requirement: Filtres sur la liste des demandes

Le système SHALL permettre de filtrer la liste des demandes par statut, par type de congé, par période (dates de début et de fin) et par employé.

#### Scenario: Filtrage par statut

- **WHEN** un statut est sélectionné comme filtre
- **THEN** seules les demandes de ce statut sont présentées

#### Scenario: Filtrage par type

- **WHEN** un type de congé est sélectionné comme filtre
- **THEN** seules les demandes de ce type sont présentées

#### Scenario: Filtrage par période

- **WHEN** une période est renseignée comme filtre
- **THEN** seules les demandes dont la période intersecte cette plage sont présentées

#### Scenario: Filtrage par employé

- **WHEN** un employé est sélectionné comme filtre
- **THEN** seules les demandes de cet employé sont présentées

### Requirement: Recherche textuelle

Le système SHALL permettre une recherche textuelle sur les demandes par nom ou prénom de l'employé.

#### Scenario: Recherche par nom

- **WHEN** un texte est saisi dans la recherche
- **THEN** seules les demandes dont l'employé correspond au texte sont présentées

### Requirement: Combinaison des critères

Le système SHALL appliquer conjointement les filtres et la recherche textuelle actifs, et SHALL permettre de les réinitialiser.

#### Scenario: Critères cumulés

- **WHEN** plusieurs filtres et une recherche sont actifs simultanément
- **THEN** seules les demandes satisfaisant tous les critères sont présentées

#### Scenario: Réinitialisation

- **WHEN** l'utilisateur réinitialise les filtres
- **THEN** la liste complète de son périmètre est de nouveau présentée

### Requirement: Portée des filtres selon le rôle

Le système SHALL appliquer la recherche et les filtres uniquement dans le périmètre déjà accessible au rôle : un employé filtre ses propres demandes, un manager celles de son équipe, et le RH l'ensemble des demandes.

#### Scenario: Filtrage limité au périmètre

- **WHEN** un utilisateur applique un filtre
- **THEN** les résultats restent limités aux demandes qu'il est autorisé à consulter

### Requirement: Indicateurs du tableau de bord

Le système SHALL afficher un tableau de bord présentant au moins : la répartition des demandes par statut, le total de jours approuvés et le taux d'absence.

#### Scenario: Indicateurs affichés

- **WHEN** l'utilisateur ouvre le tableau de bord
- **THEN** les indicateurs de répartition des statuts, de jours approuvés et de taux d'absence sont présentés

#### Scenario: Calcul du taux d'absence

- **WHEN** le taux d'absence est calculé
- **THEN** il correspond au rapport entre les jours de congé approuvés et les jours ouvrés de la période de référence

### Requirement: Graphiques du tableau de bord

Le système SHALL présenter des graphiques (Chart.js) représentant les congés par mois, les congés par type, et le taux d'absence.

#### Scenario: Congés par mois

- **WHEN** le tableau de bord est affiché
- **THEN** un graphique présente le nombre de jours de congé par mois

#### Scenario: Congés par type

- **WHEN** le tableau de bord est affiché
- **THEN** un graphique présente la répartition des congés par type

#### Scenario: Taux d'absence

- **WHEN** le tableau de bord est affiché
- **THEN** un graphique présente l'évolution ou la valeur du taux d'absence

### Requirement: Adaptation du tableau de bord au rôle

Le système SHALL adapter les données du tableau de bord au rôle : un employé voit ses propres données, un manager celles de son équipe, et le RH l'ensemble.

#### Scenario: Tableau de bord d'un employé

- **WHEN** un employé affiche le tableau de bord
- **THEN** les indicateurs et graphiques portent uniquement sur ses propres demandes

#### Scenario: Tableau de bord d'un manager

- **WHEN** un manager affiche le tableau de bord
- **THEN** les indicateurs et graphiques portent sur les demandes de son équipe

#### Scenario: Tableau de bord du RH

- **WHEN** le RH affiche le tableau de bord
- **THEN** les indicateurs et graphiques portent sur l'ensemble des demandes
