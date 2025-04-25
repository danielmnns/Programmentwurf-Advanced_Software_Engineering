describe('Account Management', () => {
  beforeEach(() => {
    // Setup a fake session
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('userType', 'student');
    localStorage.setItem('userName', 'testuser');
    
    // Intercept user data check
    cy.intercept('GET', 'http://localhost:3000/api/user/userdata', {
      statusCode: 200,
      body: {
        success: true,
        user: { userType: 'student', userName: 'testuser' }
      }
    }).as('userData');

    // Visit account page
    cy.visit('/account');
  });

  it('should display account information', () => {
    // Wait for user data to load
    cy.wait('@userData');
    
    // Verify account page elements
    cy.contains('accountSettings').should('be.visible');
    cy.get('#username').should('have.value', 'testuser');
    cy.get('#old-password').should('be.visible');
    cy.get('#new-password').should('be.visible');
  });

  it('should show password requirements when entering new password', () => {
    // Wait for user data to load
    cy.wait('@userData');
    
    // Enter a new password
    cy.get('#new-password').type('newpassword');
    
    // Verify password requirements are shown
    cy.get('.password-requirements').should('be.visible');
    cy.contains('minCharacters').should('be.visible');
    cy.contains('includeUppercase').should('be.visible');
    cy.contains('includeNumber').should('be.visible');
    cy.contains('includeSpecial').should('be.visible');
  });

  it('should show success message after password change', () => {
    // Wait for user data to load
    cy.wait('@userData');
    
    // Intercept password change request
    cy.intercept('POST', 'http://localhost:3000/api/auth/change-password', {
      statusCode: 200,
      body: { passwordChangeSuccess: true }
    }).as('passwordChange');
    
    // Fill in the password change form
    cy.get('#old-password').type('oldpassword');
    cy.get('#new-password').type('NewPassword123!');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Wait for API request to complete
    cy.wait('@passwordChange');
    
    // Verify success message is shown
    cy.get('.alert-success').should('be.visible');
  });

  it('should show error message when password change fails', () => {
    // Wait for user data to load
    cy.wait('@userData');
    
    // Intercept password change request with error
    cy.intercept('POST', 'http://localhost:3000/api/auth/change-password', {
      statusCode: 400,
      body: { 
        passwordChangeSuccess: false,
        message: 'Current password is incorrect'
      }
    }).as('passwordChangeFail');
    
    // Fill in the password change form
    cy.get('#old-password').type('wrongpassword');
    cy.get('#new-password').type('NewPassword123!');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Wait for API request to complete
    cy.wait('@passwordChangeFail');
    
    // Verify error message is shown
    cy.get('.alert-error').should('be.visible');
    cy.contains('Current password is incorrect').should('be.visible');
  });

  it('should log user out when logout button is clicked', () => {
    // Wait for user data to load
    cy.wait('@userData');
    
    // Click logout button
    cy.contains('logout').click();
    
    // Verify redirect to login page
    cy.url().should('include', '/login');
    
    // Verify localStorage items are cleared
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.be.null;
      expect(win.localStorage.getItem('userType')).to.be.null;
      expect(win.localStorage.getItem('userName')).to.be.null;
    });
  });
});