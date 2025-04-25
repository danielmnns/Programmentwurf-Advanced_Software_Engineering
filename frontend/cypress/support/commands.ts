// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Define Cypress namespace to add custom commands
declare namespace Cypress {
  interface Chainable<Subject> {
    /**
     * Custom command to log in with username and password
     * @example cy.login('username', 'password')
     */
    login(username: string, password: string): Chainable<any>;
    
    /**
     * Custom command to navigate to a course
     * @example cy.navigateToCourse('Course Name')
     */
    navigateToCourse(courseName: string): Chainable<any>;
  }
}

// Implementation of custom commands
Cypress.Commands.add('login', (username: string, password: string) => {
  cy.visit('/login');
  cy.get('#username').type(username);
  cy.get('#password').type(password);
  cy.get('button[type=submit]').click();
});

Cypress.Commands.add('navigateToCourse', (courseName: string) => {
  // Find and click on course with the given name
  cy.contains('.course-item', courseName).click();
});
