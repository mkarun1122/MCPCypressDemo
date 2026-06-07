# Test Cases: Treez Login

Application: https://login.dev.treez.io/

Format: Test Case ID | Scenario | Precondition | Steps | Expected Result | Pass/Fail Criteria

---

Test Case ID: TC-TREEZ-001
Scenario: Valid login
Precondition: Test environment reachable; valid test account available
Steps:

1. Open the Application URL.
2. Enter a valid username and password.
3. Click the Login button.
   Expected Result:

- User is redirected to the authenticated landing/dashboard.
- User's name or account indicator is visible.
- No error messages shown.
  Pass/Fail Criteria:
- Pass: Landing/dashboard loads and user identifier visible; no errors.
- Fail: Redirect does not occur or error displayed.

---

Test Case ID: TC-TREEZ-002
Scenario: Invalid username
Precondition: Test environment reachable
Steps:

1. Open the Application URL.
2. Enter an invalid username and a valid password.
3. Click Login.
   Expected Result:

- Login fails and an inline error message appears (e.g., "Invalid username or password").
- Focus remains on username or shows validation indicator.
  Pass/Fail Criteria:
- Pass: Appropriate inline error shown, no access granted.
- Fail: User is granted access or no clear error message displayed.

---

Test Case ID: TC-TREEZ-003
Scenario: Invalid password
Precondition: Test environment reachable
Steps:

1. Open the Application URL.
2. Enter a valid username and an invalid password.
3. Click Login.
   Expected Result:

- Login fails with an appropriate error message.
- Password field is cleared or remains masked per UI behavior.
  Pass/Fail Criteria:
- Pass: Error message displayed; user not authenticated.
- Fail: Authentication succeeds or error missing.

---

Test Case ID: TC-TREEZ-004
Scenario: Empty fields
Precondition: Test environment reachable
Steps:

1. Open the Application URL.
2. Leave username and/or password blank.
3. Click Login.
   Expected Result:

- Inline validation messages appear for required fields.
- Login is not performed.
  Pass/Fail Criteria:
- Pass: Validation messages shown and no authentication occurs.
- Fail: Login proceeds or no validation shown.

---

Test Case ID: TC-TREEZ-005
Scenario: Logout
Precondition: Successful login completed
Steps:

1. Perform a successful login.
2. Locate and click the Logout control.
3. Confirm logout if prompted.
   Expected Result:

- User is returned to the login page.
- Protected routes are inaccessible without re-login.
  Pass/Fail Criteria:
- Pass: User prevented from accessing protected routes after logout.
- Fail: Session persists or protected routes accessible.

---

Test Case ID: TC-TREEZ-006
Scenario: Server/network error handling
Precondition: Ability to simulate server/network error
Steps:

1. Simulate server-side error or network failure at login.
2. Attempt to login with valid credentials.
   Expected Result:

- A user-friendly error message appears (e.g., "Server unavailable, try again later").
- No sensitive error details exposed.
  Pass/Fail Criteria:
- Pass: Friendly error displayed and no sensitive data revealed.
- Fail: Raw error shown or sensitive details exposed.

---

Test Case ID: TC-TREEZ-007
Scenario: UI checks and accessibility
Precondition: Test environment reachable
Steps:

1. Open the Application URL.
2. Verify presence and labels of: logo, username, password, Login button, Forgot password link.
3. Check keyboard navigation and common responsive widths.
   Expected Result:

- All elements present, correctly labelled, and keyboard-navigable.
- Layout adapts and remains usable on narrow viewports.
  Pass/Fail Criteria:
- Pass: Elements present and accessible; responsive layout functional.
- Fail: Missing labels, inaccessible controls, or broken layout.

---

Notes:

- Record screenshots for failed cases.
- Capture browser console errors during tests.
- Replace placeholder credentials with environment-specific test accounts.

write cypress/manual-testing/cypress-results-treez-login.html
