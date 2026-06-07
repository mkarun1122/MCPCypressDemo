# Test Plan: Treez Login

Application: https://login.dev.treez.io/

Purpose

- Verify login functionality, error handling, logout, and key UI elements for the Treez login page.

Preconditions

- Test environment reachable at the Application URL.
- Test accounts available (valid and invalid credentials).
- Browser cleared cache and cookies between runs.

Test Cases

1. Treez Valid login

- Steps:
  1. Open the Application URL.
  2. Enter a valid username and password.
  3. Click the `Login` button.
- Expected:
  - User is redirected to the authenticated landing/dashboard.
  - User's name or account indicator is visible.
  - No error messages shown.

2. Treez Invalid username

- Steps:
  1. Open the Application URL.
  2. Enter an invalid username and a valid password.
  3. Click `Login`.
- Expected:
  - Login fails and an inline error message appears (e.g., "Invalid username or password").
  - Focus remains on the username or shows validation indicator.

3. Treez Invalid password

- Steps:
  1. Open the Application URL.
  2. Enter a valid username and an invalid password.
  3. Click `Login`.
- Expected:
  - Login fails with an appropriate error message.
  - Password field is cleared or masked per UI behavior.

4. Treez Empty fields

- Steps:
  1. Open the Application URL.
  2. Leave username and/or password blank.
  3. Click `Login`.
- Expected:
  - Inline validation messages appear for required fields.
  - `Login` is not performed.

5. Treez Logout

- Steps:
  1. Perform a successful login.
  2. Locate and click the `Logout` control.
  3. Confirm logout if prompted.
- Expected:
  - User is returned to the login page.
  - Protected routes are inaccessible without re-login.

6. Treez Error validation (server/network)

- Steps:
  1. Simulate server-side error or network failure at login (if test tooling allows).
  2. Attempt to login with valid credentials.
- Expected:
  - A user-friendly error message appears (e.g., "Server unavailable, try again later").
  - No sensitive error details exposed.

7. Treez UI checks

- Steps:
  1. Open the Application URL.
  2. Verify presence and labels of key elements: logo, username field, password field, `Login` button, `Forgot password` link, and any accessibility attributes.
  3. Check responsive layout at common breakpoints.
- Expected:
  - All elements present, correctly labelled, and keyboard-navigable.
  - Layout adapts and remains usable on narrow viewports.

Test Data

- Valid account: (replace with environment credentials)
- Invalid credentials: `invalid_user` / `badpass`

Acceptance Criteria

- All critical paths (valid login, logout, empty fields) pass.
- Error messages are clear and non-sensitive.
- UI elements meet basic accessibility and responsiveness checks.

Notes

- Record screenshots for failed cases and UI regressions.
- Capture browser console errors during tests.
