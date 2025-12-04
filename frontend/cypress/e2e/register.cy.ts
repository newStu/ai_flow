describe('Registration flow (US2: User Story 2 - User Registration & Email Verification)', () => {
  const baseUrl = 'http://localhost:5173';
  const newUser = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'Test@123456',
  };

  beforeEach(() => {
    cy.visit(`${baseUrl}/register`);
  });

  it('should display registration form with all required fields', () => {
    cy.get('h2').should('contain', 'Create');
    cy.get('input[name="username"]').should('be.visible');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('input[name="confirmPassword"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should show password strength indicator', () => {
    cy.get('input[name="password"]').type('weak');
    cy.contains('Weak').should('be.visible');

    cy.get('input[name="password"]').clear().type('Test@123456');
    cy.contains('Strong').should('be.visible');
  });

  it('should validate password confirmation match', () => {
    cy.get('input[name="password"]').type('Test@123456');
    cy.get('input[name="confirmPassword"]').type('Different@123');
    cy.get('button[type="submit"]').click();
    
    cy.contains('match').should('be.visible');
  });

  it('should check username uniqueness in real-time', () => {
    cy.intercept('GET', '/api/users/check-username/*', {
      statusCode: 409,
      body: { exists: true },
    }).as('checkUsername');

    cy.get('input[name="username"]').type('existinguser');
    cy.wait(500); // Wait for debounce
    cy.wait('@checkUsername');
    cy.contains('already taken').should('be.visible');
  });

  it('should register user and redirect to email verification', () => {
    cy.intercept('POST', '/api/users', {
      statusCode: 201,
      body: { id: 1, username: newUser.username, email: newUser.email },
    }).as('register');

    cy.intercept('POST', '/api/auth/send-verification-email', {
      statusCode: 200,
      body: { message: 'Verification code sent successfully' },
    }).as('sendVerification');

    cy.get('input[name="username"]').type(newUser.username);
    cy.get('input[name="email"]').type(newUser.email);
    cy.get('input[name="password"]').type(newUser.password);
    cy.get('input[name="confirmPassword"]').type(newUser.password);
    cy.get('button[type="submit"]').click();

    cy.wait('@register');
    cy.wait('@sendVerification');
    cy.url().should('include', '/verify-email');
  });

  it('should complete email verification and auto-login', () => {
    // Navigate to verification page with email
    cy.visit(`${baseUrl}/verify-email`, {
      state: { email: newUser.email },
    });

    cy.intercept('POST', '/api/auth/verify-email', {
      statusCode: 200,
      body: {
        access_token: 'fake_access_token',
        refresh_token: 'fake_refresh_token',
      },
    }).as('verifyEmail');

    // Enter 6-digit verification code
    cy.get('input[name="code"]').type('123456');
    cy.get('button').contains('Verify').click();

    cy.wait('@verifyEmail');
    cy.url().should('include', '/dashboard');
  });

  it('should allow resending verification code with countdown', () => {
    cy.visit(`${baseUrl}/verify-email`, {
      state: { email: newUser.email },
    });

    cy.intercept('POST', '/api/auth/send-verification-email', {
      statusCode: 200,
      body: { message: 'Verification code sent successfully' },
    }).as('resendCode');

    // Wait for initial countdown to finish
    cy.contains('Resend code in', { timeout: 61000 }).should('not.exist');
    
    // Click resend button
    cy.contains('Resend verification code').click();
    cy.wait('@resendCode');
    
    // Countdown should restart
    cy.contains('Resend code in').should('be.visible');
  });

  it('should show error for invalid verification code', () => {
    cy.visit(`${baseUrl}/verify-email`, {
      state: { email: newUser.email },
    });

    cy.intercept('POST', '/api/auth/verify-email', {
      statusCode: 401,
      body: { message: 'Invalid or expired verification code' },
    }).as('verifyEmail');

    cy.get('input[name="code"]').type('999999');
    cy.get('button').contains('Verify').click();

    cy.wait('@verifyEmail');
    cy.contains('Invalid or expired').should('be.visible');
  });

  it('should handle network errors gracefully', () => {
    cy.intercept('POST', '/api/users', {
      forceNetworkError: true,
    }).as('register');

    cy.get('input[name="username"]').type(newUser.username);
    cy.get('input[name="email"]').type(newUser.email);
    cy.get('input[name="password"]').type(newUser.password);
    cy.get('input[name="confirmPassword"]').type(newUser.password);
    cy.get('button[type="submit"]').click();

    cy.wait('@register');
    // Should show error message
    cy.contains(/error|fail/i).should('be.visible');
  });
});
