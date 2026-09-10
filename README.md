# Hezekiah Oluwasanmi Library — Frontend

The public-facing web application for the **Hezekiah Oluwasanmi Library (HOL)** at Obafemi Awolowo University, Ile-Ife, Nigeria. Members can search the physical catalogue, check copy availability, manage loans and reservations, and receive push notifications when a reserved book becomes available. Library staff can issue and receive copies at the desk. Administrators have access to a live dashboard.

**Live site:** [library.appmd.dev](https://library.appmd.dev)  
**API docs:** [api.library.appmd.dev/docs](https://api.library.appmd.dev/docs)

---

## Table of contents

1. [Project overview](#project-overview)
2. [Technology choices](#technology-choices)
3. [Pages and features](#pages-and-features)
4. [User roles](#user-roles)
5. [Project structure](#project-structure)
6. [JavaScript modules](#javascript-modules)
7. [CSS architecture](#css-architecture)
8. [API integration](#api-integration)
9. [Push notifications](#push-notifications)
10. [Accessibility](#accessibility)
11. [Security](#security)
12. [CI pipeline](#ci-pipeline)
13. [Contributing](#contributing)
14. [Contributors](#contributors)
15. [Ìlànà — project record](#ìlànà--project-record)

---

## Project overview

HOL Frontend is a multi-screen web application that sits on top of a deployed REST API. It lets anyone browse the library's physical collection and, once signed in, manage their borrowing activity. Library staff get a desk-facing workflow for issuing and returning copies. All of this is built without a JavaScript framework: the assessment criteria for SEN 106 cover HTML structure, semantic elements, forms, tables, accessibility, and DOM scripting — a framework would hide exactly what is being examined.

The application is a Progressive Web App (PWA). It ships a `manifest.json` and a Firebase Cloud Messaging service worker, so a reader who installs it on Android or a desktop gets push notifications for due dates and reservation updates alongside the normal email.

---

## Technology choices

| Concern | Choice | Why |
|---|---|---|
| Language | Vanilla HTML, CSS, JS | No build step; directly assessed by SEN 106 criteria |
| Hosting | Vercel | Clean URLs, automatic HTTPS, instant preview deploys per PR |
| Push | Firebase Cloud Messaging | Integrates with the existing API `/me/devices` endpoint |
| Book covers | Open Library Covers API | Free, ISBN-addressed, no key needed |
| Timezone | `Africa/Lagos` (WAT, UTC+1) | The API sends UTC; every displayed time is in Lagos time |

See [`DEC-001`](.ilana/decisions.md) in the Ìlànà record for the full reasoning behind the no-framework decision.

---

## Pages and features

### Public (no sign-in required)

| File | URL | Description |
|---|---|---|
| `index.html` | `/` | **Catalogue search** — the landing page and the reference implementation for the project. Search by title, author, or ISBN. Results show copy count, availability status, and a borrow-before-you-walk-to-the-shelf indicator. |
| `pages/browse.html` | `/pages/browse` | **Browse the catalogue** — subject and library-wing starting points for physical books. |
| `pages/subjects.html` | `/pages/subjects` | **Browse by subject** — broad shelf-classification entry points. |
| `pages/new-arrivals.html` | `/pages/new-arrivals` | **New arrivals** — newest catalogue records, with covers and availability. |
| `pages/03-book.html` | `/pages/03-book` | **Book detail** — full record for a single title: cover image (via Open Library), call number, all physical copies with their individual statuses, and a Reserve button. |
| `pages/04-signin.html` | `/pages/04-signin` | **Sign in** — accepts a matric or staff number and password. Redirects back to the page the reader came from after a successful sign-in. |
| `pages/404.html` | `/404` | **Not found** — returned by Vercel for any path that does not exist. |
| `pages/accessibility.html` | `/pages/accessibility` | Accessibility statement for the site. |
| `pages/borrowing.html` | `/pages/borrowing` | Borrowing policy and loan entitlements by member category. |
| `pages/privacy.html` | `/pages/privacy` | Privacy policy. |
| `pages/wings.html` | `/pages/wings` | Map and description of the library's reading wings and subject floors. |

### Member (sign-in required)

| File | URL | Description |
|---|---|---|
| `pages/05-my-loans.html` | `/pages/05-my-loans` | **Books you have out** — lists active loans with due dates, overdue warnings, and renewal options. Offers push notifications after the first load. |
| `pages/06-reservations.html` | `/pages/06-reservations` | **Reservations** — current queue positions and option to cancel a reservation. |
| `pages/07-change-password.html` | `/pages/07-change-password` | **Change password** — required on first sign-in when `must_change_password` is true. |
| `pages/12-saved-titles.html` | `/pages/12-saved-titles` | **Saved titles** — bookmarked catalogue entries the reader has saved. |
| `pages/saved-searches.html` | `/pages/saved-searches` | **Saved searches** — signed-in members can save and delete catalogue URLs in this browser until account-level API storage is available. |

### Library staff (librarian or admin role)

| File | URL | Description |
|---|---|---|
| `pages/08-desk-issue.html` | `/pages/08-desk-issue` | **Issue a copy** — desk workflow for lending a physical copy to a member. |
| `pages/09-desk-return.html` | `/pages/09-desk-return` | **Receive a return** — desk workflow for checking a copy back in. |
| `pages/10-members.html` | `/pages/10-members` | **Members** — search and list all library members, with links to individual records. |
| `pages/13-member-record.html` | `/pages/13-member-record` | **Member record** — full loan and account history for one member; staff can suspend or reactivate. |
| `pages/17-inventory.html` | `/pages/17-inventory` | **Inventory and cataloguing** — look up book details, create title records, register copies, maintain copy status, and archive a title. |

### Administration (admin role only)

| File | URL | Description |
|---|---|---|
| `pages/11-dashboard.html` | `/pages/11-dashboard` | **Dashboard** — live statistics: active loans, overdue items, reservations queue, member counts. |
| `pages/20-books-out.html` | `/pages/20-books-out` | **Books out** — staff register of all currently open loans, with member, title, accession number and due date. |

---

## User roles

The navigation menu is built dynamically in `js/nav.js` based on the signed-in user's role. The server enforces every route independently; what the menu shows is a courtesy, not a guard.

| Role | Loan limit | Loan period | Pages visible |
|---|---|---|---|
| Public (not signed in) | — | — | Catalogue, Book detail, Sign in, policy pages |
| Undergraduate | 2 books | 14 days | + My loans, Reservations, Saved titles, Change password |
| Postgraduate | 4 books | 21 days | same as Undergraduate |
| Staff | 6 books | 28 days | same as Undergraduate |
| Librarian | — | — | all member pages + Desk issue, Desk return, Members, Member record |
| Admin | — | — | all librarian pages + Dashboard |

---

## Project structure

```
holibrary-frontend/
├── index.html                  # Catalogue search (landing page)
├── manifest.json               # PWA manifest
├── firebase-messaging-sw.js    # FCM service worker for push
├── robots.txt
├── sitemap.xml
├── vercel.json                 # Hosting config and security headers
│
├── pages/                      # Every screen except the landing page
│   ├── _template.html          # Starting point for a new screen
│   ├── 03-book.html
│   ├── 04-signin.html
│   ├── 05-my-loans.html
│   ├── 06-reservations.html
│   ├── 07-change-password.html
│   ├── 08-desk-issue.html
│   ├── 09-desk-return.html
│   ├── 10-members.html
│   ├── 11-dashboard.html
│   ├── 12-saved-titles.html
│   ├── saved-searches.html
│   ├── browse.html
│   ├── subjects.html
│   ├── new-arrivals.html
│   ├── 13-member-record.html
│   ├── 404.html
│   ├── accessibility.html
│   ├── borrowing.html
│   ├── privacy.html
│   └── wings.html
│
├── js/                         # Shared JavaScript modules
│   ├── config.js               # API base URL, Firebase config, loan terms
│   ├── api.js                  # All HTTP requests, token management
│   ├── nav.js                  # Navigation menu (role-aware)
│   ├── ui.js                   # Shared UI: loaders, error states, dialogs
│   ├── format.js               # Date formatting, availability wording, covers
│   ├── validate.js             # Client-side form validation
│   └── push.js                 # Push notification opt-in flow
│   └── searches.js             # Browser-local saved-search storage until API support exists
│
├── css/
│   ├── tokens.css              # Design tokens (colours, type, spacing)
│   ├── base.css                # Reset and element defaults
│   ├── layout.css              # Header, footer, shell, grid
│   └── components.css          # Buttons, cards, tables, forms, loader
│
├── assets/
│   ├── oau-logo.png            # OAU crest (favicon, PWA icon)
│   ├── og-image.png            # Open Graph image (1200 × 630)
│   └── og-image-preview.png
│
├── docs/                       # Project documentation and task split
├── scripts/
│   └── check.py                # Local lint script (mirrors CI)
│
└── .ilana/                     # Decision and defect log
    ├── README.md               # How to write an entry
    ├── decisions.md            # DEC-nnn entries
    └── defects.md              # DEF-nnn entries
```

---

## JavaScript modules

All scripts are loaded in a fixed order on every page. No module bundler is used; the dependency chain is explicit in the HTML.

**Load order:** `config.js` → `api.js` → `format.js` → `validate.js` → `ui.js` → `push.js` → `nav.js` → (page script)

### `js/config.js`

The single source of truth for runtime configuration. Defines the global `HOL` object, which every other script reads.

- `HOL.API` — base URL for the REST API (`https://api.library.appmd.dev/api/v1`)
- `HOL.DOCS` — link to the interactive API documentation
- `HOL.TERMS` — loan entitlements by member category (for display only; the server decides)
- `HOL.FIREBASE` — public Firebase config for push notifications
- `HOL.VAPID_KEY` — public VAPID key for FCM
- `HOL.TZ` — timezone (`"Africa/Lagos"`) used by every date formatter

Do not hardcode a URL or a colour anywhere else in the project. If a value belongs here, it goes here.

### `js/api.js`

Every HTTP request to the back end goes through this module. Never call `fetch()` directly in a page script.

```js
api.get("/books?q=thermodynamics")
api.post("/reservations", { copy_id: 42 })
api.patch("/me/password", { current_password: "…", new_password: "…" })
api.del("/reservations/7")
api.upload("/me/photo", file, "photo")
api.login(login, password)
api.logout()
api.who()          // currently signed-in user object, or null
api.isSignedIn()
api.isStaff()      // librarian or admin
api.isAdmin()
```

Catalogue URLs preserve `q`, `class`, `subject`, `author`, `faculty`,
`department`, `yearFrom`, `yearTo`, `language`, `wing`, `availability`,
`borrowable`, `sort`, and `page`. The deployed API currently guarantees the
original `q`, `class`, `subject`, `available`, `page`, and `per_page` inputs;
the additional filters are sent when supported by the server and remain in
the URL for shareability.

There is currently no `/me/searches` or related-titles endpoint. Saved
searches therefore use browser-local storage for signed-in members and the
detail page derives related titles from supported catalogue searches. Neither
feature submits research items, downloads repository files, or adds digital
circulation.

**Token strategy**

- The access token is kept in memory (not `localStorage` or `sessionStorage`), so it dies when the tab closes.
- The refresh token is stored in `sessionStorage` under `hol.refresh`. It is rotated on every use by the server.
- On a 401 response the module transparently refreshes the token and retries the request exactly once. A second 401 clears the session.
- Concurrent requests that all hit 401 on the same page load share a single refresh attempt (a deduplication promise), preventing token rotation from racing with itself.

**Error shape**

Failed requests throw an `ApiError` with `.status`, `.code`, and `.message` taken from the server's own response body. Page scripts should display `err.message` directly — the API writes its refusals for a reader.

### `js/searches.js`

Stores signed-in members' saved catalogue URLs in browser-local storage until
the API provides an account-level saved-search resource. Notification controls
are intentionally absent until the API exposes availability subscriptions.

### `js/nav.js`

Builds and controls the navigation menu. The menu is rendered from JavaScript (not duplicated across thirteen HTML files), driven by the current session. The same dropdown is used at every viewport width.

Keyboard behaviour: Escape closes the menu and returns focus to the toggle button. Tab past the last item also closes the menu.

### `js/ui.js`

Shared helpers that every data-fetching screen uses.

- `el(tag, props, children)` — thin `createElement` wrapper
- `replace(container, ...nodes)` — safely replaces container contents (no `innerHTML`)
- `loadingState(label)` — an animated spinner with a screen-reader label
- `messageState(text, tone, extra)` — an empty/error/info panel
- `signedOutState(what)` — the standard "Sign in to …" panel with a link back
- `confirmAction({ title, body, confirm, tone })` — a native `<dialog>` confirmation prompt that traps focus and resolves a Promise
- `load(spec)` — the full data-loading cycle in one call:

```js
load({
  into: document.getElementById("content"),
  label: "Loading your loans",
  needsSignIn: "see the books you have out",
  fetch: () => api.get("/me/loans"),
  render: (result) => renderLoans(result.data),
  empty: "You have nothing out at the moment.",
});
```

### `js/format.js`

Converts raw API values into human-readable text.

- `formatDateTime(iso)` — `"12 Sep 2026, 4:30 pm"` in Lagos time
- `formatDate(iso)` — `"12 Sep 2026"` for date-only values
- `dueState(dueIso)` — returns `{ tone: "ok"|"warn"|"bad", text: "Due in 6 days" }`. Overdue is computed live; there is no `isOverdue` field in the API.
- `availabilityLine(book)` — builds the four-state availability sentence from `borrowable` and `shelf_copy_retained` (fields the server computes; the interface never re-derives library rules)
- `coverElement(book, size)` — builds a book cover `<div>` using the Open Library Covers API
- `ordinal(n)` — `"1st"`, `"2nd"`, `"3rd"`, `"11th"`, etc.
- `plural(n, one, many)` — `"1 copy"` / `"3 copies"`
- `escapeHtml(value)` — escapes a string for safe use in `innerHTML`

### `js/validate.js`

Client-side form validation. Uses the browser's constraint API for the actual checking and takes over only the reporting, so error messages are styled, persistent, and announced to screen readers.

- `validate.attach(form)` — validates fields on blur; re-checks on input once a field is marked invalid
- `validate.form(form)` — checks all fields, reports every problem at once, focuses the first bad one
- `validate.field(input)` — checks one field
- `validate.mustMatch(first, second)` — enforces that two fields contain the same value (e.g. password confirmation)
- `validate.report(input, message)` — shows or clears the error for one field, with `aria-invalid` and `aria-describedby`

### `js/push.js`

Firebase Cloud Messaging opt-in. Push is an enhancement — every notification the system sends also goes by email, so declining push loses nothing.

- `push.shouldOffer()` — true only if the reader is signed in, the browser supports push, and they have not already decided
- `push.enable()` — requests permission, registers the service worker, gets the FCM token, and posts it to `/me/devices`
- `push.disable(token)` — removes the device token from the server
- `offerPush(container)` — renders the opt-in offer inside a given container

The permission prompt is never shown on the catalogue. It appears after an action that makes the offer relevant (a loan being issued, the loans page on a due-soon item).

---

## CSS architecture

```
tokens.css → base.css → layout.css → components.css
```

All four stylesheets are loaded on every page. No scoping by page; all styles are global.

### `css/tokens.css`

CSS custom properties only. No selectors, no rules. Every colour, font size, spacing value, and border radius in the project is defined here and referenced everywhere else as `var(--token-name)`.

The CI script (`scripts/check.py`) fails the build if a raw hex colour or a raw pixel gap appears in any other stylesheet or HTML file.

Brand colours are sampled from the OAU crest:

| Token | Value | Use |
|---|---|---|
| `--indigo` | `#240C54` | Masthead, primary framing |
| `--indigo-dark` | `#17073A` | Utility bar, footer |
| `--gold` | `#E4B454` | Accent, used sparingly |
| `--blue` | `#1D4ED8` | Links and primary actions |
| `--ok` | `#1E7A46` | Available / success states |
| `--warn` | `#8A5A00` | Due-soon / caution states |
| `--bad` | `#A32020` | Overdue / error states |

### `css/base.css`

Browser reset, element defaults, typographic rhythm, link styles, and focus rings. Establishes the `--font-body` / `--font-head` split.

### `css/layout.css`

The sticky header, the footer, the `.shell` max-width wrapper, and the two-column content grid used on the catalogue and book pages.

### `css/components.css`

Reusable patterns referenced by every page:

- `.btn`, `.btn--primary`, `.btn--secondary`, `.btn--danger`
- `.field`, `.field__label`, `.field__error` (form fields)
- `.panel`, `.notice--ok`, `.notice--warn`, `.notice--bad`
- `.loading`, `.loader` (the animated book-opening spinner)
- `.cover`, `.cover--detail` (book cover with call-number fallback)
- `.mainnav`, `.mainnav__link`, `.mainnav__sep`, `.mainnav__label`
- `.confirm` (the native `<dialog>` confirmation modal)
- `.pushoffer` (push notification opt-in banner)
- `.table` (data tables used in loans, reservations, members)

---

## API integration

The live back end is already deployed. The frontend cannot change it.

- **Base URL:** `https://api.library.appmd.dev/api/v1`
- **Interactive docs:** `https://api.library.appmd.dev/docs`
- **OpenAPI spec:** `https://api.library.appmd.dev/openapi.yaml`

If the documentation and this project disagree, the documentation is right. Do not invent a field; if you need data no endpoint returns, open an issue.

The `api` module in `js/api.js` handles authentication transparently. Page scripts call `api.get()`, `api.post()`, etc., and never see token headers or refresh logic.

All successful responses are wrapped: `{ data: ..., meta: ... }`. Read `result.data` for records, `result.meta` for pagination.

---

## Push notifications

Push is opt-in and progressive. The capability check is strict: Safari on iOS only supports web push for sites added to the home screen, so `push.supported()` tests for `serviceWorker`, `PushManager`, and `Notification` together.

**Flow:**

1. Reader does something loan-related (opens the My Loans page, has a copy issued at the desk).
2. `offerPush(container)` is called. If `push.shouldOffer()` is true, a banner appears.
3. Reader clicks "Turn on reminders". The browser permission dialog fires.
4. On grant, the service worker is registered, an FCM token is obtained, and `api.post("/me/devices", { token, platform: "web" })` registers the device server-side.
5. Foreground messages (tab open and focused) are announced to the page's ARIA live region so screen readers hear them.

Declining stores `hol.push.dismissed` in `localStorage`. The offer never reappears.

---

## Accessibility

Accessibility is a first-class requirement on this project. The PR checklist enforces it on every merged screen. Key commitments:

- **Semantic HTML**: `<header>`, `<nav>`, `<main>`, `<footer>`, `<table>`, `<form>`, `<dialog>`, landmarks throughout.
- **Keyboard navigation**: every interactive element is reachable by Tab. The hamburger menu closes on Escape and restores focus to the toggle. The confirmation dialog traps focus inside itself.
- **Screen reader announcements**: every page has a `<p class="liveregion" aria-live="polite" role="status">` element. `announce(message)` in `api.js` writes to it so asynchronous results (data loaded, form submitted, action confirmed) are spoken.
- **Colour is never the only signal**: every status (ok/warn/bad) is conveyed by both colour and text.
- **`aria-invalid` and `aria-describedby`**: set by `validate.js` on every invalid field, so a screen reader reads the error message when the field receives focus.
- **`aria-current="page"`**: set on the active nav link by `nav.js`.
- **`alt` text**: meaningful on all informational images, `alt=""` on decorative ones (book covers, which sit beside the title heading that already names the book).
- **Lighthouse accessibility target**: 95 or above on every screen. Scores below 95 require an explanation in the PR.

---

## Security

### HTTP security headers (Vercel)

| Header | Value |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | geolocation, microphone, and camera blocked |
| `Content-Security-Policy` | `default-src 'self'`; images allowed from Open Library; connections only to the API and Firebase endpoints |

### Application security practices

- **No raw fetch**: all requests go through `api.js`, which sets `Authorization` headers and handles 401 refresh in one place.
- **No `innerHTML` with user data**: `textContent` is used everywhere. `escapeHtml()` in `format.js` exists for the rare case where HTML must be built by hand.
- **Open redirect prevention**: the `?next=` parameter on the sign-in page is validated to be a root-relative path before it is followed.
- **Session invalidation on sign-out**: `api.logout()` sends the refresh token to `/auth/logout` server-side so it is revoked, not just deleted from the browser.
- **Public Firebase config**: the Firebase values in `config.js` are intentionally public. Firebase access control is enforced by server-side security rules, not by hiding the client configuration. See the [Firebase docs on API keys](https://firebase.google.com/docs/projects/api-keys).

---

## CI pipeline

GitHub Actions runs on every pull request to `main` and on every direct push to `main` (the latter is blocked by a branch protection rule; CI is there as a backstop).

```yaml
jobs:
  html:
    steps:
      - House rules      # python3 scripts/check.py
      - Valid HTML       # npx html-validate "**/*.html"
```

**`scripts/check.py`** enforces the house rules that are too nuanced for a generic linter:

- No raw hex colour outside `css/tokens.css`
- No raw pixel gap outside `css/tokens.css`
- Every `<img>` has an `alt` attribute
- No direct `fetch(` call outside `js/api.js`

Run the same script locally before opening a PR:

```bash
python3 scripts/check.py
```

---

## Contributing

All contribution rules are in [`CONTRIBUTING.md`](CONTRIBUTING.md). Short version:

1. **Never push to `main`** — the branch is locked. Work happens on feature branches, merged via pull request.
2. **Branch names**: `feature/<screen>` or `fix/<what>` (e.g. `feature/05-my-loans`, `fix/hamburger-not-closing-on-escape`).
3. **Starting a new screen**: copy `pages/_template.html`, do not write a page from scratch.
4. **Pull request checklist**: must include screenshots at 1440 px and 375 px widths, a Lighthouse accessibility score, and Ìlànà entries.
5. **Commit messages**: explain *why*, not what. The diff shows what changed.

```bash
git checkout main
git pull
git checkout -b feature/05-my-loans
# ... work ...
git add -A
git commit -m "Show accession number on each loan card"
git push -u origin feature/05-my-loans
# then open a pull request on GitHub
```

---

## Contributors

- [Aliyah](https://github.com/aliyahoiza360-tech)

---

## Ìlànà — project record

Every design decision and every defect discovered during development is logged in `.ilana/`. These files are part of the academic submission and are reviewed at the defence.

- **Decisions** (`.ilana/decisions.md`): whenever two reasonable options existed, record which was chosen, which was rejected, and why. Prefix with your developer letter: `DEC-A01`, `DEC-B02`, etc.
- **Defects** (`.ilana/defects.md`): anything that was wrong and is now fixed, including things found in your own work before review. Include how it was found, the root cause, the fix, and a severity level (Low / Medium / High / Critical).

See `.ilana/README.md` for the full format and examples.

---

*Hezekiah Oluwasanmi Library, Obafemi Awolowo University, Ile-Ife, Osun State, Nigeria.*
