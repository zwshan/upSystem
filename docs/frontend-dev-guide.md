# Frontend Development Guide

## Prerequisites

- Node.js 20+
- npm 9+

## Run Locally

```bash
cd frontend
npm install
npm run dev
```

## Unit Tests

```bash
cd frontend
npm run test:unit
```

## E2E Smoke Tests

```bash
cd frontend
npm run test:e2e -- --project=chromium
```

## Build

```bash
cd frontend
npm run build
```

## Data Mode

`frontend/.env.example`:

```dotenv
VITE_DATA_MODE=mock
```

- `mock`: local mock repository (default)
- `api`: API repository adapter (placeholder for backend integration)
