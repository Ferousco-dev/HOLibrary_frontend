/* ==========================================================================
   nav.js , the menu button.

   The navigation is a dropdown at every width, so there is one menu to build,
   test and keep in step rather than a desktop row plus a mobile drawer.

   The rule this file exists to honour: the button must always announce its
   own state. `hidden` and `aria-expanded` are set together, in one function,
   so a screen reader can never be told "collapsed" while the menu is open.
   ========================================================================== */

/* ---- what the menu contains -------------------------------------------

   The header is copied into thirteen files, so a menu written in the markup
   is thirteen menus that have to be kept identical by hand. It is built here
   instead, once, from the session.

   This decides what is DRAWN and nothing else. A reader who edits
   sessionStorage to call themselves an administrator gets a longer menu and
   exactly the same refusals from the server, because every route is checked
   there. Hiding a link is tidiness: it keeps a member from walking into a
   page that will only turn them away. It is not the rule.

   With scripting off the static markup stays as it is, which shows a member
   staff links they cannot use. They are links to pages that refuse them, not
   a way in. */

function buildNav(list) {
  const inPages = location.pathname.indexOf("/pages/") !== -1;
  const here = location.pathname.split("/").pop() || "index.html";

  const to = function (file) {
    if (file === "index.html") return inPages ? "../index.html" : "index.html";
    return inPages ? file : "pages/" + file;
  };

  const signedIn = api.isSignedIn();
  const items = [];

  items.push({ file: "index.html", text: "Search the catalogue" });

  items.push({ label: "Your account" });
  if (signedIn) {
    items.push({ file: "05-my-loans.html", text: "Books you have out" });
    items.push({ file: "06-reservations.html", text: "Reservations" });
    items.push({ file: "12-saved-titles.html", text: "Saved titles" });
    items.push({ file: "07-change-password.html", text: "Change your password" });
  } else {
    items.push({ file: "04-signin.html", text: "Sign in" });
  }

  if (api.isStaff()) {
    items.push({ label: "Library staff" });
    items.push({ file: "08-desk-issue.html", text: "Issue a copy" });
    items.push({ file: "09-desk-return.html", text: "Receive a return" });
    items.push({ file: "10-members.html", text: "Members" });
    items.push({ file: "14-overdue.html", text: "Overdue books" });
  }

  if (api.isAdmin()) {
    items.push({ label: "Administration" });
    items.push({ file: "11-dashboard.html", text: "Dashboard" });
  }

  if (signedIn) {
    items.push({ label: null });   // a rule with no heading, before signing out
    items.push({ action: "signout", text: "Sign out" });
  }

  items.push({ label: null });
  items.push({ href: "https://oauife.edu.ng", text: "Obafemi Awolowo University" });

  list.innerHTML = "";

  items.forEach(function (item) {
    const li = document.createElement("li");

    if (item.label !== undefined) {
      // A separator, with or without a heading above the group it opens.
      const rule = document.createElement("li");
      rule.setAttribute("aria-hidden", "true");
      const bar = document.createElement("div");
      bar.className = "mainnav__sep";
      rule.appendChild(bar);
      list.appendChild(rule);

      if (item.label === null) return;
      li.className = "mainnav__label";
      li.textContent = item.label;
      list.appendChild(li);
      return;
    }

    if (item.action === "signout") {
      // A button, not a link: signing out changes something, and a link that
      // changes something is a link a browser may follow on its own.
      const button = document.createElement("button");
      button.type = "button";
      button.className = "mainnav__link mainnav__link--button";
      button.textContent = item.text;
      button.addEventListener("click", async function () {
        button.disabled = true;
        button.textContent = "Signing out…";
        await api.logout();
        location.href = to("index.html");
      });
      li.appendChild(button);
      list.appendChild(li);
      return;
    }

    const link = document.createElement("a");
    link.className = "mainnav__link";
    link.href = item.href || to(item.file);
    link.textContent = item.text;
    if (item.file === here) link.setAttribute("aria-current", "page");
    li.appendChild(link);
    list.appendChild(li);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.querySelector(".navtoggle");
  const list = document.getElementById("primary-nav");
  if (!toggle || !list) return;

  buildNav(list);

  function setOpen(open) {
    list.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
  }

  // Closed on load, whatever the markup says, so a missing `hidden` attribute
  // on one page cannot leave the menu hanging open.
  setOpen(false);

  toggle.addEventListener("click", function (event) {
    event.stopPropagation();
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  // Clicking anywhere else closes it, which is what every menu does and what
  // a reader tries first.
  //
  // pointerdown in the capture phase, not click in the bubble phase. Capture
  // runs before anything on the page can stop the event travelling, and
  // pointerdown fires as the finger or mouse goes down, so the menu is gone
  // before the click lands on whatever is underneath it.
  document.addEventListener("pointerdown", function (event) {
    if (list.hidden) return;
    if (toggle.contains(event.target) || list.contains(event.target)) return;
    setOpen(false);
  }, true);

  // Escape closes it and puts focus back on the button. Without the focus
  // move, a keyboard user is left pointing at a menu that is no longer there.
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !list.hidden) {
      setOpen(false);
      toggle.focus();
    }
  });

  // Tabbing past the last item closes the menu, so the reader continues into
  // the page instead of into invisible links.
  list.addEventListener("focusout", function (event) {
    if (!list.contains(event.relatedTarget) && event.relatedTarget !== toggle) setOpen(false);
  });
});
