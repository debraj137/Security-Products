# AI Security Sales and Customer Management Platform

This workspace contains a full-stack implementation split into:

- `backend/`: Express + MongoDB + Mongoose API
- `frontend/`: Next.js 15 customer and admin portal

## What is included

- Customer registration with auto-login response
- Customer and admin login
- Public product catalog with the three security plans
- Purchase flow that creates orders and payments
- Admin dashboard with activation controls
- Customer dashboard with activation visibility
- Notifications and support request handling
- MongoDB product seeding and admin bootstrap support

## Backend setup

1. Copy `backend/.env.example` to `backend/.env`
2. Update `MONGODB_URI`, `JWT_SECRET`, and admin credentials
3. Install dependencies:

```powershell
cd backend
npm install
```

4. Seed the admin account:

```powershell
npm run seed-admin
```

5. Start the API:

```powershell
npm run dev
```

Backend runs on `http://localhost:5000`.

## Frontend setup

1. Copy `frontend/.env.example` to `frontend/.env.local`
2. Install dependencies:

```powershell
cd frontend
npm install
```

3. Start the app:

```powershell
npm run dev
```

Frontend runs on `http://localhost:3000`.

## Important notes

- The current checkout flow uses a manual paid/pending toggle instead of a real payment gateway.
- Forgot-password currently returns a reset token and also stores it as an in-app notification.
- `/api/admin/bootstrap-admin` is open for first-time setup. In production, protect or remove it after bootstrapping.
- Product access is gated by order `activationStatus === "active"` and managed from the admin UI.
