# Setup Guide

How to get this project running on a fresh machine (e.g. after switching laptops).

## Prerequisites

- **Node.js 20** (see `.nvmrc` / `engines` in `package.json`). If you use `nvm`: `nvm use`
- **npm** (comes with Node)
- For mobile builds only: **Xcode** (iOS) and/or **Android Studio** (Android)

## 1. Clone

```bash
git clone <your-repo-url>
cd habit-rabbit-next-main
```

## 2. Environment variables (⚠️ not in Git)

`.env.local` is intentionally **not** committed, so it will NOT come down with `git clone`.
Copy it over manually from your old machine, or recreate it with:

```bash
cat > .env.local <<'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
EOF
```

Get these values from the Supabase dashboard → Project Settings → API.

## 3. Install dependencies

```bash
npm install
```

This recreates `node_modules/` from the committed `package-lock.json`.

## 4. Run the dev server

```bash
npm run dev
```

Open http://localhost:3000

## 5. Production build (optional)

```bash
npm run build
```

Generates `.next/` and the static export in `out/` (both gitignored).

## Mobile / Capacitor builds (optional)

The `android/` and `ios/` native project folders are gitignored and must be
regenerated on a fresh clone:

```bash
npx cap add android
npx cap add ios
```

Then build and open in the native IDE:

```bash
npm run build:android   # build web + copy + sync
npm run open:android    # open in Android Studio

npm run build:ios
npm run open:ios        # open in Xcode
```

## What is NOT committed (rebuilt by the commands above)

| Path | Recreated by |
|------|--------------|
| `node_modules/` | `npm install` |
| `.next/`, `out/` | `npm run build` |
| `tsconfig.tsbuildinfo` | build (auto) |
| `android/`, `ios/` | `npx cap add …` |
| `.env.local` | **manual copy — cannot be regenerated** |
