# team-calendar Specification

## Purpose
Offrir une vue mensuelle partagée des congés approuvés d'une équipe, afin de visualiser les absences et d'anticiper les chevauchements au sein de l'équipe.

## Requirements

### Requirement: Calendrier mensuel des congés approuvés

Le système SHALL afficher un calendrier au mois présentant, pour l'équipe consultée, les jours couverts par les congés au statut « approuvée ».

#### Scenario: Congés approuvés affichés

- **WHEN** le calendrier d'équipe d'un mois est affiché
- **THEN** les demandes approuvées dont la période couvre ce mois y apparaissent, jour par jour

#### Scenario: Demandes non approuvées exclues

- **WHEN** une demande est en attente, refusée ou annulée
- **THEN** elle n'apparaît pas dans le calendrier

### Requirement: Navigation par mois

Le système SHALL permettre de naviguer vers le mois précédent et le mois suivant.

#### Scenario: Changement de mois

- **WHEN** l'utilisateur navigue vers un autre mois
- **THEN** le calendrier affiche les congés approuvés correspondant à ce mois

### Requirement: Détection des chevauchements

Le système SHALL identifier et signaler les jours pour lesquels au moins deux membres de l'équipe consultée ont un congé approuvé simultané.

#### Scenario: Chevauchement signalé

- **WHEN** plusieurs membres de l'équipe ont un congé approuvé sur un même jour
- **THEN** ce jour est signalé comme chevauchement dans le calendrier

#### Scenario: Absence sans chevauchement

- **WHEN** un seul membre de l'équipe est absent sur un jour donné
- **THEN** ce jour n'est pas signalé comme chevauchement

### Requirement: Sélection de l'équipe selon le rôle

Le système SHALL restreindre la sélection d'équipe selon le rôle : un employé et un manager consultent les équipes auxquelles ils ont accès, et le RH SHALL pouvoir consulter n'importe quelle équipe.

#### Scenario: Consultation par le RH

- **WHEN** le RH ouvre le calendrier
- **THEN** il peut choisir n'importe quelle équipe et en afficher le calendrier

#### Scenario: Consultation par un membre d'équipe

- **WHEN** un employé ou un manager consulte le calendrier
- **THEN** il accède à la vue de son équipe

### Requirement: Persistance de la sélection de période

Le système SHALL conserver le mois et l'équipe sélectionnés lors de la navigation dans l'application.

#### Scenario: Retour sur le calendrier

- **WHEN** l'utilisateur revient sur le calendrier après avoir quitté la page
- **THEN** le mois et l'équipe précédemment sélectionnés sont restaurés
