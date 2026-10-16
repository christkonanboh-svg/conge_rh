# Spec Delta

## Purpose

Enhance the authentication experience with split-screen layouts for login and registration, password visibility toggle, and visible form validation states to improve usability and visual consistency.

## ADDED Requirements

### Requirement: Split-screen auth layouts

The login and registration pages SHALL use a split-screen layout with branding/visual content on the left and the authentication form on the right.

#### Scenario: Login split layout
- **WHEN** the user navigates to `/login`
- **THEN** the page displays a left panel with branding content and a right panel containing the login form

#### Scenario: Registration split layout
- **WHEN** the user navigates to `/register`
- **THEN** the page displays a left panel with branding content and a right panel containing the registration form

### Requirement: Password visibility toggle

The login and registration forms SHALL include a password visibility toggle button that allows users to show or hide the password field.

#### Scenario: Toggle to show password
- **WHEN** the user clicks the password visibility toggle
- **THEN** the password field input type changes from "password" to "text"

#### Scenario: Toggle to hide password
- **WHEN** the password is visible and the user clicks the toggle again
- **THEN** the password field input type changes back to "password"

### Requirement: Visible form validation

Authentication forms SHALL display visible validation messages for required fields, invalid email format, and password length constraints as the user interacts with the form.

#### Scenario: Required field validation shown
- **WHEN** a required field is blurred while empty
- **THEN** a visible validation message is displayed for that field

#### Scenario: Email format validation
- **WHEN** an invalid email format is entered and the field is blurred
- **THEN** a visible validation message indicates the email format is invalid
