# AGENTS.md

## Cursor Cloud specific instructions

This is a SvelteKit + Prisma + SQLite monolithic web app (wedding invitation creator).

### Quick reference

| Action | Command |
|---|---|
| Install deps | `npm install --ignore-scripts && npx svelte-kit sync && npx prisma generate` |
| Run migrations | `npx prisma migrate deploy` |
| Type check | `npm run check` |
| Dev server | `npm run dev` (Vite on port 5173) |
| Build | `npm run build` |

### Gotchas

- **`npm install` postinstall ordering**: The `postinstall` script runs `prisma generate`, which reads `tsconfig.json` which `extends .svelte-kit/tsconfig.json`. On a fresh clone, `.svelte-kit/` doesn't exist yet, so `postinstall` fails. Work around this by running `npm install --ignore-scripts` first, then `npx svelte-kit sync`, then `npx prisma generate`.
- **`.env` file required**: Copy `.env.example` to `.env` before running the app. It sets `DATABASE_URL="file:./dev.db"` for the embedded SQLite database.
- **Prisma migrations**: Run `npx prisma migrate deploy` to create/update the SQLite database at `./dev.db`. This is idempotent.
- **No external services needed**: The app uses embedded SQLite and local filesystem storage (`data/uploads/`). No Docker, Redis, or external databases required.
- **No lint command**: There is no ESLint configuration or `lint` script in `package.json`. Type checking via `npm run check` (svelte-check) is the primary code quality tool.
- **No test framework**: There are no automated test scripts or test frameworks configured in this project.
