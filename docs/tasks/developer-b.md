# Developer B — a member's own records

**Branch:** `feature/b-member-records`

Four screens that show people what the library is holding on their behalf.
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

---

## 4. `pages/12-saved.html` — titles you have saved

No reference picture for this one: the feature is newer than the mockups. Build
it in the shape of My loans, which is the closest relative.

A bookmark is an interest in a **title**, never a claim on a copy. It reserves
nothing, joins no queue and changes no availability figure. Saying so somewhere
on the page is worth doing, because a reader who thinks saving holds a copy for
them will be disappointed at the shelf.

### The list

`GET /me/bookmarks` returns the saved titles newest first, with pagination.
Each entry is `{ book, saved_at }`, so the whole book is there and you do not
need a second request per row.

Show, for each: the cover through `coverElement(book, "list")`, the title
linked to its page, the authors, the call number, and the availability
sentence from `availabilityLine(book)`. Then when it was saved, through
`formatDate()`.

Copy the pager from `index.html`. Do not write a second one.

### The control

A save/remove button, on this page and also on the book detail page (agree the
shared piece with Developer A rather than each writing your own).

- `POST /bookmarks` with `{ "book_id": "..." }` to save. It answers **204**,
  not 201, because saving a title twice is allowed and changes nothing.
- `DELETE /bookmarks/{bookID}` to remove. Removing one that was never saved
  also succeeds.

Because both are safe to repeat, you can update the button immediately and
correct it only if the request fails. That is the right behaviour here: the
reader gets an instant response, and the failure case is rare and recoverable.

Announce the change with `announce("Saved to your list.")`, and make the button
carry `aria-pressed` so a screen reader hears the state rather than only seeing
a filled icon.

### Signed out

The control is visible but disabled, with a line saying you must sign in to
save titles. Do not hide it: a reader should be able to see the feature exists.

### The empty state

Somebody with nothing saved is the normal case. Say what saving is for, and
link to the catalogue.

### Endpoints

```
GET    /me/bookmarks?page=&per_page=
POST   /bookmarks              body { "book_id": "<uuid>" }
DELETE /bookmarks/{bookID}
```

### One thing worth knowing

There is no staff view of anybody's saved titles, and no endpoint that returns
another member's list. That is deliberate, and the privacy page says so. If you
find yourself wanting an endpoint that takes a user id, that is the feature
working as intended.

---

## When you are finished

- `python3 scripts/check.py` passes
- Every date on screen is Lagos time and reads like a date a person would write
- Nothing shows an overdue state that came from a stored field
- Lighthouse accessibility is 95 or better on each screen
- Your `DEC-` and `DEF-` entries are in `.ilana/`
- Desktop and phone screenshots are in your pull request
