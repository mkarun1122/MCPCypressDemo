# Cypress Login Manual Test Plan

Application: https://practicetestautomation.com/practice-test-login/

## Objective

Define the manual test plan for the login flow and related UI behavior on the practice test login page.

## Precondition

- Browser is open.
- User is on the login page: https://practicetestautomation.com/practice-test-login/
- Test data is available for valid and invalid credentials.

## Test Scenarios

1. **Valid login**
   - Verify that a user can successfully log in with valid username and password.
   - Expected result: User is redirected to the secure area/dashboard and sees confirmation content.

2. **Invalid username**
   - Verify that login fails when the username is incorrect and password is valid.
   - Expected result: An error message is displayed indicating invalid credentials.

3. **Invalid password**
   - Verify that login fails when the password is incorrect and username is valid.
   - Expected result: An error message is displayed indicating invalid credentials.

4. **Empty fields**
   - Verify login behavior when username and/or password fields are left empty.
   - Expected result: The application displays validation errors or prevents submission.

5. **Logout**
   - Verify that a logged-in user can log out successfully.
   - Expected result: User is returned to the login page and session is cleared.

6. **Error validation**
   - Verify that the correct error messages appear for login failures.
   - Expected result: Error text is clear, visible, and corresponds to the failure reason.

7. **UI checks**
   - Verify that the login form elements are present and correctly labeled.
   - Expected result: Username field, password field, login button, and form labels are visible and functional.

## Deliverable

- This file serves as the reference manual test plan for generating manual test cases and guiding Cypress test automation.
