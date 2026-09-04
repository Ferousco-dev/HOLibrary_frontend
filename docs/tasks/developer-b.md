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

---

## Client-side validation (required on every form you build)

The course assesses **meaningful interactivity and client-side validation**.
Interactivity you get largely for free by following the patterns in
`index.html`. Validation you must write, and it is checked in review.

Use `js/validate.js`. Do not write your own.

```js
validate.attach(form);                 // check fields as the reader leaves them

form.addEventListener("submit", function (event) {
  event.preventDefault();
  if (!validate.form(form)) return;    // stop, errors are already shown
  // ... send the request
});
```

`validate.attach` checks a field when it loses focus, then re-checks on every
keystroke once it has been marked wrong, so the error clears the moment it is
fixed. `validate.form` checks everything, shows **every** problem at once, and
moves focus to the first bad field.

### On each input

| Attribute | Use it for |
|---|---|
| `required` | A field that must be filled |
| `type="email"` | An email address; the browser checks the shape |
| `type="password"` | Any password, so the value is masked |
| `minlength` | A minimum length, checked explicitly by our module |
| `data-error` | Your own wording, which beats anything generic |
| `data-hint` | The id of the hint paragraph, so both are announced |

```html
<div class="field">
  <label for="email">Email address</label>
  <input class="input" type="email" id="email" name="email" required
         data-hint="email-hint"
         data-error="Enter the email address on the member's ID card.">
  <p class="hint" id="email-hint">Used for due date reminders.</p>
</div>
```

### Two values that must match

The browser has no attribute for this, so the module provides one:

```js
if (!validate.mustMatch(newPassword, confirmPassword,
    "The two passwords do not match.")) return;
```

### What validation is and is not

**It is a courtesy, not a control.** It saves the reader a round trip to be
told something the browser already knew. Anybody can open the developer tools
and delete an attribute, so the server checks everything again regardless.

That means: **never validate a library rule here.** Checking that two fields
match is yours. Deciding whether a member may borrow is the server's, and
duplicating that decision would give the interface its own opinion that will
eventually disagree with the real one.

### What review will check

- Every form calls `validate.attach` and `validate.form`
- Every error appears **next to its field**, not at the top of the page
- Every message says **what to do**, not that something is wrong
- `aria-invalid` and `aria-describedby` are set (the module does this)
- Errors are readable without colour
- Focus moves to the first bad field on submit

## When you are finished

- `python3 scripts/check.py` passes
- Every date on screen is Lagos time and reads like a date a person would write
- Nothing shows an overdue state that came from a stored field
- Lighthouse accessibility is 95 or better on each screen
- Your `DEC-` and `DEF-` entries are in `.ilana/`
- Desktop and phone screenshots are in your pull request
