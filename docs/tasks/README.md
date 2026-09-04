# The front end, split three ways

Ten screens remain. The catalogue search page (`index.html`) is finished and is
the **reference implementation**: when you are unsure how something should be
written, open it and copy the pattern.

| Who | Branch | Screens |
|---|---|---|
| Developer A | `feature/a-catalogue-and-access` | Book detail, Sign in, Change password |
| Developer B | `feature/b-member-records` | My loans, Reservations, Dashboard, Saved titles |
| Developer C | `feature/c-circulation-desk` | Issue a copy, Receive a return, Members |

A and C have three screens each and carry one hard screen apiece. B has four,
all of them medium, and the fourth is the newest feature: saved titles.

## Before you write anything

1. **Read your brief** in this folder. It lists every screen you own, what each
   one must show, and which endpoint gives you the data.
2. **Read `CONTRIBUTING.md`** at the root. It explains the branch, the pull
   request and why nobody pushes to `main`.
3. **Run the site**:
   ```bash
   python3 scripts/serve.py
   ```
   Then open <http://localhost:8899>. Do not double-click the HTML files: a page
   opened straight from your file system has an origin of `null`, and the API
   refuses it. You will get errors that have nothing to do with your code.
4. **Read the API documentation**: <https://api.library.appmd.dev/docs>
   You can call every endpoint from that page. If the documentation and a brief
   disagree, the documentation is right.

## The rules that matter most

- **Copy `pages/_template.html`.** Do not build a page from scratch, and do not
  edit the template itself. The header and footer must be identical on all
  eleven screens.
- **Never write `fetch()`.** Use `api.get`, `api.post`, `api.patch`, `api.del`
  from `js/api.js`. They handle the token, the refresh and the error shape.
- **Never write a colour or a pixel gap.** Use `var(--indigo)`, `var(--space-4)`
  and the rest from `css/tokens.css`.
- **Every form validates before it submits.** Use `validate.attach` and
  `validate.form` from `js/validate.js`. The course assesses client-side
  validation directly, and review checks it.
- **Never put data into `innerHTML`.** A book title can contain `<`, and a
  member's name comes from a form. Use `textContent`.
- **The server decides.** Hiding a button is tidiness, never security. Design
  for the case where an action is visible and refused, and show the server's
  own message when it is.

Run `python3 scripts/check.py` before you push. It is the same script CI runs,
so a green result there means a green tick on your pull request.

## The reference screenshots

`docs/reference/` holds a picture of each screen.

**Read them for layout and content only.** They show what belongs on the page
and roughly where. Their styling is out of date: they were drawn before the
design system existed and they use an older header, coloured card stripes and
their own spacing.

For how it should *look*, the authority is `index.html` and `css/`. Where the
screenshot and the design system disagree, the design system wins.
