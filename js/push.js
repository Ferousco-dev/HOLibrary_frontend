/* ==========================================================================
   push.js , asking for permission, and registering the device.

   Push is an enhancement and never a requirement. Every notification this
   system sends also goes by email, so a reader who refuses permission, uses a
   browser that cannot do push, or is on an iPhone that has not added the site
   to its home screen loses nothing.

   Nothing here runs on page load. Browsers rightly treat an unprompted
   permission request as hostile, and Chrome now blocks sites that ask
   repeatedly. We ask once, after the reader has done something that makes the
   offer make sense.
   ========================================================================== */

const push = (function () {

  const CONFIGURED = HOL.FIREBASE
    && !Object.values(HOL.FIREBASE).some(v => String(v).startsWith("FILL_IN"));

  /* Whether this browser can receive push at all.

     The iPhone case is the one that catches people out: Safari supports web
     push only for a site added to the home screen. In a normal Safari tab
     serviceWorker exists and Notification does not, so the check below is
     honest without needing to sniff the user agent. */
  function supported() {
    return "serviceWorker" in navigator
        && "PushManager" in window
        && "Notification" in window;
  }

  function state() {
    if (!CONFIGURED) return "unconfigured";
    if (!supported()) return "unsupported";
    return Notification.permission; // "default" | "granted" | "denied"
  }

  /* Should we offer? Only if we can deliver, the reader is signed in, they
     have not already decided, and they have not dismissed the offer before.

     A refusal in the browser is permanent from our side: once permission is
     "denied" we can never ask again, and a site that pesters about it is worse
     than one that stays quiet. */
  function shouldOffer() {
    return state() === "default"
        && api.isSignedIn()
        && localStorage.getItem("hol.push.dismissed") !== "yes";
  }

  function dismiss() {
    try { localStorage.setItem("hol.push.dismissed", "yes"); } catch (e) { /* private mode */ }
  }

  /* Ask, then register the token with the library.

     Returns true only if a token actually reached the server. Permission
     granted but no token is a real state: it happens when the service worker
     fails to register, and it must not be reported as success. */
  async function enable() {
    if (!CONFIGURED) {
      console.warn("Push is not configured: fill in HOL.FIREBASE in js/config.js "
                 + "and the matching values in firebase-messaging-sw.js.");
      return false;
    }
    if (!supported()) return false;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      dismiss();
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      firebase.initializeApp(HOL.FIREBASE);
      const messaging = firebase.messaging();

      const token = await messaging.getToken({
        vapidKey: HOL.VAPID_KEY,
        serviceWorkerRegistration: registration,
      });
      if (!token) return false;

      // The server stores one row per device. Registering the same token
      // twice is harmless: the endpoint is idempotent, exactly like saving a
      // title, because a browser may hand us the same token again at any time.
      await api.post("/me/devices", { token: token, platform: "web" });

      // A message that arrives while this tab is open and focused. The
      // service worker does not see these, so without this handler a
      // notification is simply lost while somebody is looking at the site.
      messaging.onMessage(function (payload) {
        const d = payload.data || {};
        announce(d.title ? d.title + ". " + (d.body || "") : "You have a new notification.");
      });

      return true;
    } catch (err) {
      console.warn("Push could not be enabled:", err.message);
      return false;
    }
  }

  /* Turn it off from this device. The token is removed on the server, so the
     library stops sending to a browser that no longer wants it. */
  async function disable(token) {
    try {
      // The token goes in the body, not the query string. Push tokens are
      // long-lived identifiers for a device, and a query string ends up in
      // server logs and browser history in a way a body does not.
      await api.del("/me/devices", { token: token });
    } catch (e) { /* already gone, which is the state we wanted */ }
    dismiss();
  }

  return { state, supported, shouldOffer, enable, disable, dismiss, configured: () => CONFIGURED };
})();

/* Draws the offer, if it is worth drawing.

   Call it from a screen where notifications obviously relate to what just
   happened: after a loan is issued, or on the loans page when something is
   due soon. Do not call it from the catalogue: a visitor who has not borrowed
   anything has nothing to be notified about, and asking then is how a site
   trains people to click Block.

     offerPush(document.getElementById("live").parentNode);
*/
function offerPush(container) {
  if (!container || !push.shouldOffer()) return;

  const box = document.createElement("div");
  box.className = "pushoffer";

  const text = document.createElement("p");
  text.className = "pushoffer__text";
  const head = document.createElement("b");
  head.textContent = "Be told before a book is due";
  const body = document.createElement("span");
  body.textContent = "We will send a reminder to this device. We already email you; "
                   + "this is only if you would rather have it sooner.";
  text.append(head, body);

  const actions = document.createElement("p");
  actions.className = "pushoffer__actions";

  const yes = document.createElement("button");
  yes.className = "btn btn--primary";
  yes.type = "button";
  yes.textContent = "Turn on reminders";
  yes.addEventListener("click", async function () {
    yes.disabled = true;
    yes.textContent = "Asking…";
    const ok = await push.enable();
    box.remove();
    announce(ok ? "Reminders are on for this device."
                : "Reminders were not turned on. You will still get emails.");
  });

  const no = document.createElement("button");
  no.className = "btn btn--secondary";
  no.type = "button";
  no.textContent = "No thanks";
  no.addEventListener("click", function () {
    push.dismiss();
    box.remove();
    announce("We will not ask again. Emails continue as before.");
  });

  actions.append(yes, no);
  box.append(text, actions);
  container.prepend(box);
}
