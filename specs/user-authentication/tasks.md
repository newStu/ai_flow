---
description: "Task list for User Authentication System implementation"
---

# Tasks: 用户认证系统

**Input**: Design documents from `.specify/templates/`
**Prerequisites**: UserLogin.plan.md (required), UserAuth.spec.md (required for user stories)

**Tests**: Tests are included as per the specification requirements (80%+ coverage target)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- Backend uses NestJS modular structure
- Frontend uses React component structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project structure: `backend/` and `frontend/` directories at repository root
- [X] T002 Initialize NestJS backend: `nest new backend --package-manager pnpm`
- [X] T003 Initialize React frontend: `pnpm create vite frontend --template react-ts`
- [X] T004 [P] Configure ESLint + Prettier for backend: `backend/.eslintrc.js`, `backend/.prettierrc`
- [X] T005 [P] Configure ESLint + Prettier for frontend: `frontend/.eslintrc.js`, `frontend/.prettierrc`
- [X] T006 [P] Setup Git repository: `.gitignore`, branch strategy (main/develop/feature/*)
- [X] T007 [P] Configure Husky pre-commit hooks: `husky install`, lint-staged configuration
- [X] T008 Create Docker Compose for development: `docker-compose.yml` (MySQL 8.0 + Redis 7.0)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database & ORM Setup

- [X] T009 Setup Prisma ORM: `backend/prisma/schema.prisma` with initial configuration
- [X] T010 Define User entity: `model User` in `backend/prisma/schema.prisma`
- [X] T011 Define UserSession entity: `model UserSession` with foreign key to User
- [X] T012 Define VerificationCode entity: `model VerificationCode` with type enum
- [X] T013 Define OAuthAccount entity: `model OAuthAccount` with provider enum
- [ ] T014 Create database migration: `npx prisma migrate dev --name init`
- [X] T015 Create PrismaService: `backend/src/prisma/prisma.service.ts`
- [X] T016 Setup Redis client: Install `ioredis`, create `backend/src/redis/redis.service.ts`

### Backend Core Infrastructure

- [X] T017 Configure environment variables: `backend/.env.example` with all required vars
- [X] T018 Setup global exception filter: `backend/src/common/filters/http-exception.filter.ts`
- [X] T019 Setup validation pipe: `backend/src/common/pipes/validation.pipe.ts`
- [X] T020 Setup logging interceptor: `backend/src/common/interceptors/logging.interceptor.ts`
- [X] T021 Setup transform interceptor: `backend/src/common/interceptors/transform.interceptor.ts`
- [X] T022 Configure Swagger: `backend/src/main.ts` with OpenAPI documentation
- [X] T023 Setup CORS and security headers: Install `helmet`, `@nestjs/throttler`

### Frontend Core Infrastructure

- [X] T024 Install dependencies: Tailwind CSS, Ant Design, Formik, alova.js, Zustand
- [X] T025 Configure Tailwind CSS: `frontend/tailwind.config.js`, `frontend/src/index.css`
- [X] T026 Setup React Router: `frontend/src/App.tsx` with route configuration
- [X] T027 Create API service base: `frontend/src/services/api.ts` with axios/alova interceptors
- [X] T028 Create auth store: `frontend/src/store/authStore.ts` with Zustand
- [X] T029 Create AuthLayout component: `frontend/src/components/layout/AuthLayout.tsx`
- [X] T030 Create utility functions: `frontend/src/utils/token.ts`, `validation.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 用户名密码快速登录 (Priority: P1) 🎯 MVP

**Goal**: 实现基础的用户名密码登录功能,包含登录失败锁定机制

**Independent Test**: 用户输入正确的用户名和密码后,能在500ms内完成验证并跳转到主页

### Tests for User Story 1 (Write tests FIRST, ensure they FAIL)

- [X] T031 [P] [US1] Unit test for AuthService.login: `backend/src/auth/auth.service.spec.ts`
- [X] T032 [P] [US1] Unit test for password verification with bcrypt
- [X] T033 [P] [US1] Integration test for login endpoint: `backend/test/auth.e2e-spec.ts`
- [X] T034 [P] [US1] Test login failure lockout mechanism (5 attempts)
- [X] T035 [P] [US1] E2E test for login flow: `frontend/cypress/e2e/login.cy.ts`

### Backend Implementation for User Story 1

- [X] T036 [US1] Create Auth module: `nest g module auth` → `backend/src/auth/auth.module.ts`
- [X] T037 [US1] Create Auth controller: `backend/src/auth/auth.controller.ts`
- [X] T038 [US1] Create Auth service: `backend/src/auth/auth.service.ts`
- [X] T039 [US1] Create LoginDto: `backend/src/auth/dto/login.dto.ts` with validation decorators
- [X] T040 [US1] Implement password verification: bcrypt compare in AuthService
- [X] T041 [US1] Implement JWT token generation: access token (15min) + refresh token (7d)
- [ ] T042 [US1] Implement login failure counting: Redis key `fail_count:{ip}` with 15min TTL
- [ ] T043 [US1] Implement account lockout: After 5 failures, return 423 Locked
- [ ] T044 [US1] Create session record: Insert into UserSession table with IP and User-Agent
- [X] T045 [US1] Create JWT strategy: `backend/src/auth/strategies/jwt.strategy.ts`
- [X] T046 [US1] Create JWT auth guard: `backend/src/auth/guards/jwt-auth.guard.ts`
- [X] T047 [US1] Create @CurrentUser decorator: `backend/src/auth/decorators/current-user.decorator.ts`
- [X] T048 [US1] Create @Public decorator: `backend/src/auth/decorators/public.decorator.ts`

### Frontend Implementation for User Story 1

- [X] T049 [P] [US1] Create Input component: `frontend/src/components/forms/Input.tsx`
- [X] T050 [P] [US1] Create PasswordInput component: `frontend/src/components/forms/PasswordInput.tsx`
- [X] T051 [P] [US1] Create Button component: `frontend/src/components/ui/Button.tsx`
- [X] T052 [US1] Create Login page: `frontend/src/pages/auth/Login.tsx`
- [X] T053 [US1] Implement login form with Formik: username/password fields + validation
- [X] T054 [US1] Add "remember me" checkbox: Store refresh token in localStorage
- [X] T055 [US1] Create auth service: `frontend/src/services/auth.service.ts` with login method
- [X] T056 [US1] Implement token storage: Save access/refresh tokens in authStore
- [X] T057 [US1] Implement auto token refresh: Interceptor to refresh before expiry
- [X] T058 [US1] Add loading states: Show spinner during login API call
- [X] T059 [US1] Add error handling: Display lockout message for 423 status

**Checkpoint**: User Story 1 fully functional - users can login with username/password

---

## Phase 4: User Story 2 - 新用户注册与账户激活 (Priority: P1) 🎯 MVP

**Goal**: 实现完整的用户注册流程,包含邮箱验证和密码强度检查

**Independent Test**: 新用户填写信息,完成邮箱验证后,账户创建成功并自动登录

### Tests for User Story 2

- [X] T060 [P] [US2] Unit test for UsersService.create: `backend/src/users/users.service.spec.ts`
- [X] T061 [P] [US2] Test username uniqueness validation
- [X] T062 [P] [US2] Test email uniqueness validation
- [X] T063 [P] [US2] Test password strength validation (8-50 chars, complexity)
- [X] T064 [P] [US2] Integration test for registration: `backend/test/users.e2e-spec.ts`
- [X] T065 [P] [US2] E2E test for registration flow: `frontend/cypress/e2e/register.cy.ts`

### Backend Implementation for User Story 2

- [X] T066 [US2] Create Users module: `nest g module users` → `backend/src/users/users.module.ts`
- [X] T067 [US2] Create Users controller: `backend/src/users/users.controller.ts`
- [X] T068 [US2] Create Users service: `backend/src/users/users.service.ts`
- [X] T069 [US2] Create CreateUserDto: `backend/src/users/dto/create-user.dto.ts`
- [X] T070 [US2] Implement username uniqueness check: GET `/users/check-username/:username`
- [X] T071 [US2] Implement email uniqueness check: GET `/users/check-email/:email`
- [X] T072 [US2] Implement user creation: Hash password with bcrypt (salt=12), insert User
- [X] T073 [US2] Create Email module: `backend/src/email/email.module.ts`
- [X] T074 [US2] Create Email service: `backend/src/email/email.service.ts` with Nodemailer
- [X] T075 [US2] Generate email verification code: 6-digit random number, 5min TTL
- [X] T076 [US2] Store verification code: VerificationCode table + Redis cache
- [X] T077 [US2] Send verification email: HTML template with code
- [X] T078 [US2] Implement code verification: POST `/auth/verify-email` endpoint
- [X] T079 [US2] Activate user account: Set email_verified=true, status='active'

### Frontend Implementation for User Story 2

- [ ] T080 [P] [US2] Create PasswordStrengthIndicator: `frontend/src/components/forms/PasswordStrengthIndicator.tsx`
- [ ] T081 [P] [US2] Create CaptchaInput component: `frontend/src/components/forms/CaptchaInput.tsx`
- [ ] T082 [US2] Create Register page: `frontend/src/pages/auth/Register.tsx`
- [ ] T083 [US2] Implement registration form: username, password, confirm, email fields
- [ ] T084 [US2] Add real-time username validation: Debounced API call (300ms)
- [ ] T085 [US2] Add real-time email validation: Format + uniqueness check
- [ ] T086 [US2] Add password strength indicator: Weak/Medium/Strong based on rules
- [ ] T087 [US2] Add email verification step: Show code input after registration
- [ ] T088 [US2] Implement verification code input: 6-digit input with countdown timer
- [ ] T089 [US2] Handle successful registration: Auto-login and redirect to dashboard

**Checkpoint**: User Story 2 fully functional - new users can register and activate accounts

---

## Phase 5: User Story 3 - 忘记密码重置 (Priority: P2)

**Goal**: 实现安全的密码重置流程,通过邮箱验证码验证身份

**Independent Test**: 用户输入用户名和邮箱,通过验证码验证后,能够设置新密码并登录

### Tests for User Story 3

- [ ] T090 [P] [US3] Unit test for password reset flow
- [ ] T091 [P] [US3] Test password history validation (last 5 passwords)
- [ ] T092 [P] [US3] Integration test for forgot-password endpoint
- [ ] T093 [P] [US3] E2E test for password reset: `frontend/cypress/e2e/forgot-password.cy.ts`

### Backend Implementation for User Story 3

- [ ] T094 [US3] Create PasswordHistory model: Add to Prisma schema
- [ ] T095 [US3] Create ForgotPasswordDto: `backend/src/auth/dto/forgot-password.dto.ts`
- [ ] T096 [US3] Create ResetPasswordDto: `backend/src/auth/dto/reset-password.dto.ts`
- [ ] T097 [US3] Implement forgot-password endpoint: POST `/auth/forgot-password`
- [ ] T098 [US3] Verify user identity: Match username + email
- [ ] T099 [US3] Generate reset verification code: 6-digit, 5min TTL
- [ ] T100 [US3] Send reset email: Email with verification code
- [ ] T101 [US3] Implement reset-password endpoint: POST `/auth/reset-password`
- [ ] T102 [US3] Verify reset code: Check VerificationCode table
- [ ] T103 [US3] Validate new password: Not in last 5 passwords (compare hashes)
- [ ] T104 [US3] Update password: Hash new password, update User table
- [ ] T105 [US3] Invalidate old sessions: Delete all UserSession records for user

### Frontend Implementation for User Story 3

- [ ] T106 [P] [US3] Create ForgotPassword page: `frontend/src/pages/auth/ForgotPassword.tsx`
- [ ] T107 [P] [US3] Create ResetPassword page: `frontend/src/pages/auth/ResetPassword.tsx`
- [ ] T108 [US3] Implement forgot-password form: username + email + captcha
- [ ] T109 [US3] Add verification code step: Show code input after email sent
- [ ] T110 [US3] Implement reset-password form: verification code + new password + confirm
- [ ] T111 [US3] Add password strength validation: Same rules as registration
- [ ] T112 [US3] Handle success: Show success message, redirect to login

**Checkpoint**: User Story 3 fully functional - users can reset forgotten passwords

---

## Phase 6: User Story 4 - 邮箱验证码快捷登录 (Priority: P2)

**Goal**: 提供邮箱验证码登录方式,无需记住密码

**Independent Test**: 用户输入邮箱,收到验证码后在5分钟内输入即可登录

### Tests for User Story 4

- [ ] T113 [P] [US4] Unit test for email login flow
- [ ] T114 [P] [US4] Test verification code rate limiting (1/min)
- [ ] T115 [P] [US4] Integration test for email login endpoint
- [ ] T116 [P] [US4] E2E test for email login: `frontend/cypress/e2e/email-login.cy.ts`

### Backend Implementation for User Story 4

- [ ] T117 [US4] Create Captcha module: `backend/src/captcha/captcha.module.ts`
- [ ] T118 [US4] Create Captcha service: Install `svg-captcha`, generate SVG captchas
- [ ] T119 [US4] Implement captcha generation: GET `/captcha/generate`
- [ ] T120 [US4] Cache captcha in Redis: Key `captcha:{id}`, 5min TTL
- [ ] T121 [US4] Create EmailLoginDto: `backend/src/auth/dto/email-login.dto.ts`
- [ ] T122 [US4] Implement send-code endpoint: POST `/auth/send-login-code`
- [ ] T123 [US4] Validate captcha: Verify captcha before sending code
- [ ] T124 [US4] Check rate limiting: Redis key `email_code:{email}`, 1min TTL
- [ ] T125 [US4] Generate and send login code: 6-digit code via email
- [ ] T126 [US4] Implement email-login endpoint: POST `/auth/email-login`
- [ ] T127 [US4] Verify code and create session: Same as password login

### Frontend Implementation for User Story 4

- [ ] T128 [US4] Add email login mode toggle: Switch between password/email mode on Login page
- [ ] T129 [US4] Create email login form: email + captcha + verification code fields
- [ ] T130 [US4] Add captcha component: Display SVG, refresh button
- [ ] T131 [US4] Implement send code button: With countdown timer (60s)
- [ ] T132 [US4] Handle code verification: Call email-login API
- [ ] T133 [US4] Add error handling: Show rate limit message, expired code message

**Checkpoint**: User Story 4 fully functional - email code login works

---

## Phase 7: User Story 5 - 第三方账户登录 (Priority: P3)

**Goal**: 支持Google、GitHub、微信三种第三方OAuth登录

**Independent Test**: 用户点击第三方登录按钮,完成授权后自动登录系统

### Tests for User Story 5

- [ ] T134 [P] [US5] Mock test for Google OAuth flow
- [ ] T135 [P] [US5] Mock test for GitHub OAuth flow
- [ ] T136 [P] [US5] Mock test for WeChat OAuth flow
- [ ] T137 [P] [US5] Test account binding logic

### Backend Implementation for User Story 5

- [ ] T138 [P] [US5] Create OAuth module: `backend/src/oauth/oauth.module.ts`
- [ ] T139 [P] [US5] Create OAuth controller: `backend/src/oauth/oauth.controller.ts`
- [ ] T140 [P] [US5] Create OAuth service: `backend/src/oauth/oauth.service.ts`
- [ ] T141 [US5] Install Passport OAuth strategies: `@nestjs/passport`, `passport-google-oauth20`, etc.
- [ ] T142 [US5] Configure Google OAuth: Strategy in `backend/src/oauth/strategies/google.strategy.ts`
- [ ] T143 [US5] Implement Google login: GET `/oauth/google/login` redirect to Google
- [ ] T144 [US5] Implement Google callback: GET `/oauth/google/callback` handle auth code
- [ ] T145 [US5] Configure GitHub OAuth: Strategy in `backend/src/oauth/strategies/github.strategy.ts`
- [ ] T146 [US5] Implement GitHub login: GET `/oauth/github/login` and callback
- [ ] T147 [US5] Configure WeChat OAuth: Strategy in `backend/src/oauth/strategies/wechat.strategy.ts`
- [ ] T148 [US5] Implement WeChat login: QR code generation and polling
- [ ] T149 [US5] Implement account binding logic: Check email match, link or create OAuthAccount
- [ ] T150 [US5] Handle new vs existing users: Create User if new, link if existing

### Frontend Implementation for User Story 5

- [ ] T151 [P] [US5] Add Google login button: `frontend/src/components/auth/GoogleLoginButton.tsx`
- [ ] T152 [P] [US5] Add GitHub login button: `frontend/src/components/auth/GitHubLoginButton.tsx`
- [ ] T153 [P] [US5] Add WeChat login button: `frontend/src/components/auth/WeChatLoginButton.tsx`
- [ ] T154 [US5] Implement OAuth redirect handling: Parse callback params, extract tokens
- [ ] T155 [US5] Add OAuth buttons to Login page: Display provider buttons
- [ ] T156 [US5] Handle OAuth errors: Show user-friendly error messages
- [ ] T157 [US5] Implement WeChat QR modal: Display QR code, poll for scan result

**Checkpoint**: User Story 5 fully functional - OAuth login works for all providers

---

## Phase 8: User Story 6 - 修改密码 (Priority: P3)

**Goal**: 已登录用户可以主动修改密码

**Independent Test**: 登录用户输入当前密码和新密码后,密码更新成功

### Tests for User Story 6

- [ ] T158 [P] [US6] Unit test for change password flow
- [ ] T159 [P] [US6] Test current password verification
- [ ] T160 [P] [US6] Integration test for change-password endpoint

### Backend Implementation for User Story 6

- [ ] T161 [US6] Create ChangePasswordDto: `backend/src/users/dto/change-password.dto.ts`
- [ ] T162 [US6] Implement change-password endpoint: PUT `/users/change-password`
- [ ] T163 [US6] Verify current password: Compare with stored hash
- [ ] T164 [US6] Validate new password: Strength + not in history
- [ ] T165 [US6] Update password: Hash and save new password
- [ ] T166 [US6] Add to password history: Save old hash to PasswordHistory
- [ ] T167 [US6] Send notification email: Inform user of password change

### Frontend Implementation for User Story 6

- [ ] T168 [US6] Create ChangePassword page: `frontend/src/pages/auth/ChangePassword.tsx`
- [ ] T169 [US6] Implement change password form: current + new + confirm fields
- [ ] T170 [US6] Add password strength indicator: For new password
- [ ] T171 [US6] Handle success: Show success message, optionally logout

**Checkpoint**: User Story 6 fully functional - password change works

---

## Phase 9: Security Hardening & Cross-Cutting Concerns

**Purpose**: Security improvements and features affecting multiple user stories

- [ ] T172 [P] Implement CSRF protection: Install `csurf`, add to backend middleware
- [ ] T173 [P] Configure security headers: `helmet` with proper CSP, HSTS, etc.
- [ ] T174 [P] Implement rate limiting: `@nestjs/throttler` on all endpoints
- [ ] T175 [P] Add IP-based login limiting: Redis key `login_attempts:{ip}`, 50/hour
- [ ] T176 [P] Implement XSS protection: Input sanitization, output encoding
- [ ] T177 [P] Add SQL injection protection: Verify Prisma parameterized queries
- [ ] T178 Implement session management: Multi-session tracking, logout all devices
- [ ] T179 Implement anomaly detection: Alert on IP/device change
- [ ] T180 Add security logging: Log all auth events (login, logout, failed attempts)
- [ ] T181 Setup log aggregation: Winston logger with daily rotate files
- [ ] T182 [P] Run security audit: `npm audit`, OWASP ZAP scan
- [ ] T183 [P] Add sensitive data masking: Ensure passwords never logged

**Checkpoint**: Security hardening complete

---

## Phase 10: Performance Optimization

**Purpose**: Optimize performance to meet < 500ms login requirement

- [ ] T184 [P] Database query optimization: Add indexes on users(username, email)
- [ ] T185 [P] Add index on user_sessions(user_id, token_hash)
- [ ] T186 [P] Add index on verification_codes(email, type, used)
- [ ] T187 Optimize Redis caching: Cache user profiles, session tokens
- [ ] T188 Implement cache invalidation: Clear cache on password change
- [ ] T189 Setup Redis connection pooling: Configure max connections
- [ ] T190 Optimize bcrypt rounds: Benchmark to ensure < 200ms hash time
- [ ] T191 Add database connection pooling: Configure Prisma pool size
- [ ] T192 Frontend code splitting: React.lazy for auth pages
- [ ] T193 Optimize bundle size: Tree shaking, minification
- [ ] T194 Add CDN for static assets: Consider deployment strategy
- [ ] T195 Run performance testing: Artillery load test (1000 concurrent users)

**Checkpoint**: Performance targets met

---

## Phase 11: Testing & Quality Assurance

**Purpose**: Comprehensive testing coverage (80%+ target)

### Unit Tests

- [ ] T196 [P] Complete backend unit tests: All services at 80%+ coverage
- [ ] T197 [P] Complete frontend unit tests: All components/hooks at 80%+ coverage
- [ ] T198 [P] Test edge cases: Empty inputs, special characters, boundary values

### Integration Tests

- [ ] T199 [P] Test all API endpoints: Supertest for every controller method
- [ ] T200 [P] Test database transactions: Rollback scenarios
- [ ] T201 [P] Test Redis operations: Cache hit/miss scenarios

### E2E Tests

- [ ] T202 Test complete user journeys: All 6 user stories end-to-end
- [ ] T203 Test cross-browser compatibility: Chrome, Firefox, Safari, Edge
- [ ] T204 Test responsive design: Desktop, tablet, mobile viewports
- [ ] T205 Test accessibility: Screen reader, keyboard navigation

### Security Tests

- [ ] T206 Run penetration testing: OWASP Top 10 checks
- [ ] T207 Test authentication bypass: Attempt token manipulation
- [ ] T208 Test injection attacks: SQL, XSS, CSRF attempts
- [ ] T209 Verify rate limiting: Attempt to exceed limits

**Checkpoint**: All tests passing, coverage targets met

---

## Phase 12: Documentation & Deployment

**Purpose**: Production deployment and comprehensive documentation

### Documentation

- [ ] T210 [P] Complete Swagger API docs: Document all endpoints with examples
- [ ] T211 [P] Write deployment guide: `docs/deployment.md` with step-by-step
- [ ] T212 [P] Write developer guide: `docs/quickstart.md` for new developers
- [ ] T213 [P] Write user manual: End-user documentation with screenshots
- [ ] T214 [P] Document architecture: System diagram, data flow, tech stack
- [ ] T215 [P] Create troubleshooting guide: Common issues and solutions

### Production Preparation

- [ ] T216 Create production Dockerfile: Multi-stage build for backend
- [ ] T217 Create production Dockerfile: Multi-stage build for frontend
- [ ] T218 Create docker-compose.prod.yml: Production configuration
- [ ] T219 Configure environment variables: Production secrets, DB credentials
- [ ] T220 Setup SSL certificates: Let's Encrypt or manual certificate
- [ ] T221 Configure Nginx: Reverse proxy, SSL, gzip compression
- [ ] T222 Setup CI/CD pipeline: GitHub Actions workflow
- [ ] T223 Configure monitoring: Prometheus + Grafana or alternative
- [ ] T224 Setup error tracking: Sentry or alternative
- [ ] T225 Configure backup strategy: Database backup script + schedule
- [ ] T226 Create rollback procedure: Document rollback steps

### Deployment

- [ ] T227 Deploy to staging: Test in staging environment
- [ ] T228 Run smoke tests: Verify critical paths in staging
- [ ] T229 Deploy to production: Execute deployment
- [ ] T230 Verify production: Health checks, monitor logs
- [ ] T231 Setup alerts: Configure alerting for critical issues

**Checkpoint**: Production deployment successful

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational completion
  - US1 (P1) and US2 (P1) should be done first (MVP)
  - US3 (P2) and US4 (P2) can proceed in parallel after P1
  - US5 (P3) and US6 (P3) can be done last or deferred
- **Security (Phase 9)**: Can start after core user stories (US1, US2)
- **Performance (Phase 10)**: After core features implemented
- **Testing (Phase 11)**: Ongoing throughout, final sweep at end
- **Deployment (Phase 12)**: After all features and testing complete

### User Story Dependencies

- **US1**: No dependencies on other stories ✅ Independent
- **US2**: No dependencies on other stories ✅ Independent
- **US3**: No dependencies on other stories ✅ Independent
- **US4**: Depends on Captcha (can reuse from US2/US3) ✅ Mostly independent
- **US5**: No dependencies on other stories ✅ Independent
- **US6**: Requires authentication (US1) but can be tested independently

### Parallel Opportunities

- **Setup tasks** T004-T007 can run in parallel (marked [P])
- **Foundational database** T010-T013 can run in parallel (different models)
- **US1 tests** T031-T035 can run in parallel (write all tests first)
- **US1 frontend components** T049-T051 can run in parallel (different files)
- **After Foundational**: US1 and US2 can be worked on by different developers
- **After P1 stories**: US3, US4, US5, US6 can proceed in parallel with adequate team

---

## Implementation Strategy

### MVP First (US1 + US2 Only)

1. Complete Phase 1: Setup (Day 1-2)
2. Complete Phase 2: Foundational (Day 3-7)
3. Complete Phase 3: User Story 1 - Login (Day 8-10)
4. Complete Phase 4: User Story 2 - Registration (Day 11-13)
5. **STOP and VALIDATE**: Test US1 and US2 independently
6. Deploy MVP to staging/production

### Incremental Delivery

1. Foundation → US1 → **Deploy MVP 1** (Login only)
2. Add US2 → **Deploy MVP 2** (Login + Registration)
3. Add US3 + US4 → **Deploy v1.0** (Password management)
4. Add US5 → **Deploy v1.1** (OAuth login)
5. Add US6 → **Deploy v1.2** (Change password)

### Parallel Team Strategy (3-4 developers)

**Week 1 (Setup + Foundational)**: All developers together
**Week 2 (P1 stories)**:
  - Developer A: US1 Backend
  - Developer B: US2 Backend  
  - Developer C: US1 + US2 Frontend
  
**Week 3 (P2 stories)**:
  - Developer A: US3
  - Developer B: US4
  - Developer C: Security hardening
  
**Week 4 (P3 + Polish)**:
  - Developer A: US5 (OAuth)
  - Developer B: Testing
  - Developer C: Deployment prep

---

## Notes

- [P] tasks = different files, no dependencies - can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Write tests FIRST before implementation (TDD approach)
- Commit after each task or logical group
- Stop at checkpoints to validate story independently
- Tasks include exact file paths for clarity
- Backend uses NestJS module structure: module → controller → service → dto
- Frontend uses React component structure: pages → components → services → store

---

*Generated from: UserAuth.spec.md and UserLogin.plan.md*  
*Total Tasks: 231*  
*Estimated Duration: 30 days (6 weeks with parallel work)*  
*Updated: 2025-12-04*
