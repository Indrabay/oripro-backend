# oripro-backend

Minimal Express backend with a login endpoint.

## Setup

1. Copy `.env.example` to `.env` and set `JWT_SECRET`.
2. Set Postgres variables in `.env` (see below) and ensure the database exists.
3. Install dependencies: `npm install`
4. Set `config/config.json` (see below) - this is used as migration helper.
5. Run migrations: `npm run migrate` | `npx sequelize-cli db:migrate`
6. Seed demo user: `npm run seed` | `npx sequelize-cli db:seed:all`
7. Start dev server: `npm run dev`

## Endpoints

- POST `/api/auth/login`
- POST `/api/auth/forgot-password`
- POST `/api/auth/reset-password`
- POST `/api/users`
- GET `/api/users`
- GET `/api/users/:user_id`
- PUT `/api/users/:user_id`
- DELETE `/api/users/:user_id`
- POST `/api/assets`
- GET `/api/assets`
- GET `/api/assets/:asset_id`
- PUT `/api/assets/:asset_id`
- DELETE `/api/assets/:asset_id`
- POST `/api/units`
- GET `/api/units`
- GET `/api/units/:unit_id`
- PUT `/api/units/:unit_id`
- DELETE `/api/units/:unit_id`
- POST `/api/tenants`
- GET `/api/tenants`
- GET `/api/tenants/:tenant_id`
- PUT `/api/tenatns/:tenant_id`
- DELETE `/api/tenants/:tenant_id`

Health check: GET `/health`

### Environment variables

```
PORT=3000
JWT_SECRET=
PGHOST=
PGPORT=
PGDATABASE=
PGUSER=
PGPASSWORD=
PGSSL=

DB_TYPE=mysql

# MySQL
MYSQL_HOST=
MYSQL_PORT=
MYSQL_DATABASE=
MYSQL_USER=
MYSQL_PASSWORD=
# SMTP for email sending
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=465
SMTP_USER=
SMTP_PASSWORD=
SMTP_SECURE=false
MAIL_FROM=

```
`config/config.json`
```
{
  "postgres": {
    "username": "changeme",
    "password": "changeme",
    "database": "changeme",
    "host": "changeme",
    "dialect": "changeme"
  },
  "mysql": {
    "username": "changeme",
    "password": "changeme",
    "database": "changeme",
    "host": "changeme",
    "dialect": "changeme"
  }
}
```


