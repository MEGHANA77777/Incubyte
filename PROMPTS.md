# PROMPTS.md

Raw AI conversation logs with Amazon Q Developer (CLI).

---

## Session 1 — Architecture & Planning

**Prompt**: [Full architecture planning prompt submitted to Amazon Q Developer CLI]

**Response**: [Full architecture response — technology stack table, system architecture diagram, folder structures, database design, API table, auth flow, purchase flow, TDD strategy, Git strategy, risks]

---

## Session 2 — Project Scaffold

**Prompt**: Create folders and files as defined in the architecture plan and commit the changes.

**Response**: [Amazon Q Developer created all directories and placeholder files for backend and frontend, created configuration files (pyproject.toml, requirements.txt, .env.example, Dockerfiles, docker-compose.yml), and committed with `chore: initialize project structure and tooling`]

---

---

## Session 3 — Authentication & Security Foundation (Implementation)
Implement the complete authentication and security foundation.

* Implement user model and validation schemas.
* Implement password hashing and secure password verification.
* Implement JWT-based authentication and token handling.
* Implement authentication dependencies/middleware for protected routes.
* Implement register, login, logout/token-related APIs as defined by the architecture.
* Add proper authentication error handling and validation.
* Add unit and integration tests for security and authentication flows.
* Follow the existing project structure, configuration, typing, linting, and security practices.
* Do not implement RAG, vehicle/business logic, dashboards, or unrelated features.

After implementation, run tests, linting, type checks, and verify the API starts successfully. Fix all issues before completing Stage 2.

**Response**: [Amazon Q Developer implemented user model, password hashing with Argon2, JWT token handling, auth middleware, register/login/logout APIs, error handling, and unit/integration tests. Ran tests, linting, and type checks, fixed all issues, and verified the API starts successfully.]

---

## Session 4 — Commit Authentication & Security Foundation

**Prompt**: Review the current Git changes for this stage. Stage only the modified/untracked files related to the authentication and security foundation. Verify that no secrets such as `backend/.env` are staged. Create a professional Conventional Commit with an appropriate message (preferably `feat: add authentication and security foundation`), then push the commit to `origin/main`. Finally, run `git status` and confirm the working tree is clean. Do not modify unrelated files.

**Response**: [Amazon Q Developer reviewed git changes, staged only authentication-related files, verified `backend/.env` was not staged, committed with `feat: add authentication and security foundation`, pushed to `origin/main`, and confirmed a clean working tree]

---

---

## Session 5 — Authentication (TDD)

**Prompt**:
# STAGE 3 — AUTHENTICATION

Implement user registration and login using **TDD**.

**Endpoints**

* `POST /api/auth/register` → `201 Created`
* `POST /api/auth/login` → `access_token`, `token_type`, safe user info

**Architecture**
`Route → Auth Service → User Repository → MongoDB`

**Files**

* `app/api/routes/auth.py`
* `app/services/auth_service.py`
* `app/repositories/user_repository.py`
* `app/schemas/auth.py`
* `app/schemas/user.py`
* `tests/unit/test_auth_service.py`
* `tests/integration/test_auth_api.py`

### Registration — Tests First

Cover:

* successful registration
* missing name
* invalid email/password
* duplicate email
* password hashing
* password hash never returned
* default `USER` role
* client cannot register as `ADMIN`

### Login — Tests First

Cover:

* valid credentials
* invalid/non-existent credentials
* JWT generation
* JWT contains user ID and role
* JWT expiration
* password never returned

### Rules

* No database queries or business logic in routes.
* Use dependency injection.
* Never expose `password_hash`.
* Use meaningful HTTP status codes.
* Follow existing project architecture.
* Run `pytest -v` after implementation.
* **Do not fabricate test results.**
* Make Git commits showing the TDD progression: tests → implementation → fixes/refinement.

**Response**: [Amazon Q Developer implemented authentication using TDD — wrote failing tests first for registration and login, then implemented the route, service, repository, and schema layers. Covered all specified cases including password hashing, JWT generation/expiration, role defaults, and security constraints. Ran `pytest -v`, fixed all issues, and committed in TDD progression order.]

---

> Raw conversation transcripts are preserved here as required by the assignment.
> AI-generated suggestions were reviewed before each commit.
