describe('Login flow (US1: User Story 1 - Username/Password Login)', () => {
  const baseUrl = 'http://localhost:5173'
  const testUser = {
    username: 'testuser',
    password: 'Test@123456',
  }

  beforeEach(() => {
    cy.visit(`${baseUrl}/login`)
  })

  it('should display login form', () => {
    cy.get('h2').should('contain', 'Sign in')
    cy.get('input[name="username"]').should('be.visible')
    cy.get('input[name="password"]').should('be.visible')
    cy.get('button[type="submit"]').should('be.visible')
  })

  it('should show validation error for empty fields', () => {
    cy.get('button[type="submit"]').click()
    // Formik validation should prevent submission
    cy.url().should('include', '/login')
  })

  it('should allow a user to log in with valid credentials', () => {
    cy.intercept('POST', '/api/auth/login').as('loginRequest')

    cy.get('input[name="username"]').type(testUser.username)
    cy.get('input[name="password"]').type(testUser.password)
    cy.get('button[type="submit"]').click()

    cy.wait('@loginRequest').its('response.statusCode').should('eq', 200)
    cy.url().should('include', '/dashboard')
  })

  it('should show error for invalid credentials', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: { message: 'Invalid credentials' },
    }).as('loginRequest')

    cy.get('input[name="username"]').type('wronguser')
    cy.get('input[name="password"]').type('wrongpass')
    cy.get('button[type="submit"]').click()

    cy.wait('@loginRequest')
    cy.contains('Invalid credentials').should('be.visible')
  })

  it('should show account locked message after multiple failed attempts', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 423,
      body: { message: 'Account is locked. Please try again in 15 minutes.' },
    }).as('loginRequest')

    cy.get('input[name="username"]').type(testUser.username)
    cy.get('input[name="password"]').type('wrongpass')
    cy.get('button[type="submit"]').click()

    cy.wait('@loginRequest')
    cy.contains('locked').should('be.visible')
  })

  it('should support "remember me" functionality', () => {
    cy.get('input[type="checkbox"]').check()
    cy.get('input[name="username"]').type(testUser.username)
    cy.get('input[name="password"]').type(testUser.password)
    cy.get('button[type="submit"]').click()

    // Verify refresh token is stored in localStorage
    cy.window().then((win) => {
      const authState = JSON.parse(
        win.localStorage.getItem('auth-storage') || '{}'
      )
      expect(authState.state.refreshToken).to.exist
    })
  })
})
