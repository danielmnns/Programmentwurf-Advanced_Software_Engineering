describe('Login Flow', () => {
  beforeEach(() => {
    // Visit the login page before each test
    cy.visit('/login');
  });

  it('should display login form', () => {
    // Check that the login form elements are visible
    // Use a more flexible approach to find the heading - it could be translated
    cy.get('mat-card-title, h1, h2, h3').should('exist');
    cy.get('#username').should('be.visible');
    cy.get('#password').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should show error with invalid credentials', () => {
    // Intercept the login API call with error response
    cy.intercept('POST', 'http://localhost:3000/api/auth/login', {
      statusCode: 401,
      body: {
        success: false,
        message: 'Invalid credentials'
      }
    }).as('loginFailure');
    
    // Attempt login with invalid credentials
    cy.get('#username').type('invaliduser');
    cy.get('#password').type('invalidpassword');
    cy.get('button[type="submit"]').click();

    // Wait for the intercepted request
    cy.wait('@loginFailure');
    
    // Check for error message with more flexible selector
    cy.get('.alert-error, .error-message, .error-box, [role="alert"], .info-message-box, .error-message-box')
      .should('exist')
      .should('be.visible');
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