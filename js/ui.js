/* ==========================================================================
   ui.js , the parts every screen was writing out by hand.

   Before this file each page built its own loading spinner, its own error
   panel, its own empty state and its own try/catch around a fetch. Five
   copies of the same twenty lines, which is five places for them to drift
   apart, and they had already started to.

   Nothing here is clever. el() is a thin wrapper over createElement, and
   load() is the sequence every data screen follows:

       show a spinner -> ask the server -> draw the answer
                                        -> or say why there is none

   Use textContent everywhere, never innerHTML. A book title can contain a
   less-than sign and a member's name comes from a form.
   ========================================================================== */

/* el("p", { className: "hint" }, "some text")
   el("tr", {}, [cell, cell])

   props are set as DOM properties when the name exists on the element
   (className, href, type, disabled) and as attributes otherwise
   (aria-*, colspan, scope), which is the distinction that actually matters:
   setAttribute("className", ...) silently does nothing. */
function el(tag, props, children) {
  const node = document.createElement(tag);

  Object.entries(props || {}).forEach(function ([key, value]) {
    if (value === null || value === undefined || value === false) return;
    if (key === "onClick") { node.addEventListener("click", value); return; }
    if (key in node) { node[key] = value; return; }
    node.setAttribute(key, value === true ? "" : value);
  });

  []
    .concat(children === undefined ? [] : children)
    .filter(function (child) { return child !== null && child !== undefined && child !== false; })
    .forEach(function (child) {
      node.append(typeof child === "string" || typeof child === "number"
        ? document.createTextNode(String(child))
        : child);
    });

  return node;
}

/* Replace everything in a container. innerHTML = "" only clears, it never
   inserts, so there is no injection here. */
function replace(container, ...nodes) {
  container.innerHTML = "";
  nodes.filter(Boolean).forEach(function (n) { container.appendChild(n); });
}

/* The book-opening loader from components.css, with a label a screen reader
   can hear. Sighted readers get the animation; everyone else gets the word. */
function loadingState(label) {
  return el("div", { className: "loading" }, [
    el("div", { className: "loader", role: "status", "aria-label": label || "Loading" }),
    el("p", {}, (label || "Loading") + "…"),
  ]);
}

/* A panel that says something and nothing else: empty results, an error, a
   reason the reader cannot see this page. tone is ok, warn, bad or absent. */
function messageState(text, tone, extra) {
  return el("div", { className: "panel empty" + (tone ? " notice--" + tone : "") },
    [el("p", {}, text)].concat(extra || []));
}

/* The path to the sign-in screen, carrying where the reader is now so they are
   returned here once signed in rather than dumped on the catalogue.

   next is a root-relative path (location.pathname keeps the /pages/ prefix and
   the query string), which is the only shape 04-signin.html will accept: it
   rejects anything that could point at another host, because a sign-in page is
   exactly where an open redirect would be aimed. A page at the site root has no
   ../ to climb, so the prefix is chosen from where this script is running. */
function signInHref() {
  const inPages = location.pathname.indexOf("/pages/") !== -1;
  const base = inPages ? "04-signin.html" : "pages/04-signin.html";
  const here = location.pathname + location.search;
  return base + "?next=" + encodeURIComponent(here);
}

function redirectToSignIn(expired) {
  const target = signInHref();
  location.replace(target + (expired ? "&expired=1" : ""));
}

function accessDeniedState() {
  return messageState("You do not have permission to view this page.", "bad", [
    el("p", { className: "hint" }, el("a", { href: "../index.html" }, "Back to the catalogue")),
  ]);
}

function guardPage(spec) {
  if (!api.isSignedIn()) {
    redirectToSignIn(false);
    return false;
  }
  if (spec.requiredRole === "admin" && !api.isAdmin()) {
    replace(spec.into, accessDeniedState());
    announce("You do not have permission to view this page.");
    return false;
  }
  return true;
}

/* Every /me screen needs the same signed-out state, and each was writing its
   own. what completes the sentence "Sign in to ...". */
