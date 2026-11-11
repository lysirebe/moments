# ADR-0001: Monorepo with npm workspaces

## Status

Accepted

## Context

The moments platform has a mobile app, shared UI components, shared types, and
shared config. We need a single repository that makes it easy to share code
across packages while keeping the mobile app buildable with Expo.

## Decision

Use a monorepo with **npm workspaces** and **Turborepo** for task orchestration.

- `apps/mobile` — the Expo app.
- `packages/ui` — shared design tokens and components.
- `packages/types` — shared TypeScript types.
- `packages/config` — shared eslint and tsconfig presets.

The `.npmrc` sets `node-linker=hoisted`, which is required for Expo to resolve
dependencies correctly in a monorepo.

## Consequences

- Shared types and UI are versioned together with the app.
- A single `npm install` at the root installs everything.
- Turborepo caches builds and typechecks.
- Expo monorepo support requires the hoisted node linker.
