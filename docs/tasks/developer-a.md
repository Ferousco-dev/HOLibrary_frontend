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

- **Matric or staff number**, sent as `login`. Not an email: members are known
  by `SWE/2025/001`. Say so in the hint.
- **Password** (`password`), `type="password"`.

Both need a real `<label for>` matching the input's `id`. A placeholder is not
a label; it disappears the moment someone types.

Submit with:

```js
const session = await api.login(login, password);
```

The API wraps every successful response, so what comes back is
`{ data: { access_token, refresh_token, must_change_password, user } }`.
`api.login` unwraps it for you and returns the inner object.

That stores the session for you. Do not touch `sessionStorage` yourself.

### After a successful sign-in

Read `must_change_password` from the returned session. If it is true, send them to
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
POST /auth/login             body { "login": "...", "password": "..." }
POST /auth/forgot-password   body { "login": "..." }
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
- All three screens tab through cleanly with a visible focus ring
- Lighthouse accessibility is 95 or better on each
- You have written your `DEC-` and `DEF-` entries in `.ilana/`
- Screenshots at desktop and phone width are in your pull request