function signedOutState(what) {
  return messageState("Sign in to " + what + ".", null, [
    el("p", { className: "hint" }, el("a", { href: signInHref() }, "Sign in")),
  ]);
}

/* The whole cycle, in one call.

     load({
       into: document.getElementById("content"),
       label: "Loading your loans",
       needsSignIn: "see the books you have out",
       fetch: () => api.get("/me/loans"),
       render: (data) => someElement(data),
       empty: "You have nothing out at the moment.",
     })

   render returns a node, or an array of nodes, or null to mean "empty".
   An error becomes a panel carrying the server's own sentence rather than a
   generic one: the API writes better refusals than the interface can guess.
   The promise resolves either way, so a caller can await it in a test. */
async function load(spec) {
  const { into, fetch: ask, render, label, empty, needsSignIn } = spec;

  if (needsSignIn && !guardPage({ into: into, requiredRole: spec.requiredRole })) {
    return;
  }

  replace(into, loadingState(label));
  announce((label || "Loading") + "…");

  try {
    const result = await ask();
    const drawn = render(result);
    const nodes = [].concat(drawn === null || drawn === undefined ? [] : drawn);

    if (nodes.length === 0) {
      replace(into, messageState(empty || "There is nothing here yet."));
      announce(empty || "Nothing to show.");
      return;
    }
    replace(into, ...nodes);
    if (spec.announce) announce(spec.announce(result));
  } catch (err) {
    // 401 from a page that thought it was signed in: the refresh token has
    // expired too. Leave the protected page instead of showing its shell with
    // a small error panel inside it.
    if (err.status === 401 && needsSignIn) {
      redirectToSignIn(true);
      return;
    }
    replace(into, messageState(err.message, "bad"));
    announce(err.message);
  }
}

/* Ask before an action that cannot be taken back.

   Suspending a member and cancelling a reservation are both one click with no
   undo, so each pauses here first. A native <dialog> is used on purpose: the
   browser traps focus inside it, closes it on Escape, and returns focus to
   whatever opened it, all of which a hand-built overlay gets wrong first.

     const yes = await confirmAction({
       title: "Suspend this member?",
       body: "They will not be able to sign in or borrow until reactivated.",
       confirm: "Suspend",
       tone: "bad",          // colours the confirm button; omit for a plain one
     });
     if (!yes) return;

   The promise resolves true only if the reader chooses the confirming action,
   and false for Cancel, Escape or a click on the backdrop, so a caller can
   treat every other outcome as "do nothing". */
function confirmAction(spec) {
  return new Promise(function (resolve) {
    const dialog = el("dialog", { className: "confirm" }, [
      el("h2", { className: "confirm__title" }, spec.title),
      spec.body ? el("p", { className: "confirm__body" }, spec.body) : null,
      el("div", { className: "confirm__actions" }, [
        el("button", {
          type: "button",
          className: "btn btn--secondary",
          onClick: function () { close(false); },
        }, spec.cancel || "Keep it"),
        el("button", {
          type: "button",
          className: "btn " + (spec.tone === "bad" ? "btn--danger" : "btn--primary"),
          onClick: function () { close(true); },
        }, spec.confirm || "Confirm"),
      ]),
    ]);

    let settled = false;
    function close(answer) {
      if (settled) return;
      settled = true;
      resolve(answer);
      if (dialog.open) dialog.close();
      dialog.remove();
    }

    // A click on the backdrop lands on the dialog element itself rather than on
    // anything inside it. Treat that as "no", the safe default for an action
    // with no undo.
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) close(false);
    });
    // Escape fires the dialog's cancel event; resolve false so the promise is
    // never left hanging.
    dialog.addEventListener("cancel", function () { close(false); });

    document.body.appendChild(dialog);
    dialog.showModal();
    // The confirming action is the one that matters, but focus opens on Cancel
    // so a stray Enter keypress does not carry out the very thing being guarded.
    dialog.querySelector(".btn--secondary").focus();
  });
}
