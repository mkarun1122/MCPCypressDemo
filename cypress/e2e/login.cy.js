const LOGIN_URL = "https://practicetestautomation.com/practice-test-login/";
const VALID_USER = "student";
const VALID_PASSWORD = "Password123";

context("Practice Test Automation Login", () => {
  beforeEach(() => {
    cy.visit(LOGIN_URL);
  });

  it("Scenario 7: UI checks", () => {
    cy.get("div#form").should("be.visible");
    cy.contains("Username").should("be.visible");
    cy.contains("Password").should("be.visible");
    cy.get("input#username").should("be.visible");
    cy.get("input#password").should("be.visible");
    cy.get("#submit").should("contain.text", "Submit");
  });

  it("Scenario 1: Valid login", () => {
    cy.get("#username").type(VALID_USER);
    cy.get("#password").type(VALID_PASSWORD);
    cy.get("#submit").click();

    cy.url().should("include", "/logged-in-successfully/");
    cy.contains("Congratulations").should("be.visible");
    cy.contains("Log out").should("be.visible");
  });

  it("Scenario 2: Invalid username", () => {
    cy.get("#username").type("incorrectUser");
    cy.get("#password").type(VALID_PASSWORD);
    cy.get("#submit").click();

    cy.contains("Your username is invalid!").should("be.visible");
  });

  it("Scenario 3: Invalid password", () => {
    cy.get("#username").type(VALID_USER1);
    cy.get("#password").type("incorrectPassword");
    cy.get("#submit").click();

    cy.contains("Your password is invalid!").should("be.visible");
  });

  it("Scenario 4: Empty fields", () => {
    cy.get("#submit").click();

    cy.contains("Your username is invalid!").should("be.visible");
  });

  it("Scenario 6: Error validation", () => {
    cy.get("#username").type("wronguser");
    cy.get("#password").type("wrongpass");
    cy.get("#submit").click();

    cy.contains("invalid").should("be.visible");
  });

  it("Scenario 5: Logout", () => {
    cy.get("#username").type(VALID_USER);
    cy.get("#password").type(VALID_PASSWORD);
    cy.get("#submit").click();

    cy.contains("Log out").should("be.visible").click();
    cy.url().should("include", "/practice-test-login/");
    cy.contains("Submit").should("be.visible");
  });
});
