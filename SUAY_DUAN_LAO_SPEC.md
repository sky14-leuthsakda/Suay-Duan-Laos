# Suay Duan Lao (ຊ່ວຍດ່ວນ ລາວ) — Frontend Specification

> Reference document for the AI Agent. Read this file fully before writing any code.
> Build FRONTEND ONLY. The backend is designed separately and will be plugged in later.

---

## 1. ROLE

You are a senior frontend engineer and UI/UX designer. Build the complete frontend for
**Suay Duan Lao**, a 24/7 real-time emergency response web app for Laos.

Do NOT build a backend. Build against a typed service interface with a mock
implementation, so the real backend can be connected later without changing UI code.

## 2. PRODUCT OVERVIEW

Two apps in one codebase, connected in real time:

1. **Citizen app** at `/` — for the public. Everyone uses a mobile phone.
   Send an emergency in ONE tap and track help arriving.
2. **Dispatch dashboard** at `/control` — for operators/admins.
   See and control every emergency: assign units, change status, monitor on a map.

Incident lifecycle:
`Received -> Acknowledged -> Dispatched -> On the way -> Arrived -> Resolved` (or `Cancelled`)

## 3. TECH STACK

- React + TypeScript + Vite
- Tailwind CSS
- React Router, TanStack Query, Zustand
- PWA: service worker, web manifest, installable, offline fallback, manifest shortcuts
- Map: Leaflet + OpenStreetMap (no paid API keys)
- i18n: Lao (default) and English. Font: Noto Sans Lao. All user-facing text in Lao by default.

## 3.1 MOBILE-FIRST UX RULES (highest priority — override any conflicting rule)

Assume the user is panicking, using one hand, on a low-end Android phone, with weak internet.

- Design for **360px width first**, then scale up to tablet/desktop.
- **SOS flow = ONE tap -> 5-second cancel countdown -> sent.**
  No login, no form, no popup before sending. Location is auto-attached.
  Type, note, and photo are optional and added AFTER the SOS is sent.
- Place all primary actions in the **bottom half** of the screen (thumb zone).
- Touch targets **>= 56px**. Large text. High contrast (WCAG AA minimum).
- Home screen contains only: SOS button, 6 type icons, emergency call buttons.
  No menus, no scrolling, no clutter.
- Every button = **icon + short Lao text** (max 5 words per label).
- **Silent mode** toggle: no sound, vibration, or flash (for personal-safety situations).
- PWA **home-screen shortcut** that opens directly to the SOS screen.
- **Data saver mode**: disable map tiles and images on weak networks.
- **Fallback location picker** (province / district / village) when GPS is denied or fails.
- **Training mode**: simulate the whole flow without sending a real incident.
- Haptic feedback (`navigator.vibrate`) on SOS press and on status change.
- First load of the citizen home route under **150 KB JS**. Lazy-load everything else.
- Never block the SOS screen with popups, cookie banners, or onboarding.
- Plain, simple Lao wording. No hard formal terms.

## 4. CITIZEN APP SCREENS

1. **Home**
   - One huge red SOS button (min 40% of screen height).
   - Below it, 6 quick type buttons: Fire, Medical, Traffic Accident,
     Crime/Personal Safety, Flood/Disaster, Other.
   - Emergency call buttons visible without scrolling.
2. **Report flow** (max 2 taps to send)
   - SOS tap -> 5s cancel countdown (big Cancel button) -> sent.
   - Auto-capture GPS, show on a mini map. Optional note and photo AFTER sending.
   - Confirm step ONLY for type "Other" (to prevent false alarms).
3. **Live status tracker**
   - Timeline: Received, Acknowledged, Dispatched, On the way, Arrived, Resolved.
   - Assigned unit name, ETA, and unit position on the map in real time.
4. **Emergency numbers** — one-tap call buttons:
   Police 191, Fire 190, Ambulance 195.
   (Make numbers configurable in one file; they must be verified before production.)
5. **First-aid guide** in Lao — searchable, fully available offline.
6. **Nearby services map** — hospitals, police stations, fire stations.
7. **My profile** — name, phone, emergency contacts, optional medical info (blood type etc.).
8. **Offline mode**
   - Visible banner when offline.
   - "Send via SMS" button that opens the phone's SMS app with a prefilled message
     containing incident type and coordinates.
   - Failed reports go into a retry queue and are sent automatically when back online.
9. **Share live location** — generate a link to share with family via SMS/WhatsApp.
10. **Trusted contacts** — SOS also notifies the user's chosen contacts (UI + API call only).

## 5. DISPATCH DASHBOARD SCREENS

