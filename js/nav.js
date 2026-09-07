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
  list.innerHTML = "";

  function link(item) {
    const node = document.createElement("a");
    node.className = "mainnav__link";
    node.href = item.href || to(item.file);
    node.textContent = item.text;
    if (item.file === here) node.setAttribute("aria-current", "page");
    return node;
  }

  function group(id, label, items) {
    const section = document.createElement("li");
    section.className = "mainnav__group";
    const button = document.createElement("button");
    const panel = document.createElement("ul");
    const open = items.some(function (item) { return item.file === here; });

    button.type = "button";
    button.className = "mainnav__group-toggle";
    button.textContent = label;
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-controls", id);
    panel.id = id;
    panel.className = "mainnav__group-list";
    panel.hidden = !open;

    items.forEach(function (item) {
      const itemNode = document.createElement("li");
      itemNode.appendChild(link(item));
      panel.appendChild(itemNode);
    });

    button.addEventListener("click", function () {
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      panel.hidden = expanded;
    });
    section.append(button, panel);
    return section;
  }

  const catalogue = [
    { file: "index.html", text: "Search the catalogue" },
    { file: "browse.html", text: "Browse the catalogue" },
    { file: "new-arrivals.html", text: "New arrivals" },
    { file: "subjects.html", text: "Browse by subject" },
    { file: "library-info.html", text: "Library information" },
  ];
  if (api.isStaff()) {
    catalogue.push({ file: "16-catalogue-tools.html", text: "Catalogue tools" });
  }
  list.appendChild(group("nav-catalogue", "Catalogue", catalogue));

  const account = signedIn
    ? [
      { file: "15-profile.html", text: "Profile" },
      { file: "05-my-loans.html", text: "Books you have out" },
      { file: "06-reservations.html", text: "Reservations" },
      { file: "12-saved-titles.html", text: "Saved titles" },
      { file: "saved-searches.html", text: "Saved searches" },
    ]
    : [{ file: "04-signin.html", text: "Sign in" }];
  list.appendChild(group("nav-account", "Your account", account));

  if (api.isStaff()) {
    list.appendChild(group("nav-staff", "Library staff", [
      { file: "08-desk-issue.html", text: "Issue a copy" },
      { file: "09-desk-return.html", text: "Receive a return" },
      { file: "20-books-out.html", text: "Books out" },
      { file: "14-overdue.html", text: "Overdue" },
      { file: "10-members.html", text: "Members" },
      { file: "17-inventory.html", text: "Inventory" },
    ]));
  }

  if (api.isAdmin()) {
    list.appendChild(group("nav-admin", "Administration", [
      { file: "11-dashboard.html", text: "Dashboard" },
      { file: "18-invitations.html", text: "Invitations" },
      { file: "19-user-roles.html", text: "Users and roles" },
    ]));
  }

  if (signedIn) {
    const signout = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mainnav__link mainnav__link--button";
    button.textContent = "Sign out";
    button.addEventListener("click", async function () {
      button.disabled = true;
      button.textContent = "Signing out…";
      await api.logout();
      location.href = to("index.html");
    });
    signout.appendChild(button);
    list.appendChild(signout);
  }

  const university = document.createElement("li");
  university.appendChild(link({ href: "https://oauife.edu.ng", text: "Obafemi Awolowo University" }));
  list.appendChild(university);
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
