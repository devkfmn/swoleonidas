# Swoleonidas

**Import the plan. Fight the day. Track the streak.**

Swoleonidas is a mobile-first habit tracker for executing imported training programs. The app is not where the program is created — it is where the program is executed.

## Tech stack

- React + Vite + TypeScript
- Tailwind CSS
- Firebase Authentication (Google)
- Cloud Firestore
- Zod (JSON validation)
- date-fns (date handling)
- Vercel (deployment)

## Local development

### Prerequisites

- Node.js 20+
- npm
- A Firebase project with Google Auth and Firestore enabled

### Setup

1. Clone the repository:

```bash
git clone https://github.com/devkfmn/swoleonidas.git
cd swoleonidas
```

2. Install dependencies:

```bash
npm install
```

3. Copy environment variables:

```bash
cp .env.example .env.local
```

4. Fill in your Firebase web app config values in `.env.local`:

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth domain (`project-id.firebaseapp.com`) |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |

5. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm test` | Run unit tests |

## Firebase setup

### 1. Create a Firebase project

```bash
npx -y firebase-tools@latest login
npx -y firebase-tools@latest projects:create swoleonidas --display-name "Swoleonidas"
```

Or create a project in the [Firebase Console](https://console.firebase.google.com/).

### 2. Register a web app

In Firebase Console → Project settings → Your apps → Add app → Web. Copy the config values into `.env.local`.

### 3. Enable Google Authentication

Firebase Console → Authentication → Sign-in method → Enable **Google**.

Add authorized domains:
- `localhost`
- Your Vercel production domain (e.g. `swoleonidas.vercel.app`)

### 4. Create Firestore database

```bash
npx -y firebase-tools@latest use <your-project-id>
npx -y firebase-tools@latest firestore:databases:create "(default)" --location=europe-west6
```

Or create via Firebase Console → Firestore → Create database (production mode).

### 5. Deploy security rules

This project includes user-scoped rules in `firestore.rules`:

```
users/{userId}/programs/{programId}
users/{userId}/completionLogs/{logId}
users/{userId}/settings/main
```

Deploy:

```bash
npx -y firebase-tools@latest deploy --only firestore:rules
```

### Firestore data model

| Collection path | Document ID | Fields |
|-----------------|-------------|--------|
| `users/{uid}/programs/{programId}` | `program.programId` | `program`, `importedAt`, `updatedAt`, `isActive` |
| `users/{uid}/completionLogs/{date}_{programId}` | `{YYYY-MM-DD}_{programId}` | `date`, `programId`, `workoutId`, `items`, `note`, `createdAt`, `updatedAt` |
| `users/{uid}/settings/main` | `main` | `activeProgramId`, `createdAt`, `updatedAt` |

## Vercel deployment

1. Push the repository to GitHub.

2. Import the project in [Vercel](https://vercel.com/new).

3. Framework preset: **Vite**

4. Add all `VITE_FIREBASE_*` environment variables in Vercel project settings.

5. Deploy.

6. Add your Vercel domain to Firebase **Authorized domains** (Authentication → Settings).

The included `vercel.json` rewrites all routes to `index.html` for client-side routing.

## App pages

| Page | Route | Description |
|------|-------|-------------|
| Today | `/today` | Today's workout, exercise checklist, completion |
| Calendar | `/calendar` | Monthly adherence view |
| Programs | `/programs` | Manage imported programs |
| Import | `/import` | Paste and validate program JSON |
| Settings | `/settings` | Profile, sign out, data management |

## Creating / importing a program

1. Go to **Programs** and open create/import.
2. Fill goal, equipment, and duration, then click **Generate with AI** (Firebase Gemini), or **Copy Prompt** for ChatGPT.
3. Review the JSON, validate, then save.
4. Click **Load Example Program** to try the bundled 24-week Greek God program.
5. Activate the program from the **Programs** page.

AI generation uses Firebase AI Logic + App Check. Set `VITE_FIREBASE_APPCHECK_SITE_KEY` in `.env.local` and Vercel.

## Architecture

- **Program JSON** — immutable execution plan (imported, never mutated by completion)
- **Completion logs** — separate Firestore documents keyed by `{date}_{programId}`
- **Schedule engine** — pure TypeScript (`src/lib/schedule/`) calculates workouts, progressions, and day status
- **Validation** — Zod schema (`src/lib/validation/programSchema.ts`)

## License

Private — all rights reserved.