1. **Live incident queue**
   - New incidents appear instantly at the top, sorted by priority then time.
   - Sound alert + visual flash for new critical incidents (operator can mute).
   - Filters: type, status, priority, province.
   - Duplicate detection UI: group nearby reports of the same event, allow merge/unmerge.
2. **Live map** — all incidents and response units as markers (color by type/status),
   clustering, click to open details.
3. **Incident detail** — reporter info, location, note, photo, full timeline,
   change status, change priority, assign/reassign unit, internal notes, call-reporter button.
4. **Units management** — list of units (ambulance, fire truck, police),
   status (available, busy, offline), position.
5. **Statistics** — incidents today, average response time, by type, by province
   (simple charts).
6. **Audit log** — who changed what and when.

Dashboard defaults to dark mode and is designed for desktop and tablet, but must remain usable
on a phone.

## 6. REAL-TIME BEHAVIOR (critical)

- Create a `RealtimeClient` abstraction (WebSocket-style) with: connect,
  auto-reconnect with exponential backoff, heartbeat, and event subscription.
- Events:
  - `incident.created`
  - `incident.updated`
  - `incident.status_changed`
  - `unit.location_updated`
  - `unit.assigned`
- Show a visible connection indicator (**Live / Reconnecting / Offline**) on every screen.
- Mark data as **stale** if the connection is lost. Never show outdated info as current.
- Optimistic UI for reporter actions, with rollback on failure and a retry queue when offline.
- Must be reliable 24/7: handle tab sleeping, network switching (wifi <-> mobile data),
  and session expiry without losing the user's active incident.

## 7. MOCK LAYER

- Define the interface in `src/services/api.ts` (REST-style functions) and
  `src/services/realtime.ts`, plus mock implementations that simulate incidents arriving,
  status changes, and moving units every few seconds.
- Define all TypeScript types in `src/types`: `Incident`, `Unit`, `User`, `Role`, `StatusEvent`.
- Single env flag `VITE_USE_MOCK=true|false` switches mock vs real API.
- Document all expected API endpoints and event payloads in `API_CONTRACT.md`.
- Seed data: realistic, in Lao, for Vientiane and other provinces.

## 8. ADDITIONAL RULES

- **Theme**: dark and light mode (auto by system + manual toggle).
- **Accessibility**: aria labels, visible focus states, screen-reader friendly status changes.
- **Performance**: lazy-load routes, compress images, small first load.
- **Privacy**: ask permission before using GPS, with clear Lao text explaining why.
  Location and medical data are sensitive: never log them to the console or analytics.
- **Abuse prevention (UI side)**: cancel countdown, confirm for "Other", and handle
  rate-limit errors from the API with a clear Lao message.
- **Priority**: life-threatening incidents (fire, medical, crime) are visually and
  logically ahead of others.

## 9. SUGGESTED FOLDER STRUCTURE

```
src/
  app/            # router, providers, layouts
  features/
    citizen/      # home, report, tracker, firstaid, profile, nearby
    control/      # queue, map, incident-detail, units, stats, audit
  components/     # shared UI (Button, SOSButton, StatusBadge, ConnectionIndicator...)
  services/       # api.ts, realtime.ts, mock/
  stores/         # zustand stores
  types/          # shared TypeScript types
  i18n/           # lo.json, en.json
  assets/
public/           # manifest, icons, offline.html
API_CONTRACT.md
README.md
```

## 10. BUILD ORDER (run and verify each step before moving on)

1. Design tokens (colors, spacing, typography) and layouts
2. Citizen Home + Report flow (SOS -> countdown -> sent)
3. Live status tracker + RealtimeClient + mock layer
4. Dispatch queue + live map
5. Incident detail + units management
6. First-aid (offline), nearby services, profile, SMS fallback
7. Statistics + audit log
8. PWA (manifest shortcuts, service worker, offline), dark mode polish, accessibility pass

## 11. DELIVERABLES

- Complete runnable project with clean structure.
- `README.md` with setup and run steps.
- `API_CONTRACT.md` with endpoints, request/response shapes, and event payloads.
- Realistic Lao seed data.

## 12. DEFINITION OF DONE (acceptance checklist)

- [ ] SOS can be sent in one tap with a 5s cancel window, no login required
- [ ] Works at 360px width; all touch targets >= 56px
- [ ] Citizen home loads under 150 KB JS
- [ ] Connection indicator on every screen; stale data is clearly marked
- [ ] App is installable (PWA) and the SOS shortcut works
- [ ] Offline: banner, SMS fallback, retry queue, offline first-aid guide
- [ ] Dispatch dashboard updates live without refresh; critical alert sound works
- [ ] Silent mode, Data saver, Training mode, fallback location picker implemented
- [ ] Switching `VITE_USE_MOCK` requires no UI code changes
- [ ] Lao is the default language and all text renders correctly
