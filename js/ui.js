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

/* Every /me screen needs the same signed-out state, and each was writing its
   own. what completes the sentence "Sign in to ...". */
function signedOutState(what) {
  return messageState("Sign in to " + what + ".", null, [
    el("p", { className: "hint" }, el("a", { href: "04-signin.html" }, "Sign in")),
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

  if (needsSignIn && !api.isSignedIn()) {
    replace(into, signedOutState(needsSignIn));
    announce("Sign in to " + needsSignIn + ".");
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
    // expired too. Say so plainly instead of showing a bare "unauthorised".
    if (err.status === 401 && needsSignIn) {
      replace(into, signedOutState(needsSignIn));
      announce("Your session has ended. Sign in again.");
      return;
    }
    replace(into, messageState(err.message, "bad"));
    announce(err.message);
  }
}
