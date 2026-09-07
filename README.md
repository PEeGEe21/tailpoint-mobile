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

Set `EXPO_PUBLIC_API_URL` to the Tailpoint API origin, without the `/api` suffix,
and ensure it is reachable from the selected device. `localhost` on a physical
device refers to that device, not the development computer.

### Expo Go versus development builds

Use an explicit launch target:

```bash
# Physical phone using Expo Go on the same network
npm run start:go

# Expo Go when LAN discovery/reachability is unreliable
npm run start:go:tunnel

# Installed Tailpoint development client
npm run start:dev-client
```

Because this project includes `expo-dev-client`, a plain `npm start` may target a development build. An Expo Go scan must use a server started with `--go`. Stop any existing server on port 8081 before switching modes.

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

## API contract

The backend OpenAPI document is the source of truth for the mobile API client.
The mobile repository pins a copy at `openapi/tailpoint.openapi.json` and
generates TypeScript definitions at `src/api/generated/schema.ts`.

### When to regenerate

Regenerate the contract when a backend change affects the public API, including:

- adding, removing, or renaming an endpoint;
- changing request or response fields;
- changing DTOs, enums, headers, query/path parameters, or status codes; or
- changing authentication, organization scoping, uploads, or download behavior.

Regeneration is not required for internal service logic, database-query changes,
background jobs, refactoring, tests, documentation, or mobile UI changes that do
not alter the API contract.

### Backend-to-mobile workflow

From the backend repository, export and validate the canonical artifact:

```sh
npm run openapi:export
npm run openapi:check
```

With the backend and mobile repositories in the same parent directory, copy the
artifact and regenerate the mobile types:

```sh
cp ../track-a-project-backend/openapi/tailpoint.openapi.json openapi/tailpoint.openapi.json
npm run api:generate
npm run api:check
npm run typecheck
```

Commit the backend artifact, pinned mobile artifact, and generated TypeScript in
the same coordinated change. Do not manually edit
`src/api/generated/schema.ts`; update the backend contract and regenerate it.

`npm run api:check` fails when the committed generated types do not match the
pinned artifact. The complete `npm run check` command includes this validation,
so CI also catches drift.

### Client usage

Application code should use `createTailpointApiClient` rather than calling
`fetch` directly so bearer authentication and `X-Organization-ID` are applied
consistently.

- `EXPO_PUBLIC_*` configuration is public and must never contain secrets.

Product and delivery documentation lives in [`PEeGEe21/tailpoint-docs`](https://github.com/PEeGEe21/tailpoint-docs).
