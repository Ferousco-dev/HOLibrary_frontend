# Defects

Newest first. See `.ilana/README.md` for the format.

Prefix with your own letter: `DEF-A01`, `DEF-B01`, `DEF-C01`, `DEF-001` (lead).

Record what you found in your own work too. Those entries are the most valuable
in this file, because nobody else could have written them.

---

### DEF-005 — The 404 page painted its own heading grey

**What was wrong:** the large `404` rendered in muted grey instead of indigo.
**How it was found:** looking at the finished page.
**Cause:** `.errorpage p` is one element more specific than `.errorpage__code`,
so the muted body colour won. Both rules were mine, written a minute apart.
**Fix:** `.errorpage p.errorpage__code`, putting the two at equal weight.
**Severity:** Low. Cosmetic, but a good reminder that specificity is decided by
the selector and not by the order you happened to write things in.

### DEF-004 — Book covers never appeared

**What was wrong:** every result showed the call-number placeholder, although
the covers existed and loaded when requested directly.
**How it was found:** probing the image URLs from the console after the page
showed none.
**Cause:** the `<img>` was built detached with `loading="lazy"` and only
inserted once it loaded. A lazy image that is not in the document never enters
a viewport, so it never loads, so it is never inserted.
**Fix:** the image goes into the document immediately and is revealed on load.
**Severity:** Medium. The feature was entirely absent while appearing to work.

### DEF-003 — Text pressed against the edge of the screen on a phone

**What was wrong:** headings and paragraphs touched the left edge below 900px.
**How it was found:** measuring computed padding under device emulation.
**Cause:** `<main class="shell page">`. `.shell` set `padding: 0 24px` and
`.page` then set `padding: 8px 0 48px`, whose shorthand reset the horizontal
value to zero. On desktop the centring hid it.
**Fix:** `.page` uses `padding-top` and `padding-bottom` only.
**Severity:** Medium. Unreadable on the device most students would use.

### DEF-002 — The result count was printed twice

**What was wrong:** "52 titles found" appeared twice, one above the other.
**How it was found:** looking at the page.
**Cause:** the ARIA live region was visible. It exists so a screen reader is
told a search finished; a sighted reader already sees the results arrive.
**Fix:** the live region is visually hidden, which is what a live region should
always have been.
**Severity:** Low.

### DEF-001 — The interface read fields the API does not return

**What was wrong:** titles, ISBNs and call numbers were all blank.
**How it was found:** printing one real API response in the console.
**Cause:** the code assumed snake_case field names. The API returns PascalCase
for stored fields (`Title`, `ISBN13`, `CallNumber`) and snake_case for derived
ones (`wing`, `borrowable`). That is inconsistent, but it is what the
documentation says; the code had guessed instead of reading it.
**Severity:** High. Every result was empty.
**Fix:** matched the documented contract.
**Lesson:** read the response before writing the code that consumes it.
<https://api.library.appmd.dev/docs>
