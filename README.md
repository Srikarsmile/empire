# Empire Residential Apartments

A modern Next.js booking experience for curated apartment stays, with a text-first assistant (`Genie`), fast filtering, and mobile-first UX.

## What this app includes

- Premium landing + property discovery flow
- Dedicated `How it works` page
- Property detail pages with gallery, reviews, and booking context
- Booking flow with guest details, availability calendar, and checkout summary
- Trips page for upcoming/completed booking history
- `Genie` assistant for natural-language stay recommendations
- Responsive layouts optimized for mobile interactions

## Tech stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Framer Motion
- Tailwind CSS v4 (global CSS-driven styling)
- Phosphor icon font package (`@phosphor-icons/web`)

## Routes

- `/` - Landing + search + listing explorer
- `/how-it-works` - Product explanation page
- `/property/[id]` - Property details
- `/book/[id]` - Booking flow for selected property
- `/bookings` - Booking history/trips

## API endpoints

- `GET /api/properties` - List all properties
- `GET /api/properties/[id]` - Single property payload
- `GET /api/bookings` - Bookings list
- `POST /api/bookings` - Create booking (mocked persistence behavior)

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality checks

```bash
npm run lint
npm run build
```

## Project structure

- `src/app` - App Router pages, layouts, and route handlers
- `src/components` - UI and interaction components (Header, Footer, PropertyExplorer, BookingFlow, Genie)
- `src/data` - Property and metadata source files
- `src/lib` - Shared event/state helpers
- `public` - Static assets (logo, property images, icons)

## Notes

- Mobile browser extensions/attribute injection can trigger hydration warnings in dev overlays; hydration safeguards are already applied in key interactive controls.
- This repository uses local image assets under `public/images/properties/*`.
