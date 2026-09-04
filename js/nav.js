/* ==========================================================================
   nav.js , the menu button.

   The navigation is a dropdown at every width, so there is one menu to build,
   test and keep in step rather than a desktop row plus a mobile drawer.

   The rule this file exists to honour: the button must always announce its
   own state. `hidden` and `aria-expanded` are set together, in one function,
   so a screen reader can never be told "collapsed" while the menu is open.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.querySelector(".navtoggle");
  const list = document.getElementById("primary-nav");
  if (!toggle || !list) return;

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
