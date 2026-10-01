# Task Manager

A small full-stack task manager with accounts. Register, log in, then create,
view, edit, delete, and complete your own tasks.

- **Frontend** — React 18, TypeScript, Vite, plain CSS (deploy on Vercel)
- **Backend** — Node.js, Express, TypeScript, REST API (deploy on Render)
- **Database** — PostgreSQL (Render managed PostgreSQL)
- **Auth** — email and password, bcrypt hashes, JWT bearer tokens

## Project structure

```text
task-manager/
├── frontend/                 # React app (Vite)
│   ├── src/
│   │   ├── components/       # AuthForm, Header, TaskForm, TaskList, TaskItem, ErrorMessage
│   │   ├── context/          # AuthContext (signed-in user + login/register/logout)
│   │   ├── hooks/            # useTasks (data + API calls)
│   │   ├── services/         # http (fetch + token), authApi, taskApi
│   │   ├── types/            # Task, User and input types
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── vercel.json
│   └── package.json
├── backend/                  # Express REST API
│   ├── src/
│   │   ├── config/           # env loading and validation
│   │   ├── controllers/      # HTTP layer (tasks + auth)
│   │   ├── routes/           # Express routers
│   │   ├── services/         # business logic + SQL
│   │   ├── middleware/       # auth guard, error handling
│   │   ├── db/               # pool, schema.sql, migrations, migrate script
│   │   ├── utils/            # error classes, JWT helpers
│   │   ├── types/
│   │   ├── app.ts            # Express app (no port)
│   │   └── server.ts         # Starts the server
│   └── package.json
├── render.yaml               # Optional Render blueprint
├── package.json              # Convenience scripts
└── README.md
```

The backend keeps a simple request flow:

```text
request -> routes/taskRoutes.ts -> controllers/taskController.ts
        -> services/taskService.ts -> db/pool.ts (PostgreSQL)
        -> middleware/errorHandler.ts -> JSON response
```

Protected routes pass through `middleware/auth.ts` first, which verifies the
token and attaches the user. Every task query is scoped to that user's id.

## How authentication works

1. `POST /api/auth/register` or `/login` returns a signed JWT and the user.
2. The frontend stores the token in `localStorage` and sends it on every
   request as `Authorization: Bearer <token>`.
3. `requireAuth` verifies the token, loads the user, and sets `req.user`.
4. Task routes are private, and SQL filters by `user_id`, so one account can
   never read or change another's tasks.
5. If a token expires, the API returns 401 and the app returns you to the
   login screen automatically.

## Prerequisites

- Node.js 18 or newer
- A PostgreSQL database (local install, Docker, or a Render free instance)

## Setup

### 1. Install dependencies

From the project root:

```bash
npm run install:all
```

Or separately:

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment variables

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```dotenv
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/task_manager
JWT_SECRET=some-long-random-string
```

`JWT_SECRET` signs login tokens. Anything works locally, but use a long random
value in production and never commit it. Generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

For the frontend you can leave things as they are for development, because Vite
proxies `/api` to `http://localhost:5000`. To point at another backend, copy
`frontend/.env.example` to `frontend/.env` and set `VITE_API_BASE_URL`.

### 3. Create the database tables

```bash
cd backend
npm run db:migrate
```

This runs `backend/src/db/schema.sql` and then any files in
`backend/src/db/migrations/`. It creates the `users` and `tasks` tables and is
safe to run more than once.

### 4. Run both apps

In two terminals:

```bash
npm run dev:backend    # http://localhost:5000
npm run dev:frontend   # http://localhost:5173
```

Open http://localhost:5173.

## API reference

Base URL: `http://localhost:5000/api`

### Auth (public)

| Method   | Endpoint            | Description                          | Body                          |
| -------- | ------------------- | ------------------------------------ | ----------------------------- |
| `GET`    | `/auth/has-users`   | Whether any account exists yet       | –                             |
| `POST`   | `/auth/register`    | Create an account, returns a token   | `{ "email": "string", "password": "string" }` |
| `POST`   | `/auth/login`       | Log in, returns a token              | `{ "email": "string", "password": "string" }` |
| `GET`    | `/auth/me`          | The signed-in user (needs a token)   | –                             |

Register and login return:

```json
{
  "data": {
    "token": "eyJhbGciOi...",
    "user": { "id": 1, "email": "you@example.com", "created_at": "2026-01-01T10:00:00.000Z" }
  }
}
```

The password hash is never included in a response.

### Tasks (all require `Authorization: Bearer <token>`)

| Method   | Endpoint          | Description                    | Body                                  |
| -------- | ----------------- | ------------------------------ | ------------------------------------- |
| `GET`    | `/health`         | Health check                   | –                                     |
| `GET`    | `/tasks`          | List your tasks                | –                                     |
| `GET`    | `/tasks?completed=true` | Filter by state           | –                                     |
| `GET`    | `/tasks/:id`      | Get one of your tasks          | –                                     |
| `POST`   | `/tasks`          | Create a task                  | `{ "title": "string", "description": "string?" }` |
| `PATCH`  | `/tasks/:id`      | Update a task                  | `{ "title"?, "description"?, "completed"? }`     |
| `DELETE` | `/tasks/:id`      | Delete a task                  | –                                     |

