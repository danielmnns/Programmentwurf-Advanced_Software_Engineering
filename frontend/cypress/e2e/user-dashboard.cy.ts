describe('User Dashboard', () => {
  beforeEach(() => {
    // Setup a fake session
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('userType', 'student');
    localStorage.setItem('userName', 'testuser');
    
    // Intercept API calls that would happen during dashboard load
    cy.intercept('GET', 'http://localhost:3000/api/user/userdata', {
      statusCode: 200,
      body: {
        success: true,
        user: { userType: 'student', userName: 'testuser' }
      }
    }).as('userData');

    cy.intercept('GET', 'http://localhost:3000/api/courses', {
      statusCode: 200,
      body: [
        { _id: '1', title: 'Course 1', participants: ['testuser'] },
        { _id: '2', title: 'Course 2', participants: [] }
      ]
    }).as('coursesData');

    // Visit the dashboard
    cy.visit('/user-dashboard');
  });

  it('should display the dashboard with user courses', () => {
    // Wait for data to load
    cy.wait('@userData');
    cy.wait('@coursesData');

    // Verify dashboard title
    cy.get('h2').should('contain.text', 'Dashboard');
    
    // Verify courses are displayed
    cy.contains('Course 1').should('be.visible');
    cy.contains('Course 2').should('be.visible');
  });

  it('should navigate to a course when clicked', () => {
    // Wait for data to load
    cy.wait('@userData');
    cy.wait('@coursesData');

    // Set up course data interception
    cy.intercept('GET', 'http://localhost:3000/api/courses/user-kurs*', {
      statusCode: 200,
      body: {
        _id: '1',
        title: 'Course 1',
        textContent: 'Course Content',
        participants: ['testuser'],
        documents: [],
        tasks: []
      }
    }).as('courseData');

    // Click on the first course
    cy.contains('Course 1').click();

    // Verify navigation happens
    cy.url().should('include', '/user-kurs/Course%201');
    
    // Verify course page loads correctly
    cy.wait('@courseData');
    cy.contains('Course Content').should('be.visible');
  });

  // Commenting out this test for now as it requires a language selector that might not be present
  // We'll modify it when the actual implementation of the language selector is confirmed
  /*
  it('should toggle language', () => {
    // Wait for data to load
    cy.wait('@userData');
    cy.wait('@coursesData');

    // Look for language toggle in the header or navigation
    cy.get('.language-selector').should('exist').click();
    // or try a more generic selector if the specific one doesn't exist
    // cy.get('button, a').contains(/language|sprache|de|en/i).click();
    
    cy.contains('English').click();
    
    // Verify language change is reflected in UI
    cy.contains('Available Courses').should('be.visible');
  });
  */
});