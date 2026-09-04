/* ==========================================================================
   firebase-messaging-sw.js — the service worker that receives push.

   It MUST live at the site root. A service worker can only control pages at
   or below its own path, and this one has to control the whole site.

   It runs with no page, no DOM and no access to the rest of our JavaScript,
   which is why the Firebase config is repeated here rather than imported.
   Keep the two copies in step; js/push.js checks that they agree.
   ========================================================================== */

importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey:            "AIzaSyDWg_nCRHuMTSLzht-FMVqmGxUbd1JnNhk",
  authDomain:        "holibrary.firebaseapp.com",
  projectId:         "holibrary",
  storageBucket:     "holibrary.firebasestorage.app",
  messagingSenderId: "769142524932",
  appId:             "1:769142524932:web:1276786a86de303905b951",
});

const messaging = firebase.messaging();

/* A message that arrives while the site is closed or in another tab.

   The server sends a data-only payload on purpose. A payload carrying a
   "notification" block is displayed by the browser automatically, which sounds
   convenient until the same message is shown twice: once by the browser and
   once by this handler. Data-only means we decide, once. */
messaging.onBackgroundMessage(function (payload) {
  const data = payload.data || {};

  const title = data.title || "Hezekiah Oluwasanmi Library";
  const options = {
    body: data.body || "",
    icon: "/assets/oau-logo.png",
    badge: "/assets/oau-logo.png",
    // Messages about the same loan replace one another rather than stacking
    // up. Three reminders about one book is three chances to be ignored.
    tag: data.loan_id || data.template || "holibrary",
    renotify: false,
    data: { url: data.url || "/pages/05-my-loans.html" },
  };

  return self.registration.showNotification(title, options);
});

/* Tapping a notification should land the reader on the page it is about.

   If the site is already open somewhere, focus that tab instead of opening a
   second one: nobody wants four copies of their library open. */
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (windows) {
      for (const client of windows) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(target);
          return client.focus();
        }
      }
      return self.clients.openWindow(target);
    })
  );
});
