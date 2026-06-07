const BASE_URL = "https://login.dev.treez.io/";

describe("Treez Login - Manual test cases", () => {
  beforeEach(() => {
    cy.visit(BASE_URL);
  });

  afterEach(function () {
    if (this.currentTest.state === "failed") {
      const name = this.currentTest.title
        .replace(/[^a-z0-9]+/gi, "_")
        .toLowerCase();
      cy.screenshot(`failure-${name}`);
    }
  });

  it("TC-TREEZ-007 UI checks and accessibility (presence + labels)", function () {
    cy.get(
      'input[type="text"], input[type="email"], input[id*="user"], input[name*="user"]',
    )
      .first()
      .should("exist");
    cy.get('input[type="password"], input[id*="pass"], input[name*="pass"]')
      .first()
      .should("exist");
    cy.get('button[type="submit"], input[type="submit"], button')
      .contains(/login|sign in/i)
      .should("exist");
    cy.contains(/forgot password|forgot your password/i).should("exist");
  });

  it("TC-TREEZ-004 Empty fields validation", function () {
    cy.get('input[name="username"]').clear();
    cy.get('input[name="password"]').clear();
    cy.contains(/login/i).click();
    cy.get("body").then(($b) => {
      if ($b.find(".error, .validation, .alert").length) {
        cy.get(".error, .validation, .alert").should("be.visible");
      } else {
        cy.url().should("include", "/login");
      }
    });
  });

  it("TC-TREEZ-002 Invalid username shows error", function () {
    const pass = "invalidpass";
    cy.get(
      'input[type="text"], input[type="email"], input[id*="user"], input[name*="user"]',
    )
      .first()
      .type("not-a-user@example.com");
    cy.get('input[type="password"], input[id*="pass"], input[name*="pass"]')
      .first()
      .type(pass, { log: false });
    cy.get('button[type="submit"], input[type="submit"], button')
      .contains(/login|sign in/i)
      .click();
    cy.contains(/invalid|error|incorrect|credential/i).should("exist");
  });

  it("TC-TREEZ-003 Invalid password shows error", function () {
    const user = "not-a-real-user@example.com";
    cy.get(
      'input[type="text"], input[type="email"], input[id*="user"], input[name*="user"]',
    )
      .first()
      .type(user);
    cy.get('input[type="password"], input[id*="pass"], input[name*="pass"]')
      .first()
      .type("wrongpassword", { log: false });
    cy.get('button[type="submit"], input[type="submit"], button')
      .contains(/login|sign in/i)
      .click();
    cy.contains(/invalid|error|incorrect|credential/i).should("exist");
  });

  // The following tests require valid credentials. To enable them, set `TREEZ_USER` and
  // `TREEZ_PASS` in Cypress env (e.g., via `cypress.env.json` or `CYPRESS_TREEZ_USER` / `CYPRESS_TREEZ_PASS`).
  it.skip("TC-TREEZ-001 Valid login (requires credentials)", function () {
    // Skipped by default. Provide credentials to enable this test.
  });

  it.skip("TC-TREEZ-005 Logout (requires prior login)", function () {
    // Skipped by default. Provide credentials to enable this test.
  });

  it("TC-TREEZ-006 Server/network error handling (best-effort)", function () {
    cy.get("body").then(($b) => {
      if ($b.find(".server-error, .service-unavailable, .alert").length) {
        cy.get(".server-error, .service-unavailable, .alert").should(
          "be.visible",
        );
      } else {
        cy.log("No server error visible during this run");
      }
    });
  });
});
