# DJ List

A web app for cataloging and searching records with DJ-focused metadata (BPM, key, genre, artist), including playlist workflows and transposition helpers.

## Current Stack

- **Backend:** Node.js, Express, MongoDB driver v6
- **Views:** Pug templates
- **Frontend:** React, TypeScript, Vite (bundle output in `app/static/assets-react`)
- **UI:** Tailwind CSS v4, SortableJS
- **Tests:** Mocha, Chai, Supertest (backend); Vitest (frontend); Playwright (smoke + integration)

## Prerequisites

- Node.js 18+
- MongoDB running locally (`mongodb://localhost`)

## Installation

```bash
git clone https://github.com/willdaly/dj-list.git
cd dj-list
npm install
```

## Running Locally

1. Start MongoDB (if not already running).
2. Create a local env file from the example:

```bash
cp .env.example .env
```

3. Fill in your Spotify credentials in `.env`.
4. Start the app:

```bash
npm start
```

The app runs at [http://localhost:4000](http://localhost:4000).

5. Seed songs (optional; the database starts empty):

```bash
npm run seed
```

If `../list.json` exists (sibling to the project), it will be used. Override with `LIST_DATA=/path/to/list.json`. Use `--force` to replace existing data.

### Required environment variables

- `SESSION_KEYS` - comma-separated cookie-signing keys (at least two), e.g. `key1,key2`
- `SPOTIFY_CLIENT_ID` - Spotify app client ID
- `SPOTIFY_CLIENT_SECRET` - Spotify app client secret
- `SPOTIFY_REDIRECT_URI` - OAuth callback URL (for local dev: `http://127.0.0.1:4000/auth/spotify/callback`)

### Optional environment variables

- `DBNAME` - MongoDB database name (default: `dj-list`)
- `PORT` - server port (default: `4000`)

### Production deployment

**Never commit `.env`.** It is in `.gitignore` and contains secrets. In production, set environment variables via your platform (Heroku Config Vars, Railway, Vercel, Render, etc.)—do not upload or deploy a `.env` file.

## Frontend Workflow

- Build frontend assets:

```bash
npm run build:frontend
```

- Run Vite dev server (frontend-only, with API proxy):

```bash
npm run dev:frontend
```

`npm start` builds the frontend and starts the Node server.

## Tests

- Backend (Mocha):

```bash
npm test
```

Watch mode:

```bash
npm run watch
```

- Frontend (Vitest):

```bash
npm run test:frontend
```

- Browser tests (Playwright – smoke + integration):

```bash
npm run test:smoke
```

- Full check (typecheck, lint, and tests for frontend and backend):

```bash
npm run check
```

## Authentication

The app uses Spotify OAuth for sign-in. Click **Sign In with Spotify** on the home page.

**Important:** `SPOTIFY_REDIRECT_URI` must match the host you use in the browser Spotify often accepts `http://127.0.0.1:4000/...` but rejects `http://localhost:4000/...`, so use **127.0.0.1** in both your `.env` and your browser URL. Add that URI to your [Spotify app’s redirect URIs](https://developer.spotify.com/dashboard).

## Project History

Originally created in 2014 at Nashville Software School and modernized for current Node/Mongo/frontend tooling while keeping the core DJ catalog workflow intact.