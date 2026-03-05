# Empire Residential Web App

Welcome to the Empire Residential property booking application. This modern web application provides a stunning glassmorphism-inspired UI to discover and book premium accommodations.

## Features Let We Built
- **Responsive Design**: Beautiful interface powered by Tailwind CSS.
- **Dynamic Property Viewing**: Browse properties extracted from custom data sources.
- **Glassmorphism UI**: High-end visual aesthetic ensuring a premium feel.
- **Mock Booking Engine**: A Next.js API route-driven backend simulating checkout and booking history.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `src/app/api`: Next.js Route Handlers for properties and bookings.
- `src/app/ (page.tsx, layout.tsx)`: The main entry points and views for the app.
- `src/components`: Reusable UI elements such as `Header`, `Footer`, and `BookingFlow`.
- `public/`: Static assets including generated property images and `logo.png`.
- `src/data/properties.json`: Structured property data synthesized from scraped local files.

## Technology Stack

- [Next.js](https://nextjs.org) (App Router)
- React
- [Tailwind CSS](https://tailwindcss.com)
- TypeScript
- Phosphor Icons

Enjoy your premium stays with Empire Residential!
