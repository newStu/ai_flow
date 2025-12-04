describe('Login flow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/login');
  });

  it('should display login form', () => {
    cy.get('h2').should('contain', 'Sign in to your account');
    cy.get('input[name="username"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
  });

  it('should allow a user to log in', () => {
    cy.get('input[name="username"]').type('testuser');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/dashboard');
  });
});
