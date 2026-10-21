# LCANA.org — Lowcountry Area of Narcotics Anonymous

Website for the **Lowcountry Area of Narcotics Anonymous** (South Carolina — Charleston /
Hilton Head / Bluffton area). Meeting schedule, helpline, recovery resources, events, and
service information.

- **Live site:** https://lcana.org
- **Helpline:** 855-613-2762
- **Contact:** info@lcana.org

> This folder is a **local mirror** of the public site plus proposed changes. It is not the
> canonical source repository. The live site is deployed on Cloudflare; the files here were
> downloaded from the public URLs for analysis and to prepare the BMLT integration below.

---

## Tech stack

Hand-authored static site — **no framework, no build step, no CMS**.

| Concern        | Choice |
|----------------|--------|
| Markup/styles  | Single `index.html` with inline CSS |
| Scripting      | Vanilla JavaScript (no libraries) |
| Hosting        | Cloudflare Pages (static assets) |
| Dynamic bits   | Cloudflare Pages **Functions** under `/api/*` |
| Donations      | [Zeffy](https://www.zeffy.com/en-US/donation-form/low-country-area-donations) |
| Meeting data   | **BMLT** root server (see below) |

Cache-busting on scripts is done by hand via `?v=YYYYMMDD` query strings.

---

## Layout (as mirrored here)

```
.
├── site/                      # static assets served at the site root
│   ├── index.html             # the whole homepage (markup + inline CSS + JS)
│   ├── trifold.js             # builds a printable landscape trifold meeting list (PDF)
│   ├── events.js              # calendar + event posters, polls /api/activities
│   ├── submissions.js         # meeting/activity update requests (mailto / download)
│   ├── site-settings.js       # contact email + donation URL
│   ├── activities-chair.html  # password-gated flyer approval (Activities Chair)
│   ├── activities-chair.js
│   ├── flyer-upload.html      # public event-flyer upload form
│   ├── flyer-upload.js
│   ├── activities.css
│   ├── lcana-hero.png
│   ├── lcana-logo.png
│   └── robots.txt
├── functions/
│   └── api/
│       └── meetings.js        # NEW — edge-cached proxy for the BMLT feed (see patch 2)
├── lcana-bmlt.patch           # patch 1 — meeting schedule from BMLT
├── lcana-api-meetings.patch   # patch 2 — add /api/meetings Function + point frontend at it
└── README.md
```

> **Path note:** the real repo may not use a `site/` prefix. In the patches, `site/index.html`
> means "the homepage, wherever it lives," and `functions/api/meetings.js` must sit alongside the
> existing `activities` function so Cloudflare serves it at `/api/meetings`.

---

## Backend endpoints (`/api/*`)

Cloudflare Pages Functions back the dynamic features:

| Endpoint | Purpose |
|----------|---------|
| `GET /api/activities` | Published upcoming events/flyers (JSON) |
| `GET /api/activities/{id}/poster` | Flyer image for an event |
| `POST /api/activities/submit` | Public flyer upload (multipart) |
| `POST /api/activities/login` · `/logout` · `/admin` | Password-gated Activities Chair approval |
| `GET /api/meetings` | **NEW** — edge-cached BMLT meeting feed (added by patch 2) |

---

## Meeting schedule via BMLT

Meetings come from the **Basic Meeting List Tool (BMLT)** root server for the Southeastern
Zonal Forum, scoped to the LCANA service bodies (172, 110, 111):

```
https://bmlt.sezf.org/main_server/client_interface/json/
  ?switcher=GetSearchResults
  &get_used_formats=1
  &services[]=172&services[]=110&services[]=111
```

`get_used_formats=1` makes BMLT return `{ meetings: [...], formats: [...] }`, so **both the
schedule and the format legend are data-driven** — nothing about meetings is hardcoded in the
page. New meetings or format codes added in BMLT appear automatically.

### How the front end uses it

`index.html` maps each BMLT record into the row shape the renderer expects:

```
[ day, time (12h), name, location, formats, notes, virtual_meeting_link ]
```

- Weekday from `weekday_tinyint` (1=Sun … 7=Sat).
- `start_time` → 12-hour display.
- In-person rows build a full address (used for the Google Maps "Directions" link);
  virtual rows show `Online / {city}`.
- Format codes (`O`, `D`, `WC`, `VM`, …) are labeled from the feed's `formats` block.
- The real `virtual_meeting_link` drives the "Join Online Meeting" button.
- `trifold.js` reads the same `meetings` / `legend` globals, so the printable schedule stays in sync.

### Two integration options (shipped as patches)

1. **`lcana-bmlt.patch`** — front end fetches BMLT directly from the browser. BMLT allows CORS
   (`Access-Control-Allow-Origin: *`), so no backend change is required.
2. **`lcana-api-meetings.patch`** *(recommended, apply after patch 1)* — adds
   `functions/api/meetings.js`, a tiny Pages Function that fetches BMLT server-side and caches it
   at Cloudflare's edge (`cf.cacheTtl` + `Cache-Control`), then points the front end at
   `/api/meetings`. This removes the browser's dependency on `bmlt.sezf.org` at page load, speeds
   up first paint, and degrades gracefully (502 + friendly message) if BMLT is unreachable.

### Applying the patches

From the site root (paths are relative to it):

```bash
git apply lcana-bmlt.patch
git apply lcana-api-meetings.patch
# or, without git:
patch -p1 < lcana-bmlt.patch
patch -p1 < lcana-api-meetings.patch
```

Both have been verified to apply cleanly against the current live `index.html` and reproduce the
intended result exactly.

---

## Editing meetings

Once BMLT is wired in, **do not edit meetings in `index.html`.** Update them in the BMLT root
server (via the Area's BMLT admin / your GSR) and the site reflects the change on next load
(within the edge cache TTL — up to ~1 hour with patch 2).

---

## License / attribution

Site content © Lowcountry Area of Narcotics Anonymous. NA trademarks belong to Narcotics
Anonymous World Services. See https://na.org and the Carolina Region at https://www.crna.org.
