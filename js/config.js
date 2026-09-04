/* ==========================================================================
   config.js — where the back end lives.
   Loaded first, before every other script. Do not hardcode a URL anywhere
   else in this project.
   ========================================================================== */

const HOL = {
  /* The live API. It is already built, tested and deployed. You are writing
     the interface for it. You cannot change it, and you do not need to. */
  API: "https://api.library.appmd.dev/api/v1",

  /* READ THIS BEFORE YOU WRITE A SINGLE FETCH.

     Every endpoint, every field it returns, and every error it can give you
     is documented here, and you can call the real API from the page:

         https://api.library.appmd.dev/docs

     The raw specification, if you prefer reading it as a file:

         https://api.library.appmd.dev/openapi.yaml

     If the documentation and this project disagree, the documentation is
     right. Do not invent a field. If you need data no endpoint returns,
     open an issue instead of faking it. */
  DOCS: "https://api.library.appmd.dev/docs",

  /* Loan entitlement, by member category. These are the server's rules; they
     are repeated here only so a screen can explain a refusal before the
     server is asked. The server decides, always. */
  TERMS: {
    undergraduate: { maxLoans: 2, days: 14, label: "Undergraduate" },
    postgraduate:  { maxLoans: 4, days: 21, label: "Postgraduate" },
    staff:         { maxLoans: 6, days: 28, label: "Staff" },
  },

  /* Times arrive from the API in UTC as RFC 3339 strings. Every time shown to
     a reader is Lagos time. Use formatDateTime() in format.js; never print a
     raw timestamp. */
  TZ: "Africa/Lagos",
};
