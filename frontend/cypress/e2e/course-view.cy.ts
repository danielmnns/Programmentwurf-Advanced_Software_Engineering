describe('Course View', () => {
  beforeEach(() => {
    // Setup a fake session
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('userType', 'student');
    localStorage.setItem('userName', 'testuser');
    
    // Intercept authorization check
    cy.intercept('GET', 'http://localhost:3000/api/user/userdata', {
      statusCode: 200,
      body: {
        success: true,
        user: { userType: 'student', userName: 'testuser' }
      }
    }).as('userData');

    // Intercept course data
    cy.intercept('GET', 'http://localhost:3000/api/courses/user-kurs*', {
      statusCode: 200,
      body: {
        _id: '1',
        title: 'Test Course',
        textContent: 'Course Content',
        participants: ['testuser'],
        documents: [
          { name: 'doc1.pdf', url: '/uploads/courseDocuments/doc1.pdf' }
        ],
        tasks: [
          { name: 'Task 1', description: 'Task 1 Description', documents: [] },
          { name: 'Task 2', description: 'Task 2 Description', documents: [] }
        ]
      }
    }).as('courseData');

    // Visit course page
    cy.visit('/user-kurs/Test%20Course');
  });

  it('should display course content', () => {
    // Wait for the course data to load
    cy.wait('@userData');
    cy.wait('@courseData');

    // Verify course title is displayed
    cy.contains('Test Course').should('be.visible');
    
    // Verify course content is displayed
    cy.contains('Course Content').should('be.visible');
    
    // Verify course documents are listed
    cy.contains('doc1.pdf').should('be.visible');
    
    // Verify tasks are listed
    cy.contains('Task 1').should('be.visible');
    cy.contains('Task 2').should('be.visible');
  });

  it('should open PDF preview when document is clicked', () => {
    // Wait for the course data to load
    cy.wait('@userData');
    cy.wait('@courseData');

    // Intercept file URL service
    cy.intercept('GET', '/uploads/courseDocuments/doc1.pdf', {
      statusCode: 200,
      // This is just a placeholder as we can't actually return a PDF
    }).as('pdfRequest');

    // Click on the document
    cy.contains('doc1.pdf').click();
    
    // Verify PDF preview is shown
    cy.get('.pdf-preview').should('be.visible');
    
    // Close the preview
    cy.get('.close-preview-button').click();
    
    // Verify preview is closed
    cy.get('.pdf-preview').should('not.be.visible');
  });

  it('should navigate to task when task is clicked', () => {
    // Wait for the course data to load
    cy.wait('@userData');
    cy.wait('@courseData');

    // Set up task data interception
    cy.intercept('GET', 'http://localhost:3000/api/tasks*', {
      statusCode: 200,
      body: {
        name: 'Task 1',
        description: 'Task 1 Description',
        documents: [],
        submissions: []
      }
    }).as('taskData');

    // Click on a task
    cy.contains('Task 1').click();
    
    // Verify navigation to task page
    cy.url().should('include', '/Test%20Course/Task%201');
    
    // Verify task content is displayed
    cy.wait('@taskData');
    cy.contains('Task 1 Description').should('be.visible');
  });
});