# Car Dealership Inventory System

A full-stack car dealership inventory system built with FastAPI, MongoDB, and React.

## Tech Stack

- **Backend**: Python 3.12, FastAPI, PyMongo (async), Argon2, JWT
- **Database**: MongoDB
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Zustand
- **Testing**: pytest, pytest-asyncio, httpx, Vitest, React Testing Library

## Getting Started

### With Docker (recommended)

```bash
cp backend/.env.example backend/.env
docker-compose up --build
```

- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Frontend: http://localhost:5173

### Without Docker

**Backend**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

## Running Tests

```bash
# Backend
cd backend && pytest

# Frontend
cd frontend && npm run test
```

## My AI Usage

**Tools used**: Amazon Q Developer (CLI), Codex

**Codex usage**:
- Implemented the responsive React/Tailwind vehicle catalog and typed FastAPI client integration.
- Added role-gated admin inventory controls, reusable dialogs, and a lightweight toast system.
- Ran the production frontend build and reviewed the changed files before commits.

**How they were used**:
- Architecture planning and technology stack recommendations
- Generating project scaffold and folder structure
- Drafting boilerplate for configuration files

**What was manually reviewed**:
- All architectural decisions were evaluated against assignment requirements
- Security choices (Argon2, JWT strategy, atomic MongoDB operations) were verified independently
- Every generated file was reviewed before committing

**How AI affected development**:
- Accelerated initial scaffolding and planning documentation
- Provided a starting point for TDD strategy and Git workflow design

**Mistakes or limitations discovered**:
- AI suggestions were reviewed for over-engineering; several unnecessary abstractions were removed
- Default configurations were adjusted to match project-specific requirements

**How generated suggestions were validated**:
- Cross-referenced with official FastAPI, PyMongo, and Pydantic v2 documentation
- Tested locally before committing

See `PROMPTS.md` for raw AI conversation logs.
