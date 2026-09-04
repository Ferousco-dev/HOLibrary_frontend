# Developer B — a member's own records

**Branch:** `feature/b-member-records`

Three screens that show people what the library is holding on their behalf.
All three need a signed-in session, so build sign-in awareness first: if
`api.isSignedIn()` is false, show a short panel inviting them to sign in
rather than an empty table or a wall of errors.

Start with My loans. Reservations is its close cousin and will go quickly
afterwards.

---

## 1. `pages/05-my-loans.html` — books you have out

Reference picture: `docs/reference/05-my-loans.png` (layout only)

`GET /me/loans` returns the loans that are still open.

### Each loan must show

- The **title**, linked to `03-book.html?id=...`
- The **accession number of the copy actually held**. This matters: a member
  can hold two copies of one book, and without the accession number the two
  rows are indistinguishable. Use the `.accession` class.
- The **due date**, through `formatDateTime()`. Never print a raw timestamp;
  a reader should never see the letter T or a Z.
- **How long is left**, from `dueState(dueAt)` in `js/format.js`. It returns
  `{ tone, text }` so the colour and the words can never disagree:

  ```js
  const state = dueState(loan.due_at);      // { tone: "bad", text: "3 days overdue" }
  ```

  There is no overdue field in the API and there must not be one here. Overdue
  is worked out from the clock every time the page is drawn, which is why it
  can never be stale.

### Renewing

Each loan gets a Renew button. It will not always be allowed, and the refusal
is the interesting case: a book somebody else has reserved cannot be renewed,
and neither can one already overdue. Show the server's reason next to the
button rather than a dead control with no explanation.

### The empty state

Somebody with no books out is the normal case, not an error. Say something
useful: that they have nothing out, with a link to the catalogue.

### Endpoints

```
GET  /me/loans        open loans
GET  /me/history      loans already returned
POST /loans/{id}/renew
```

Put the returned history in a second section below, collapsed or clearly
secondary. It answers "what did I have last term?" and should not compete with
what is due this week.

---

## 2. `pages/06-reservations.html` — what you are waiting for

Reference picture: `docs/reference/06-reservations.png`

`GET /me/reservations`.

### Each reservation must show

- The title, linked
- **Your position in the queue**, in words: "You are 2nd in the queue", not a
  bare number in a box. If a copy is ready for collection, that is the most
  important thing on the row and should read as such.
- When the reservation was placed, through `formatDate()`
- A **Cancel** button calling `DELETE /reservations/{id}`

Cancelling is destructive and cannot be undone, so confirm first. A plain
`confirm()` is acceptable here; do not build a modal.

After cancelling, remove the row and call `announce("Reservation cancelled.")`
so a screen reader is told something happened.

### Endpoints

```
GET    /me/reservations
DELETE /reservations/{id}
```

---

## 3. `pages/11-dashboard.html` — the library at a glance

Reference picture: `docs/reference/11-dashboard.png`

For administrators. `GET /admin/dashboard` returns the counts;
`GET /admin/audit` returns recent activity.

### The numbers

Use the `.stats` and `.stat` classes. Titles, copies, members, open loans,
overdue items. Big number, small label underneath.

Do not invent a statistic the endpoint does not return. If you want one that
is missing, open an issue; do not compute a half-truth on the client.

### Recent activity

A table from `GET /admin/audit`: when, who, what. Times through
`formatDateTime()`. `<caption>` and `scope="col"` as always.

The audit log is a record of who did what, so it must be readable as English.
"Ada Okafor issued HOL/2019/00412 to SWE/2025/001" is an audit trail;
`loan.create` is not.

### If the reader is not an administrator

The server answers 403. Do not show an empty dashboard: say clearly that this
page is for library administrators, and link somewhere useful.

### Endpoints

```
GET /admin/dashboard
GET /admin/audit?limit=20
```

---

## When you are finished

- `python3 scripts/check.py` passes
- Every date on screen is Lagos time and reads like a date a person would write
- Nothing shows an overdue state that came from a stored field
- Lighthouse accessibility is 95 or better on each screen
- Your `DEC-` and `DEF-` entries are in `.ilana/`
- Desktop and phone screenshots are in your pull request
