# DJ List

A web app for cataloging and searching records with DJ-focused metadata (BPM, key, genre, artist), including playlist workflows and transposition helpers.

## Current Stack

- **Backend:** Node.js, Express, MongoDB driver v6, Socket.IO
- **Views:** Pug templates
- **Frontend build:** Vite (bundle output in `app/static/assets`)
- **Frontend libs:** jQuery, Bootstrap 3, noUiSlider, SortableJS, lodash, moment
- **Styles:** LESS source in `app/less/app.less`, compiled to `app/static/css/app.css`
- **Tests:** Mocha, Chai, Supertest

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

### Required environment variables

- `SESSION_KEYS` - comma-separated cookie-signing keys (at least two), e.g. `key1,key2`
- `SPOTIFY_CLIENT_ID` - Spotify app client ID
- `SPOTIFY_CLIENT_SECRET` - Spotify app client secret
- `SPOTIFY_REDIRECT_URI` - OAuth callback URL (for local dev: `http://localhost:4000/auth/spotify/callback`)

### Optional environment variables

- `DBNAME` - MongoDB database name (default: `default-db`)
- `PORT` - server port (default: `4000`)

## Frontend Workflow

- Build frontend assets:

```bash
npm run build:frontend
```

- Run Vite dev server (frontend-only):

```bash
npm run dev:frontend
```

`npm start` compiles LESS and starts the Node server. If you change frontend JS modules, run `npm run build:frontend` to refresh bundled assets.

### Legacy frontend stabilization note

The current jQuery-based frontend modules in `app/frontend/modules` are in stabilization mode. Treat them as bugfix-only while the React migration is planned/executed.

## Tests

Run the full suite:

```bash
npm test
```

Watch mode:

```bash
npm run watch
```

Browser smoke test (controls/search baseline):

```bash
npm run test:smoke
```

## Authentication

The app now uses Spotify OAuth for sign-in. Click **Sign In with Spotify** on the home page.

## Project History

Originally created in 2014 at Nashville Software School and modernized for current Node/Mongo/frontend tooling while keeping the core DJ catalog workflow intact.