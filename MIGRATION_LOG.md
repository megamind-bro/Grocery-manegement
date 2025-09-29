# Tech Stack Migration Log

Tracks steps converting the app to the stack defined in `readme.md` (Flask + SQLite + Firebase + AI).

## Context
- App: `grocerysync`
- Frontend: React + Tailwind CSS (unchanged)
- Backend: Flask (Python)
- Data: SQLite primary; Firebase for auth and backups
- AI: RAG for chatbot; Statsmodels ARIMA for forecasting

## 2025-09-29
1) Docs alignment
- Updated `readme.md` to reflect Flask + SQLite + Firebase + AI layers.
- Replaced FastAPI/PostgreSQL references with Flask/SQLite.

2) Backend scaffold
- Added `server/app.py` (Flask) with routes and SQLite models.
- Removed `python_backend/` after migration.
- Vite proxy to Flask for `/api` and scripts updated in `package.json`.

3) Modular refactor and integrations
- Added `server/db.py` (engine, SessionLocal, models) and `server/config.py` (dotenv-backed configuration).
- Added `server/auth.py` with Firebase token verification and decorator; guarded GET `/api/orders`.
- Added `server/mpesa.py` with async STK push client; wired callback route.
- Split routes into blueprints: `routes_products.py`, `routes_categories.py`, `routes_orders.py`, `routes_analytics.py` and registered in `server/app.py`.

4) Environment and configuration
- Created `.env.example` with keys: `PORT`, `DATABASE_URL`, Firebase, M-Pesa, and `BASE_URL`.
- All modules now pull config from `server/config.py` (dotenv loaded).

Next steps
- Add Alembic migrations and seed data
- Implement persistent mapping of CheckoutRequestID -> order for M-Pesa
- Expand Firebase-protected routes as needed
- Add ARIMA forecasting and RAG endpoints
- Update README with Python backend run instructions
