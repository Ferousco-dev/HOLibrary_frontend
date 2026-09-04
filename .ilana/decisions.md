# Decisions

Newest first. See `.ilana/README.md` for the format.

Prefix with your own letter so three people can write at once:
`DEC-A01` (Developer A), `DEC-B01` (B), `DEC-C01` (C), `DEC-001` (lead).

---

### DEC-004 — Navigation behind one menu at every width

**Chose:** a single dropdown, open by a button, on every screen size.
**Rejected:** a row of links on desktop collapsing to a hamburger on mobile.
**Why:** two navigations is two things to build, test and keep in step, and the
first version of this project had already drifted: the mobile one did not exist
at all. One menu also keeps the header to a single quiet line, so the search
field is the loudest thing on the page, which is what almost every visitor came
for.

### DEC-003 — No colour named outside `css/tokens.css`, enforced in CI

**Chose:** every colour, size and gap is a custom property, and
`scripts/check.py` fails the build on a raw hex value anywhere else.
**Rejected:** a written convention.
**Why:** three people are building eleven screens. A convention that is only
written down is a convention that lasts until somebody is in a hurry. If nobody
is *able* to name a colour, no two screens can drift apart.

### DEC-002 — The interface never recomputes a library rule

**Chose:** availability wording is built from the server's `borrowable` and
`shelf_copy_retained` fields.
**Rejected:** working out the borrowable count in JavaScript from the total and
available counts.
**Why:** it would give the interface its own opinion about the library's rules.
The first time the retention policy changed, the server and the page would
disagree, and the page would be wrong in a way that looks authoritative.

### DEC-001 — Vanilla HTML, CSS and JavaScript, no framework

**Chose:** plain HTML, CSS and DOM JavaScript.
**Rejected:** React, Vue, or a build step of any kind.
**Why:** SEN 106 examines HTML structure, semantic elements, forms, tables,
accessibility and DOM scripting. A framework would hide precisely what is being
assessed. Eleven mostly-static screens do not need one, and three developers
new to the work should not be learning a build system at the same time as the
material.
