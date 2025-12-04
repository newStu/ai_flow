describe('Registration flow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/register');
  });

  it('should display registration form', () => {
    cy.get('h2').should('contain', 'Create your account');
    cy.get('input[name="username"]').should('be.visible');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('input[name="confirmPassword"]').should('be.visible');
  });

  it('should allow a user to register', () => {
    cy.get('input[name="username"]').type('newuser');
    cy.get('input[name="email"]').type('newuser@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/dashboard');
  });
});
