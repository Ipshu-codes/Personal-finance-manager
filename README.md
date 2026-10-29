# Personal Finance Manager

A full-stack personal finance management application that helps users organize transactions, manage budgets, track savings goals, and monitor their finances through a centralized dashboard.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Development Workflow](#development-workflow)
- [Git Branching Strategy](#git-branching-strategy)
- [Troubleshooting](#troubleshooting)
- [Project Status](#project-status)

## Overview

Personal Finance Manager separates the user interface, backend application logic, and database into distinct layers.

- **Frontend:** Provides the dashboard and interface for managing financial information.
- **Backend:** Exposes REST API endpoints and processes application requests.
- **Database:** Stores financial records persistently in PostgreSQL.
- **ORM:** Prisma provides database access and type-aware queries.

## Features

### Dashboard
- Centralized view of financial information.
- Financial summaries and visualizations.

### Transaction Management
- Create, retrieve, update, and delete transactions.
- Organize transactions using categories.
- Distinguish income and expenses.

### Budget Management
- Create and manage budgets.
- Organize budget records by category and period.

### Savings Goals
- Create and manage savings goals.
- Record target amounts, saved amounts, and deadlines.
- Track progress toward savings targets.

### Category Management
- Organize financial activities into categories.
- Manage categories used by financial records.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Routing | React Router |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| API style | REST |
| Version control | Git and GitHub |

## Repository Structure

The repository is organized into the React frontend and the backend API.

```text
Personal-finance-manager/
│
├── frontend-react/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── SummaryCard.tsx
│   │   ├── pages/
│   │   │   └── Dashboard.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── hooks/
│   │   │   └── useApi.ts
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.ts
│
├── backend/
│   ├── migrations/
│   ├── prisma/
│   ├── src/
│   │   ├── prisma/
│   │   │   ├── contract.prisma
│   │   │   ├── contract.json
│   │   │   ├── contract.d.ts
│   │   │   └── db.ts
│   │   └── server.ts
│   ├── .env
│   ├── .env.example
│   ├── prisma.config.ts
│   ├── seed.js
│   ├── package.json
│   ├── package-lock.json
│   └── tsconfig.json
│
├── .gitignore
└── README.md
```

**Structure notes:**
- `frontend-react/src/components/` contains reusable interface components.
- `frontend-react/src/pages/` contains page-level UI, including the dashboard.
- `frontend-react/src/services/api.ts` centralizes API communication.
- `frontend-react/src/hooks/useApi.ts` contains reusable API-related hook logic.
- `backend/src/server.ts` is the backend server entry point.
- `backend/src/prisma/db.ts` contains the Prisma database setup.
- `backend/src/prisma/contract.prisma` contains the project's Prisma contract definition.
- `backend/src/prisma/contract.json` and `contract.d.ts` are associated generated contract artifacts.
- `backend/migrations/` contains database migration-related files.
- `backend/prisma.config.ts` contains Prisma configuration.
- `backend/seed.js` is used for seeding initial data.

The tree above represents the known project organization. Some files and subfolders may differ in your current checkout; use the actual repository contents as the source of truth.

## Prerequisites

Install the following before starting development:

1. **Git** — to clone the repository and manage branches.
2. **Node.js and npm** — to install dependencies and run the frontend and backend.
3. **PostgreSQL** — to store application data.
4. **Visual Studio Code** or another code editor.

Verify Node.js and npm:

```powershell
node --version
npm --version
git --version
```

Make sure PostgreSQL is running before starting the backend.

## Getting Started

### 1. Clone the repository

Open a terminal and run:

```powershell
git clone <repository-url>
cd Personal-finance-manager
```

Replace `<repository-url>` with the actual HTTPS or SSH URL of this GitHub repository.

### 2. Check out the development branch

The project uses `develop` as the integration branch.

```powershell
git fetch origin
git switch develop
git pull origin develop
```

Check your current branch:

```powershell
git branch --show-current
```

The output should be:

```text
develop
```

### 3. Install frontend dependencies

Open a terminal in the repository root and run:

```powershell
cd frontend-react
npm install
```

This installs the dependencies defined in the frontend `package.json`.

### 4. Install backend dependencies

Open a second terminal in the repository root and run:

```powershell
cd backend
npm install
```

This installs the backend dependencies, including Express, Prisma-related packages, TypeScript, and the development runner.

Run commands from the appropriate project directory so that the correct `package.json` is used.

## Environment Configuration

The backend uses environment variables to configure the database connection and other settings.

### 1. Create the environment file

From the `backend` directory, copy the example environment file:

```powershell
Copy-Item .env.example .env
```

If `.env` already exists, preserve your current local configuration instead of overwriting it.

### 2. Configure the database connection

Set the database connection variable expected by the existing Prisma configuration. For example, if your project uses `DATABASE_URL`:

```env
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/personal_finance?schema=public"
```

Replace the placeholders with your local PostgreSQL credentials.

The example assumes a PostgreSQL database named `personal_finance` on port `5432`. Confirm that the variable name matches `prisma.config.ts` and your existing `.env.example`.

**Security:** Never commit `.env`, database passwords, API secrets, or other credentials to GitHub. Keep `.env.example` free of real secrets.

## Database Setup

### 1. Create the PostgreSQL database

Using `psql` or a PostgreSQL administration tool, create the database:

```sql
CREATE DATABASE personal_finance;
```

If the database already exists, do not create it again.

### 2. Generate or update Prisma contract artifacts

From the `backend` directory, run the project's configured contract-generation command:

```powershell
npx prisma contract emit
```

This is the contract workflow used by this project's Prisma setup. Do not replace it with the conventional `prisma/schema.prisma` workflow unless the repository configuration has changed.

### 3. Update the database schema

Run the database update command used by the existing project configuration:

```powershell
npx prisma db update
```

Review the output carefully. Confirm that the configured database is the intended local development database before running schema-changing commands.

### 4. Seed initial categories (if required)

The repository includes a `seed.js` script. If the database has not yet been seeded and the script is still configured for your current schema, run:

```powershell
npx tsx seed.js
```

Run this command from the `backend` directory.

Check the script before rerunning it to confirm whether it safely handles existing records. Do not assume repeated seeding is idempotent.

## Running the Application

Run the frontend and backend in separate terminals.

### Terminal 1: Start the backend

```powershell
cd backend
npm run dev
```

The development script starts the TypeScript server using `tsx watch src/server.ts`.

The backend is expected to listen on port `5000` in the current development configuration.

Useful local URLs:

- Backend root: `http://localhost:5000/`
- Database test endpoint: `http://localhost:5000/api/test-db`

### Terminal 2: Start the frontend

```powershell
cd frontend-react
npm run dev
```

Vite prints the local development URL in the terminal, usually:

```text
http://localhost:5173/
```

Open the URL printed by Vite in your browser.

### Frontend-to-backend communication

The frontend API service uses `/api` as its API base path. The Vite development server should proxy API requests to the backend at `http://localhost:5000`.

Check `frontend-react/vite.config.ts` if API requests fail. Confirm that the proxy configuration matches the backend port and that both development servers are running.

## API Endpoints

The backend exposes REST API endpoints. The following table lists the known route examples and resource groups; verify the current route definitions in `backend/src/server.ts` before relying on the complete route list.

| Resource | Purpose |
|---|---|
| `/` | Backend root endpoint |
| `/api/test-db` | Test database connectivity |
| `/api/transactions` | Transaction resource |
| `/api/budgets` | Budget resource |
| `/api/savings-goals` | Savings-goal resource |
| `/api/categories` | Category resource |

CRUD operations generally include:

- `GET` — Retrieve records.
- `GET /:id` — Retrieve a specific record, if implemented.
- `POST` — Create a record.
- `PUT` or `PATCH` — Update a record, depending on the route implementation.
- `DELETE` — Delete a record.

The exact HTTP methods, request bodies, response formats, and route names depend on the implemented API handlers.

You can test endpoints using a browser for simple `GET` requests or an API client such as Postman.

## Development Workflow

### Working on a feature

1. Update your local `develop` branch.
2. Create a dedicated feature branch.
3. Implement the change.
4. Test the affected frontend and backend functionality.
5. Commit and push your changes.
6. Open a pull request targeting `develop`.
7. Review and merge the pull request after checks pass.

Example:

```powershell
git switch develop
git pull origin develop
git switch -c feature/transaction-filters
```

After making and testing your changes:

```powershell
git add .
git commit -m "feat: add transaction filters"
git push -u origin feature/transaction-filters
```

Open a pull request on GitHub from `feature/transaction-filters` into `develop`.

Use a descriptive branch name and commit message. Do not commit local environment files or generated dependency directories such as `node_modules`.

## Git Branching Strategy

The project maintains separate branches for integration and stable releases.

```text
feature/your-feature
        |
        | Pull Request
        v
     develop
        |
        | Pull Request after integration testing
        v
       main
```

### `main`
Contains the stable version of the application. Changes should arrive through reviewed pull requests from `develop` or an explicitly approved maintenance workflow.

### `develop`
The permanent integration branch. Features are merged here and tested together before being promoted to `main`.

### Feature branches
Temporary branches for individual features, fixes, or improvements. Create them from `develop` and open pull requests back into `develop`.

### Release workflow

1. Merge completed feature branches into `develop`.
2. Test the integrated application, including database connectivity and frontend API requests.
3. Resolve integration issues.
4. Open a pull request from `develop` into `main`.
5. Merge when the release is stable.
6. Keep `main` and `develop`; delete completed feature branches only after confirming their changes are merged and verified.

## Troubleshooting

### The backend cannot connect to PostgreSQL

- Confirm PostgreSQL is running.
- Verify the database exists.
- Check the credentials and connection string in `backend/.env`.
- Confirm that the environment variable matches `prisma.config.ts`.
- Test the database connection using the project's `/api/test-db` endpoint.

### The frontend cannot retrieve API data

- Confirm the backend is running on port `5000`.
- Check the API base path in `frontend-react/src/services/api.ts`.
- Verify the Vite proxy configuration in `frontend-react/vite.config.ts`.
- Inspect browser developer tools for network errors and backend logs for request errors.

### A package or command is missing

- Confirm you are in the correct directory.
- Run `npm install` in the relevant frontend or backend directory.
- Check that the command exists in that directory's `package.json`.

### Prisma commands fail

- Confirm the database connection is configured correctly.
- Check the project's Prisma configuration and contract files.
- Use the repository's configured contract-generation and database-update workflow.
- Review error output before attempting destructive database operations.

### Git reports a merge conflict

- Identify the conflicting files.
- Resolve application source conflicts by reviewing both branches.
- Resolve `package.json` before reconciling `package-lock.json`.
- Validate dependency changes and run the application before merging.
- Do not discard changes from either branch without reviewing their purpose.

## Project Status

The project is being developed as a full-stack personal finance management application with:

- A React and TypeScript frontend built with Vite.
- An Express REST API using TypeScript.
- PostgreSQL persistence through Prisma.
- CRUD functionality for transactions, budgets, savings goals, and categories.

The implementation and documentation may evolve as new features are integrated.

## Future Improvements

Potential areas for future development include:

- Authentication and authorization.
- More comprehensive financial analytics.
- Automated unit and integration tests.
- Improved error handling and form validation.
- Production deployment and monitoring.
- Automated database backups and deployment workflows.

## Contributing

Contributions should follow the project's branching strategy. Create feature branches from `develop`, test changes, and submit pull requests for review.

Please ensure that the application runs correctly and that no secrets or local environment files are included in commits before submitting a pull request.
