# Tailpoint Mobile

The Tailpoint companion app for iOS and Android, built with Expo Router, React Native, NativeWind/Tailwind CSS, and strict TypeScript.

## Requirements

- Node.js 22.13 or later (required by Expo SDK 57)
- npm
- An Android emulator/device, iOS simulator/device, or supported web browser

## Local setup

```bash
npm install
cp .env.example .env.local
npm start
```

Set `EXPO_PUBLIC_API_URL` to a Tailpoint development API reachable from the selected device. `localhost` on a physical device refers to that device, not the development computer.

## Quality checks

```bash
npm run check
```

## Architecture boundaries

- Expo Router owns navigation and deep-link routing.
- NativeWind/Tailwind utilities style screens and components; semantic Tailpoint tokens remain the design source of truth.
- TanStack Query owns server-derived state.
- Zustand owns small client-only state; it must not duplicate API collections.
- SecureStore holds refresh tokens; access tokens remain in memory.
- API types are generated from the backend OpenAPI contract.
- `EXPO_PUBLIC_*` configuration is public and must never contain secrets.

Product and delivery documentation lives in [`PEeGEe21/tailpoint-docs`](https://github.com/PEeGEe21/tailpoint-docs).
