/* ==========================================================================
   nav.js — the hamburger menu.

   One behaviour, shared by all eleven pages: below 900px the primary
   navigation collapses behind a button.

   The accessibility rule this file exists to honour: the button must always
   announce its own state. `hidden` and `aria-expanded` are flipped together,
   so a screen reader user is never told "collapsed" while the menu is open.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.querySelector(".navtoggle");
  const list = document.getElementById("primary-nav");
  if (!toggle || !list) return;

  const mobile = window.matchMedia("(max-width: 900px)");

  // On a wide screen the list is always visible and the button is not shown,
  // so `hidden` must be cleared or the menu vanishes when the window grows.
  function sync() {
    if (mobile.matches) {
      list.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
    } else {
      list.hidden = false;
    }
  }

  toggle.addEventListener("click", function () {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    list.hidden = open;
  });

  // Esc closes the menu and returns focus to the button, so a keyboard user
  // is never left with focus inside a menu they just dismissed.
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      toggle.setAttribute("aria-expanded", "false");
      list.hidden = true;
      toggle.focus();
    }
  });

  mobile.addEventListener("change", sync);
  sync();
});
