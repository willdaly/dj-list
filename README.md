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
2. Start the app:

```bash
DBNAME=dj-list SESSION_KEYS=change-me-1,change-me-2 npm start
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

## Tests

Run the full suite:

```bash
npm test
```

Watch mode:

```bash
npm run watch
```

## Authentication

The app now uses Spotify OAuth for sign-in. Click **Sign In with Spotify** on the home page.

## Project History

Originally created in 2014 at Nashville Software School and modernized for current Node/Mongo/frontend tooling while keeping the core DJ catalog workflow intact.