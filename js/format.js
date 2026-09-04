/* ==========================================================================
   format.js — turning API values into words a reader understands.

   Two rules this file enforces, both of them decisions the back end already
   made and the interface must not contradict:

   1. Times are stored in UTC and shown in Africa/Lagos. Never print a raw
      timestamp; a reader should never see the letter T or a Z.

   2. Overdue is computed from the clock, never stored. There is no
      "isOverdue" field in the API, and there must not be one here. Ask
      dueState() every time you render.
   ========================================================================== */

/* "12 Sep 2026, 4:30 pm" — Lagos time, whatever the reader's own clock says. */
function formatDateTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: HOL.TZ, day: "numeric", month: "short", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  }).replace(",", "").replace(/(\d{4}) /, "$1, ");
}

/* "12 Sep 2026" — for a date with no meaningful time of day. */
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

/* How many copies of a title may actually leave the building.

   The last available copy is always retained for in-library use, so a title
   with 3 free copies lends 2, and a title with 1 free copy lends none. This
   is the rule most likely to be got wrong: "available" and "borrowable" are
   different numbers and the interface must show the difference. */
function borrowableCount(available) {
  return Math.max(0, available - 1);
}

/* The sentence a reader sees under a title in search results. */
function availabilityLine(stock, available) {
  const canBorrow = borrowableCount(available);
  if (canBorrow > 0) {
    return { tone: "ok",
      head: canBorrow === 1 ? "1 copy can be borrowed today." : canBorrow + " copies can be borrowed today.",
      body: stock + " total copies; " + available + " available in the building. "
          + "One available copy is retained for in-library use." };
  }
  if (available === 1) {
    return { tone: "warn",
      head: "Available to read in the library, not available to borrow.",
      body: stock + " total copies; 1 copy is on the shelf. "
          + "Because it is the final available copy, borrowing is closed." };
  }
  return { tone: "bad",
    head: "All copies are currently out or reserved.",
    body: stock + " total copies; none available in the building. "
        + "Join the reservation queue to be notified when a copy returns." };
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
