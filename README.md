# oripro-backend

Minimal Express backend with a login endpoint.

## Setup

1. Copy `.env.example` to `.env` and set `JWT_SECRET`.
2. Set Postgres variables in `.env` (see below) and ensure the database exists.
3. Install dependencies: `npm install`
4. Run migrations: `npm run migrate`
5. Seed demo user: `npm run seed`
6. Start dev server: `npm run dev`

## Endpoints

- POST `/api/auth/login`

Request JSON:

```json
{ "email": "test@example.com", "password": "password123" }
```

Response JSON:

```json
{ "token": "<jwt>", "user": { "id": "u_1", "email": "test@example.com", "name": "Test User", "roles": ["user"] } }
```

Health check: GET `/health`

### Environment variables

```
PORT=3000
JWT_SECRET=replace-with-a-long-random-string
PGHOST=localhost
PGPORT=5432
PGDATABASE=oripro
PGUSER=postgres
PGPASSWORD=
PGSSL=
```


