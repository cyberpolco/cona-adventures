# CoNa Adventures — Next.js

A full-featured adventure travel site for DR Congo and Namibia expeditions, converted from a single HTML file into a clean Next.js project.

## Project Structure

```
cona-adventures/
├── pages/
│   ├── _app.js          # Global CSS + AppProvider wrapper
│   ├── _document.js     # Google Fonts + HTML meta
│   └── index.js         # SPA shell — mounts active page component
│
├── components/
│   ├── Nav.js           # Fixed top nav with language toggle + login
│   ├── Footer.js        # Site footer
│   ├── LogoSeal.js      # Reusable SVG logo mark
│   ├── AfricaMap.js     # D3 interactive Africa SVG map
│   ├── GuideRatings.js  # Star rating cards for tour guides
│   ├── LoginModal.js    # Role-based login / signup modal
│   ├── Toast.js         # Auto-dismissing toast notification
│   │
│   └── pages/
│       ├── HomePage.js        # Hero + map + experiences + ratings + country cards
│       ├── GalleryPage.js     # Photo gallery with upload
│       ├── ContactPage.js     # Congo & Namibia contact cards
│       ├── TripPlannerPage.js # 8-step trip planner wizard
│       ├── ItineraryPage.js   # Auto-generated day-by-day itinerary
│       ├── PaymentPage.js     # Full / deposit payment flow
│       ├── SuccessPage.js     # Booking confirmation + credentials
│       └── DashboardPage.js   # Ops dashboard with tabs
│
├── context/
│   └── AppContext.js    # Global state: lang, page routing, user, booking, toast
│
├── lib/
│   └── translations.js  # EN + FR string tables
│
└── styles/
    └── globals.css      # All design tokens + component styles
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Key Changes vs Original HTML

| Original HTML                                | Next.js equivalent                        |
|----------------------------------------------|-------------------------------------------|
| Global `onclick="showPage(...)"` attributes  | `useApp().showPage(...)` via context      |
| Inline `<style>` block (minified)            | `styles/globals.css` (readable, organised)|
| `data-t` attributes + `document.querySelectorAll` i18n | `useApp().t(key)` hook          |
| `innerHTML` injection for login modal views  | Separate React components per view        |
| D3 loaded via `<script>` CDN tag             | Dynamic `import('d3')` in `useEffect`     |
| `onclick="openLogin()"` in HTML              | `onClick={openLogin}` in JSX              |
| `class=""` attributes                        | `className=""` in JSX                     |
| `for` on `<label>`                           | `htmlFor` in JSX                          |
| `stroke-width` SVG attrs                     | `strokeWidth` camelCase in JSX            |
| Single 1147-line file                        | 18 focused files, each under 250 lines    |

## Features

- **EN/FR translation** — all UI strings via `lib/translations.js`
- **Interactive Africa map** — D3 + world-atlas TopoJSON, highlights Congo & Namibia
- **8-step trip planner** — destination → experiences → travelers → dates → accommodation → transport → services → traveler details
- **Auto itinerary generation** — day cards built from planner selections + price estimate
- **Full / deposit payment flow** — card form, payment method selection
- **Booking confirmation** — reference number, email toast, portal credentials
- **Ops dashboard** — widgets, bookings table (with search), staff roles, tour catalogue, user management
- **Gallery** — grid with emoji placeholders + file upload (client-side preview, pending review flow)
- **Role-based login modal** — Client, Guide, Driver, Partner, Ops, Super Admin
- **Toast notifications** — lightweight, auto-dismiss

## Dependencies

- `next` — framework
- `react` / `react-dom` — UI
- `d3` — Africa SVG map
- `topojson-client` — GeoJSON from TopoJSON for the map
