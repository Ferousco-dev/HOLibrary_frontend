# Developer C — the circulation desk

**Branch:** `feature/c-circulation-desk`

Three screens used by library staff, standing at a counter, with somebody
waiting. That changes the design: information over decoration, the primary
action reachable without hunting, and nothing that needs a second look.

These are also the screens where the library's rules become visible. When the
server refuses something, the refusal is the most useful thing on the page and
must explain itself.

Start with Issue a copy. Receive a return is its mirror image.

---

## 1. `pages/08-desk-issue.html` — lending a copy

Reference picture: `docs/reference/08-desk-issue.png` (layout only)

Two fields, in this order, because it is the order things happen at a desk:

1. **Accession number** of the copy in the librarian's hand
2. **Matric or staff number** of the member in front of them

Then one button: Issue.

Put focus in the accession field on load. A librarian doing this fifty times an
hour should never have to click first.

### Show the outcome in full

**On success:** who now has what, and when it is due. Give the member's name,
the title, the accession number and the due date through `formatDateTime()`.
The member is standing there, so this is what both of them read.

**On refusal:** this is the important one. The server refuses for real reasons,
and each needs to be legible to a librarian *and* to the member reading over
the counter:

- The member already has as many books as their category allows
- The copy is not available: already on loan, reserved for someone else,
  lost or withdrawn
- The member's account is suspended
- The copy is the last one on the shelf and so cannot leave the building

Show the server's message. Do not translate it into your own words and do not
reduce it to "Error".

### Keep the rules on screen

The loan entitlements sit in `HOL.TERMS` in `js/config.js`. Show them as a
small reference table beside the form: Undergraduate 2/14 days, Postgraduate
4/21, Staff 6/28. They are there so a refusal makes sense at a glance.

They are a copy of the server's rules for display only. The server decides.

### Endpoints

```
POST /loans          body { "accession_number": "...", "login": "..." }
GET  /books/lookup?accession=...     to show the title before issuing
```

---

## 2. `pages/09-desk-return.html` — taking a copy back

Reference picture: `docs/reference/09-desk-return.png`

One field: the accession number. One button: Receive.

### The result must answer four questions

1. **Which loan closed** — the title, and who had it
2. **Was it late**, and by how long
3. **Is there a fine**, and how much
4. **Is somebody waiting** — if a reservation exists for this title, say so
   prominently. The copy must go behind the desk, not back on the shelf, and
   the librarian has about two seconds to notice that.

The fourth is the one worth designing carefully. It changes what the librarian
physically does next.

### Endpoints

```
POST /loans/{id}/return
GET  /loans?accession=...     to find the open loan for a copy
```

---

## 3. `pages/10-members.html` — the people

Reference picture: `docs/reference/10-members.png`

Two halves: a list, and a form to register somebody new.

### The list

`GET /members` with pagination. Copy the pager from `index.html`; do not write
a second one.

Columns: name, matric or staff number, category, status, and how many books
they currently have out. Real `<table>`, `<caption>`, `scope="col"`.

A search field filtering by name or identifier, using `?q=`.

Each row links to that member's detail, and carries a control to suspend or
restore them: `PATCH /members/{id}/status`. Suspending is significant, so
confirm it and say what it does, which is that the person can no longer sign in
or borrow.

### Registering a member

Registration happens **at the desk**, after the applicant has shown an identity
card. There is no public sign-up anywhere in this system and you must not add
one.

Fields: full name, matric or staff number, email, faculty, department, level,
category.

Two rules the server enforces and the form should not contradict:

- **Category is required for members and forbidden for staff.** A member
  without a category has no defined borrowing entitlement. Show and hide the
  field accordingly.
- **A librarian may create members only.** Creating another librarian or an
  administrator requires an administrator. If the signed-in user is a
  librarian, do not offer roles they cannot create; if the server refuses
  anyway, show its message.

On success the server issues a temporary password. Display it once, clearly,
with a line saying the member must change it at first sign-in and that it will
not be shown again.

### Endpoints

```
GET   /members?q=&page=&per_page=
POST  /members
GET   /members/{id}
PATCH /members/{id}/status    body { "status": "active" | "suspended" }
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
- Every refusal on screen explains itself in the server's own words
- The issue form takes focus on load and can be driven entirely by keyboard
- Lighthouse accessibility is 95 or better on each screen
- Your `DEC-` and `DEF-` entries are in `.ilana/`
- Desktop and phone screenshots are in your pull request
