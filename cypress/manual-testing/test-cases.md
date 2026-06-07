# Cypress Login Manual Test Cases

Application: https://practicetestautomation.com/practice-test-login/

## Overview

These manual test cases are derived from the Cypress login test plan and are intended to guide Cypress MCP execution.

### Scenario 1: Valid login

- Steps:
  1. Open the login page.
  2. Enter a valid username.
  3. Enter a valid password.
  4. Click the login button.
- Expected:
  - User is redirected to the secure area or dashboard.
  - Confirmation content or welcome message is visible.
- Actual:
- Status:

### Scenario 2: Invalid username

- Steps:
  1. Open the login page.
  2. Enter an invalid username.
  3. Enter a valid password.
  4. Click the login button.
- Expected:
  - An error message is shown indicating invalid credentials.
  - User remains on the login page.
- Actual:
- Status:

### Scenario 3: Invalid password

- Steps:
  1. Open the login page.
  2. Enter a valid username.
  3. Enter an invalid password.
  4. Click the login button.
- Expected:
  - An error message is shown indicating invalid credentials.
  - User remains on the login page.
- Actual:
- Status:

### Scenario 4: Empty fields

- Steps:
  1. Open the login page.
  2. Leave both username and password fields empty.
  3. Click the login button.
  4. Repeat leaving only one field empty.
- Expected:
  - Validation errors are displayed or submission is prevented.
  - User is not logged in.
- Actual:
- Status:

### Scenario 5: Logout

- Steps:
  1. Complete a valid login.
  2. Locate and click the logout button or link.
- Expected:
  - User is returned to the login page.
  - Session is cleared and secure area is no longer accessible.
- Actual:
- Status:

### Scenario 6: Error validation

- Steps:
  1. Attempt login with invalid credentials.
  2. Observe the displayed error text.
- Expected:
  - Error message is clear and visible.
  - Message corresponds to the failure reason.
- Actual:
- Status:

### Scenario 7: UI checks

- Steps:
  1. Open the login page.
  2. Verify the presence of username and password fields.
  3. Verify the login button is present and labeled.
  4. Verify any form labels or hints are visible.
- Expected:
  - Login form elements are present and functional.
  - Labels and buttons are correctly displayed.
- Actual:
- Status:
