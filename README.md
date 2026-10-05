# Suay Duan Lao (ຊ່ວຍດ່ວນ ລາວ)

24/7 Real-Time Emergency Response Web Application for Laos.

## Architecture

- **Citizen App (`/`)**: Mobile-first (360px) one-tap SOS report flow with 5-second cancel countdown and live tracking.
- **Dispatch Dashboard (`/control`)**: Live incident queue, interactive map, unit assignment, and operational status controls.

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS (with custom emergency tokens and Noto Sans Lao typography)
- React Router 7, TanStack Query 5, Zustand 5
- Leaflet + OpenStreetMap
- Service worker / PWA support

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# TypeScript type check
npm run typecheck

# Production build
npm run build
```

## Environment Flags

- `VITE_USE_MOCK=true|false`: Toggles between mock data layer and production API.