You only ever see and change your own tasks. Asking for someone else's returns
`404`, the same as asking for one that does not exist.

Successful responses are wrapped in `data`:

```json
{
  "data": {
    "id": 1,
    "user_id": 1,
    "title": "Buy milk",
    "description": "2% milk",
    "completed": false,
    "created_at": "2026-01-01T10:00:00.000Z",
    "updated_at": "2026-01-01T10:00:00.000Z"
  }
}
```

Errors return `{ "error": "message" }` with status `400` (validation), `401`
(missing or expired token, or wrong login), `404` (not found), or `500`.

Example:

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Buy milk"}'
```

## Deployment

### Database on Render

1. In the Render dashboard create a **PostgreSQL** instance.
2. Copy the **Internal Database URL** and keep it handy.

### Backend on Render

Using `render.yaml` (Root Directory: `repo`, Blueprint) or by creating a Web
Service manually:

| Setting          | Value                                   |
| ---------------- | --------------------------------------- |
| Root Directory   | `backend`                               |
| Build Command    | `npm install && npm run build`          |
| Start Command    | `npm start`                             |
| Health Check Path| `/api/health`                           |

Environment variables:

- `DATABASE_URL` — the internal Render PostgreSQL URL
- `JWT_SECRET` — a long random string, e.g. `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
- `NODE_ENV` — `production`
- `CLIENT_ORIGIN` — optional, your Vercel URL
- `JWT_SECRET` — a long random string; logins break if this changes

After the first deploy, run the migration once (Render shell, or locally against
the database):

```bash
npm run db:migrate
```

SSL is enabled automatically in production, which is what Render's managed
PostgreSQL expects.

### Frontend on Vercel

1. Import the repository and set **Root Directory** to `frontend`.
2. Vercel detects Vite; `frontend/vercel.json` sets the build command and output
   directory.
3. Add the environment variable:

   ```dotenv
   VITE_API_BASE_URL=https://task-manager-api.onrender.com/api
   ```

4. Deploy. The app calls your Render backend through this URL, so CORS is
   handled by the backend's `cors()` middleware. To lock it down, replace
   `cors()` in `backend/src/app.ts` with
   `cors({ origin: 'https://your-app.vercel.app' })`.

## Scripts

Root:

| Command                | Description                        |
| ---------------------- | ---------------------------------- |
| `npm run install:all`  | Install backend and frontend deps  |
| `npm run dev:backend`  | Start the API with reload          |
| `npm run dev:frontend` | Start the Vite dev server          |
| `npm run build`        | Build both projects                |
| `npm run typecheck`    | Type-check both projects           |
| `npm run db:migrate`   | Create/update database tables      |

Backend:

| Command              | Description                       |
| -------------------- | --------------------------------- |
| `npm run dev`        | `tsx watch` dev server            |
| `npm run build`      | Compile TypeScript to `dist`      |
| `npm start`          | Run the compiled server           |
| `npm run db:migrate` | Apply `schema.sql` and migrations |
| `npm run typecheck`  | Type-check without emitting files |

Frontend:

| Command             | Description             |
| ------------------- | ----------------------- |
| `npm run dev`       | Vite dev server         |
| `npm run build`     | Production build        |
| `npm run preview`   | Preview the build       |
| `npm run typecheck` | Type-check without emit |

## Notes

- All database credentials come from `DATABASE_URL` and tokens are signed with
  `JWT_SECRET`. Nothing is hardcoded, and `.env` files are gitignored.
- The API uses parameterised SQL queries, so input is never concatenated into
  SQL.
- Passwords are hashed with bcrypt before being stored. The hash never leaves
  the server.
- The token is kept in `localStorage`, which JavaScript can read. That is the
  usual trade-off with bearer tokens; httpOnly cookies would avoid it but need a
  different backend setup.
- `frontend/vercel.json` rewrites unknown paths to `index.html` for client-side
  routing.

## Troubleshooting

- **`Missing environment variable "DATABASE_URL"`** or **`"JWT_SECRET"`** —
  create `backend/.env` from `.env.example` and fill in both values.
- **`Could not connect to PostgreSQL`** — make sure PostgreSQL is running and
  that `DATABASE_URL` matches its host, port, and database name.
- **Everyone gets logged out at once** — `JWT_SECRET` changed, so existing
  tokens no longer verify. Sign in again.
- **Tasks do not load in the browser** — check the Network tab. A `401` means
  you are signed out; otherwise confirm the backend is on port 5000, since the
  Vite proxy targets it.
- **CORS errors in production** — set `VITE_API_BASE_URL` on Vercel to your
  Render URL, including the `/api` suffix.