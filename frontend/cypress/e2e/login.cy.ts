describe('Login Flow', () => {
  beforeEach(() => {
    // Visit the login page before each test
    cy.visit('/login');
  });

  it('should display login form', () => {
    // Check that the login form elements are visible
    cy.get('h2').should('contain.text', 'Login');
    cy.get('#username').should('be.visible');
    cy.get('#password').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should show error with invalid credentials', () => {
    // Attempt login with invalid credentials
    cy.get('#username').type('invaliduser');
    cy.get('#password').type('invalidpassword');
    cy.get('button[type="submit"]').click();

    // Check for error message
    cy.get('.alert-error').should('be.visible');
  });

  it('should redirect to dashboard after successful login', () => {
    // Intercept the login API call
    cy.intercept('POST', 'http://localhost:3000/api/auth/login', {
      statusCode: 200,
      body: {
        success: true,
        token: 'fake-token',
        user: {
          username: 'testuser',
          userType: 'student',
          token: 'fake-token'
        }
      }
    }).as('loginRequest');

    // Login with test credentials
    cy.get('#username').type('testuser');
    cy.get('#password').type('testpassword');
    cy.get('button[type="submit"]').click();

    // Wait for the API call to complete
    cy.wait('@loginRequest');
    
    // Verify redirect to dashboard
    cy.url().should('include', '/user-dashboard');
  });
});