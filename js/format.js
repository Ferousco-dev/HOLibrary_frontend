/* ==========================================================================
   format.js , turning API values into words a reader understands.

   Two rules this file enforces, both of them decisions the back end already
   made and the interface must not contradict:

   1. Times are stored in UTC and shown in Africa/Lagos. Never print a raw
      timestamp; a reader should never see the letter T or a Z.

   2. Overdue is computed from the clock, never stored. There is no
      "isOverdue" field in the API, and there must not be one here. Ask
      dueState() every time you render.
   ========================================================================== */

/* "12 Sep 2026, 4:30 pm" , Lagos time, whatever the reader's own clock says. */
function formatDateTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: HOL.TZ, day: "numeric", month: "short", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  }).replace(",", "").replace(/(\d{4}) /, "$1, ");
}

/* "12 Sep 2026" , for a date with no meaningful time of day. */
function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    timeZone: HOL.TZ, day: "numeric", month: "short", year: "numeric",
  });
}

/* Describes a due date relative to now. Returns the words AND the status
   class, so colour and text can never disagree with each other.

     { tone: "ok" | "warn" | "bad", text: "Due in 6 days" } */
function dueState(dueIso) {
  const ms = new Date(dueIso) - new Date();
  const days = Math.ceil(ms / 86400000);

  if (days < 0) {
    const n = Math.abs(days);
    return { tone: "bad", text: n === 1 ? "1 day overdue" : n + " days overdue" };
  }
  if (days === 0) return { tone: "warn", text: "Due today" };
  if (days <= 3)  return { tone: "warn", text: "Due in " + days + (days === 1 ? " day" : " days") };
  return { tone: "ok", text: "Due in " + days + " days" };
}

/* "1 copy" but "2 copies". Printing "1 total copies" is the kind of thing a
   reader notices immediately and quietly stops trusting the rest of. */
function plural(n, one, many) {
  return n + " " + (n === 1 ? one : many);
}

/* The sentence a reader sees under a title.

   Four states, and telling them apart is the whole job. "Not available" would
   cover three different situations that call for three different actions, so
   it is never said.

   Every figure comes from the server, which sends `borrowable` and
   `shelf_copy_retained` already worked out. Recomputing either here would give
   the interface its own opinion about the library's rules, and the first time
   the policy changed the page would be confidently wrong.

   The retention rule, stated exactly: from TWO circulating copies upward the
   library keeps one on the shelf. A title with a single circulating copy lends
   it, because holding it back would mean nobody could ever read it. */
function availabilityLine(book) {
  const a = book.Availability || {};
  const stock     = a.total_copies || 0;
  const onShelf   = a.available || 0;
  const onLoan    = a.on_loan || 0;
  const reference = a.not_for_loan || 0;
  const canBorrow = book.borrowable || 0;
  const heldBack  = book.shelf_copy_retained === true;

  const holds = "The library holds " + plural(stock, "copy", "copies") + ".";

  if (canBorrow > 0) {
    return {
      tone: "ok",
      head: "You can borrow this today.",
      body: holds + " " + plural(onShelf, "copy is", "copies are") + " on the shelf"
          + (heldBack ? ", and one of those stays here for reading in the library." : "."),
    };
  }

  // On the shelf, but it is the last one, so it stays. People misread this
  // most often, so the sentence explains itself rather than merely refusing.
  if (heldBack && onShelf > 0) {
    return {
      tone: "warn",
      head: "You can read this here, but not take it home.",
      body: holds + " Only " + plural(onShelf, "copy is", "copies are") + " on the shelf, "
          + "and the last one always stays in the library so that it is never out of reach.",
    };
  }

  // Every copy is reference only. It is not out; it never leaves. Saying "out
  // on loan" here would send somebody away to wait for a return that will
  // never happen.
  if (reference > 0 && reference === stock) {
    return {
      tone: "warn",
      head: "Reference only. Read it in the library.",
      body: holds + " " + (stock === 1 ? "It is" : "They are") + " kept for consultation "
          + "in the building and " + (stock === 1 ? "does" : "do") + " not go out on loan.",
    };
  }

  return {
    tone: "bad",
    head: onLoan === 1 ? "The only copy is out on loan." : "Every copy is out on loan.",
    body: holds + " Nothing is on the shelf right now. Sign in to join the queue "
        + "and we will tell you as soon as a copy comes back.",
  };
}

/* Escapes text before it goes into innerHTML.

   A book title can contain < or &, and a member's name comes from a form.
   Concatenating either straight into HTML is how a cross-site scripting hole
   is made. Prefer textContent; use this only when you must build markup. */
function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/* Builds the cover for a book.

   Covers come from Open Library, addressed by the ISBN we already store. We
   hold no image ourselves; the reader's browser fetches it directly.

   Three details that each cost a debugging session:

   - "?default=false" makes Open Library answer 404 for a title it has no
     cover for. Without it the service returns a grey placeholder image that
     loads successfully, so a missing cover cannot be told from a real one.

   - The <img> is placed in the document immediately, not built detached and
     inserted on load. A detached image with loading="lazy" never enters a
     viewport, so it never loads at all.

   - Only about 40% of our titles have a cover, so absent is the normal case,
     not an error. The call number sits underneath and is revealed if the
     image fails, which means the row never changes height and a reader on a
     slow connection sees something useful straight away. */
function coverElement(book, size) {
  const box = document.createElement("div");
  box.className = "cover" + (size === "detail" ? " cover--detail" : "");

  const label = document.createElement("span");
  label.className = "cover__call";
  label.textContent = book.CallNumber || "No cover";
  box.appendChild(label);

  if (!book.ISBN13) return box;

  const img = document.createElement("img");
  img.loading = "lazy";
  // Decorative: the title is the heading immediately beside it, so giving the
  // cover its own alt text would make a screen reader announce the book
  // twice. WCAG 1.1.1 permits alt="" for exactly this case.
  img.alt = "";
  img.addEventListener("load", function () { box.classList.add("is-loaded"); });
  img.addEventListener("error", function () { img.remove(); });
  img.src = "https://covers.openlibrary.org/b/isbn/"
          + encodeURIComponent(book.ISBN13) + "-"
          + (size === "detail" ? "L" : "M") + ".jpg?default=false";
  box.appendChild(img);

  return box;
}
