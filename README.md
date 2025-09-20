# Sweet Shop Management System

[![CI](https://github.com/Ishwari-22/Sweet-Shop-Management-System/actions/workflows/ci.yml/badge.svg)](https://github.com/Ishwari-22/Sweet-Shop-Management-System/actions/workflows/ci.yml)

A full-stack TDD kata implementing a Sweet Shop Management System with TypeScript/Express, Prisma (SQLite for dev), JWT auth, and a React + Vite frontend.

## Tech Stack
- Backend: Node.js, TypeScript, Express 5, Prisma ORM, JWT (jsonwebtoken), bcryptjs
- Database: SQLite for local dev/testing (swap to PostgreSQL by changing `DATABASE_URL` and `provider` in `prisma/schema.prisma`)
- Frontend: React 18 + Vite + React Router
- Testing: Jest + ts-jest + Supertest

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Install Dependencies
```bash
npm ci
cd frontend && npm ci && cd ..
```

### Environment
Create `.env` in project root (you can start with these defaults for local dev):
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="dev_secret"
PORT=4000
```

### Database & Prisma
- Generate Prisma client:
```bash
npx prisma generate
```
- Create/migrate the database:
```bash
npx prisma migrate dev --name init --skip-seed
```
- Seed sample data (admin user and sweets):
```bash
npm run seed
```
Admin credentials from seed:
- email: `admin@sweetshop.local`
- password: `Admin123!`

### Run Backend
```bash
npm run dev
```
API will start on `http://localhost:4000`.

### Run Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173` and proxies API requests to backend.

## API Endpoints
- Auth
  - POST `/api/auth/register`
  - POST `/api/auth/login`
- Sweets (protected)
  - POST `/api/sweets` (admin)
  - GET `/api/sweets`
  - GET `/api/sweets/search?q=&category=&minPrice=&maxPrice=`
  - PUT `/api/sweets/:id` (admin)
  - DELETE `/api/sweets/:id` (admin)
  - POST `/api/sweets/:id/purchase`
  - POST `/api/sweets/:id/restock` (admin)

## Testing (TDD)
Run full test suite:
```bash
$env:JWT_SECRET='test_secret'; $env:DATABASE_URL='file:./dev.db'; npx jest --runInBand --verbose
```
Or via npm script:
```bash
npm test
```

## CI
This repository runs CI on every push/PR using GitHub Actions to install dependencies, run Prisma migrations (SQLite), execute Jest tests, and build the frontend.

## Deployment

### Backend on Render
- Repo contains `render.yaml` and `Dockerfile` (optional). Steps:
  1. Create a new Web Service from this repo
  2. Environment variables:
     - `JWT_SECRET` (set to a strong secret)
     - `DATABASE_URL` (e.g., `postgresql://...` for production)
  3. Render runs: `npm ci && npx prisma generate && npm run build` then `node dist/server.js`
  4. Add a Render cron or deploy hook to run `npx prisma migrate deploy` on deploy if switching to managed DB

### Frontend on Vercel
- `frontend/vercel.json` provided. Steps:
  1. Import the repo into Vercel, root directory: `frontend`
  2. Build command: `npm run build`, Output dir: `dist`
  3. Environment variable: `VITE_API_URL` set to your backend URL (Render service URL)
  4. Redeploy and verify app

## My AI Usage
- Tools used: ChatGPT (as a coding assistant in Cursor)
- How I used AI:
  - Bootstrapped TypeScript/Express scaffolding, Jest setup, and Prisma schema examples
  - Auth route scaffolding and middleware structure, refined manually for validation and error handling
  - Auth and sweets endpoint test cases (Supertest) following TDD flow
  - Frontend React scaffolding (Vite, routing) and simple UI components for auth and sweets dashboard
  - Debugging environment setup issues (PowerShell command forms, Prisma migration and test setup adjustments)
- Reflection:
  - AI helped accelerate boilerplate and provided quick references for common patterns (JWT, Prisma, Supertest)
  - I reviewed and adapted generated code to ensure correctness, security (e.g., role checks), and consistency
  - TDD cadence was maintained by writing/adjusting tests first where feasible, then implementing to green

## Git Co-authorship Policy
When AI assistance was used, commits include an AI co-author trailer as required:
```
Co-authored-by: AI Assistant <AI@users.noreply.github.com>
```

## Screenshots
Add screenshots of the running app here (backend health, login/register, sweets dashboard, admin actions).
