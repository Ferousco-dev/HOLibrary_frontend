# Ìlànà — the project record

Every decision and every defect on this project is written down. Not as
ceremony: the report we submit is largely assembled from these files, and at
the defence you will be asked why something is the way it is. An answer you
wrote at the time is worth more than one you reconstruct in the exam hall.

You write two kinds of entry.

## DEC — a decision

Whenever you chose between two reasonable options, record it. Not every line of
code is a decision; a decision is a fork where a sensible person could have
gone the other way.

```markdown
### DEC-A01 — Copies shown as a table, not as cards

**Chose:** a `<table>` with one row per physical copy.
**Rejected:** a grid of cards, one per copy.
**Why:** the copies of a title differ only by accession number, status and
shelf. That is tabular data, and a screen reader can navigate a table by
column. Cards would have made three short facts occupy the width of the page
and told assistive technology nothing about how they relate.
```

Number them with your letter: `DEC-A01`, `DEC-B01`, `DEC-C01`. That way three
people can add entries at once without colliding on a shared counter.

"I did not make any decisions" is never true. It means you have not noticed
them yet. Two or three per screen is normal.

## DEF — a defect

Anything that was wrong and is now fixed, **including something you found in
your own work before anybody else saw it**. Those are the most valuable entries
in the file, because they are the ones nobody else could have written.

```markdown
### DEF-B03 — Due dates were an hour early

**What was wrong:** loan due dates rendered an hour behind what the API
returned.
**How it was found:** comparing a due date on screen with the same loan in
Swagger.
**Cause:** I formatted the date with `toLocaleString()` and no `timeZone`, so
it used the laptop's clock. The laptop was on UTC.
**Fix:** used `formatDateTime()` from `js/format.js`, which passes
`Africa/Lagos`.
**Severity:** Medium. Every date on the page was wrong, and wrong quietly.
```

Severity is Low, Medium, High or Critical. A wrong due date is not cosmetic:
somebody could be fined over it.

## Where they go

- Decisions: `.ilana/decisions.md`
- Defects: `.ilana/defects.md`

Add to the top of the file, newest first. Your pull request asks which entries
you wrote; that is not a formality, it is checked.

## What good looks like

The back end recorded 29 defects. No single technique found more than half of
them: twelve came from adversarial review, seven from a checklist, three from
the first run against a real database, two from measuring queries, two from a
concurrency test, one from a unit test, one from a parse that had never been
run, and one from somebody simply looking at a dashboard.

That is the finding worth repeating: the bug you will ship is the one your
chosen technique cannot see. Write down how you found each one, not only what
it was.
