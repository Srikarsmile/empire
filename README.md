# Empire Car Rental Sosua

A Next.js vehicle-rental site for `Empire Car Rental Sosua`, focused on airport pickup, fleet browsing, reservation checkout, and reservation history.

## What the app includes

- Landing page with Sosua-focused car-rental branding
- Fleet explorer with filters for dates, passengers, pricing, and vehicle options
- Vehicle detail pages with gallery, reviews, and availability context
- Reservation flow with driver details, calendar selection, and pricing summary
- Reservations page for upcoming and completed rentals
- Dedicated `/how-to-rent` explainer page
- Responsive layouts optimized for mobile and desktop

## Tech stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Framer Motion
- Tailwind CSS v4 with global CSS styling
- Phosphor Icons (`@phosphor-icons/web`)

## Routes

- `/` - Landing page and fleet explorer
- `/fleet/[id]` - Vehicle detail page
- `/reserve/[id]` - Reservation flow for a selected vehicle
- `/reservations` - Reservation history
- `/how-to-rent` - Rental process overview

## API endpoints

- `GET /api/vehicles` - List all fleet vehicles
- `GET /api/vehicles/[id]` - Fetch one vehicle
- `GET /api/reservations` - List reservations
- `POST /api/reservations` - Create a reservation in the in-memory mock store

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality checks

```bash
npm run lint
npm run build
```

## Project structure

- `src/app` - App Router pages and API route handlers
- `src/components` - Shared UI components for the site, fleet flow, and reservation flow
- `src/data` - Fleet inventory and review/availability metadata
- `src/lib` - Shared data helpers and event utilities
- `public` - Static assets used by the app shell

## Notes

- Fleet imagery is loaded from Unsplash via `next/image` remote patterns.
- Reservation data is mocked in memory and resets when the server restarts.
- If Next.js warns about multiple lockfiles during build, that is coming from the parent workspace layout rather than this app's code.
