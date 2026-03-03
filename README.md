# upSystem

四川省遴选复习系统（前后端分离，Frontend-First 开发模式）。

## Frontend

```bash
cd frontend
npm install
npm run dev
```

## Backend (Conda)

```bash
conda env create -p ./.conda/upsystem -f environment.yml
cd backend
conda run -p ../.conda/upsystem uvicorn main:app --reload --port 8000
```

## Test

Frontend:

```bash
cd frontend
npm run test:unit
npm run build
npm run test:e2e -- --project=chromium
```

Backend:

```bash
cd backend
conda run -p ../.conda/upsystem pytest -q
```
