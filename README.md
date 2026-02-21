# preconstrucion

Pre-construction pipeline tracker: manage leads, technical visits, sent quotes, follow-ups and accepted projects. Includes KPIs (pending value, no-reply >14 days) and visit sheets with status updates. **Demo UI is available in French (FR) and Portuguese (PT)** via the language switcher in the header.

---

## What's implemented

### Frontend (React + Vite)

- **Home page**
  - **Language**: FR / PT switcher; all labels, KPIs and panel copy follow the selected language.
  - **Header** with 3 KPIs from API data:
    - **Pending quotes** – sum of project values not yet in "Accepted".
    - **No reply > 14 days** – sum of values for projects in the same status for more than 14 days.
    - **Average quote send time** – fixed value (6 days), reserved for future use.
  - **Pipeline columns** (Kanban): New Lead → Technical Visit → Quote Sent → Client Follow-up → Accepted (titles in FR or PT).
  - **Project cards** per column (client, title, value); projects >14 days in status are highlighted.
  - **Visit sheet** (side panel on card click): client details, specs, notes, photo placeholders, **Update status** (new status select + PATCH to API).
- **Data** from `GET /api/projects`; React Query for fetch and cache invalidation after updates.

### Backend (Express)

- **Projects API** (prefix `/api`):
  - `GET /api/projects` – list all.
  - `GET /api/projects/:id` – one project.
  - `POST /api/projects` – create (Zod-validated body).
  - `PATCH /api/projects/:id` – update (e.g. status and reset `daysInStatus`).
- **Shared schema** (`shared/schema.ts`): `projects` table and `users` for future auth; Drizzle + Zod.
- **Storage**: in-memory with seed data; can be swapped for Drizzle + PostgreSQL.

---

## How to run

1. **Install**
   ```bash
   npm install
   ```

2. **Development**
   ```bash
   npm run dev
   ```
   Serves at `http://127.0.0.1:5000` (or `PORT` / `HOST` env).

3. **Production**
   ```bash
   npm run build
   npm start
   ```

4. **PostgreSQL** (optional): set `DATABASE_URL`, run `npm run db:push`, then switch server storage to Drizzle.

---

## Next steps

- Persist projects (and users) with Drizzle + PostgreSQL.
- Auth: login/register with Passport and protect `/api/projects`.
- Photo upload and store URLs in `photoUrls`.
- Compute average quote send time from a date field (e.g. `quoteSentAt`).
- Auto-update `daysInStatus` (e.g. from `statusUpdatedAt`).
