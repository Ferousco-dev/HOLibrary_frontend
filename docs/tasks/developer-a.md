# Developer A — the catalogue and getting in

**Branch:** `feature/a-catalogue-and-access`

Three screens: the page a reader lands on after a search, and the two screens
that let them into their account.

Start with the book page. It is the hardest of the three and everything else
you build will make more sense afterwards.

---

## 1. `pages/03-book.html` — one title in detail

Reference picture: `docs/reference/03-book.png` (layout only)

A reader arrives here from a search result, so the URL carries the title's id:

```
pages/03-book.html?id=b03ba2f3-75c6-4d77-ba78-b388202b61d0
```

Read it with `new URLSearchParams(window.location.search).get("id")` and fetch
`GET /books/{id}`.

### What the page must show

**The title itself:** name, subtitle, authors, publisher, year, ISBN, call
number, and the wing. Use `coverElement(book, "detail")` from `js/format.js`
for the cover; it handles the 60% of titles that have none.

**The availability sentence**, using `availabilityLine(book)`. Do not write your
own wording, and do not work out the borrowable count yourself: the server
sends it as `borrowable`.

**A table of the physical copies.** This is the heart of the page and the reason
it exists. Each row is one object on a shelf:

| Accession number | Status | Location |
|---|---|---|
| `HOL/2019/00412` | On the shelf | North Wing, Level 2 |

- Use a real `<table>` with a `<caption>` and `scope="col"` on every `<th>`.
  This is tabular data, which is exactly what tables are for.
- Give the accession number the `.accession` class; it is a code, not prose.
- Status must be words, not just a colour: `Available`, `On loan`, `Reserved`,
  `Lost`, `Withdrawn`. Use `.status` with `--ok` / `--warn` / `--bad` / `--none`.

**A reserve action.** Sign-in state decides what it does:

- Signed out: the button is present but disabled, with a line beneath saying
  why and linking to sign in. Do not hide it; a reader should be able to see
  that reserving is possible.
- Signed in, copies available: reserving makes no sense, so say so.
- Signed in, all copies out: the button posts to `POST /reservations` with
  `{ "book_id": "..." }` and reports the queue position it gets back.

### Endpoints

```
GET  /books/{id}          the title, its copies and its availability
POST /reservations        body { "book_id": "<uuid>" }
```

### Things to get right

- **A book is a title; a copy is an object.** The page moves from one to the
  other, and the copies table is where that becomes visible. Nothing about a
  shelf belongs in the top section.
- A missing id, or an id that matches nothing, must show a clear message and a
  link back to the catalogue, not a blank page or a console error.
- Set the document `<title>` to the book's name once it loads.

---

## 2. `pages/04-signin.html` — sign in

Reference picture: `docs/reference/04-signin.png`

Deliberately narrow and plain. Use `.shell--narrow`.

### The form

Two fields and a button:

- **Matric or staff number** (`identifier`). Not an email: members are known by
  `SWE/2025/001`. Say so in the hint.
- **Password** (`password`), `type="password"`.

Both need a real `<label for>` matching the input's `id`. A placeholder is not
a label; it disappears the moment someone types.

Submit with:

```js
await api.login(identifier, password);
```

That stores the session for you. Do not touch `sessionStorage` yourself.

### After a successful sign-in

Read `must_change_password` from the response. If it is true, send them to
`07-change-password.html` and nowhere else: the server will refuse every other
route until the password is changed, so any other destination produces a
confusing error.

Otherwise send them to `05-my-loans.html`.

### When it fails

Show the message the server sent, in a `.notice--bad` above the form, and move
focus to it so a screen reader reads it. Do not invent your own wording and do
not print a status code at a person.

**There is no "Create account" link on this page.** Members are registered at
the desk after showing an ID card. Adding one would describe a library we do
not have.

### Endpoints

```
POST /auth/login             body { "identifier": "...", "password": "..." }
POST /auth/forgot-password   body { "identifier": "..." }
```

Add a "Forgotten your password?" link that reveals a small form posting to
`forgot-password`. Its reply is deliberately the same whether the account
exists or not, so that the page cannot be used to discover who is a member.
Your message must match that: "If that account exists, we have sent a reset
link to the address we hold for it."

---

## 3. `pages/07-change-password.html` — change your password

Reference picture: `docs/reference/07-change-password.png`

This screen blocks everything else, so it says so first, in a `.notice--warn`
at the top: a librarian issued a temporary password, and until it is replaced
no other page will work.

### The form

- Current password
- New password
- Confirm new password

Check the two new ones match **before** posting, and say which field is wrong.
Post to `POST /auth/change-password`.

Afterwards the session is deliberately void: changing a password ends every
session issued before it, including this one. So say that plainly, and send
them back to sign in with the new password rather than pretending they are
still signed in.

### Endpoint

```
POST /auth/change-password   body { "current_password": "...", "new_password": "..." }
```

---

## When you are finished

- `python3 scripts/check.py` passes
- All three screens tab through cleanly with a visible focus ring
- Lighthouse accessibility is 95 or better on each
- You have written your `DEC-` and `DEF-` entries in `.ilana/`
- Screenshots at desktop and phone width are in your pull request
