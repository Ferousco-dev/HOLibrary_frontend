/* ==========================================================================
   api.js — every conversation with the back end goes through this file.

   Why one file: so that the token handling, the error shape and the refresh
   logic are written once and correctly, instead of eleven times with eleven
   different bugs. Call api.get("/books?q=..."), never fetch() directly.

   Full endpoint reference, live and callable:
       https://api.library.appmd.dev/docs
   ========================================================================== */

const api = (function () {

  /* --- token storage ---------------------------------------------------
     The access token is short-lived and kept in memory only, so it dies with
     the tab. The refresh token is opaque, stored hashed on the server, and
     rotated every time it is used.

     A note you will be asked about at the defence: sessionStorage is
     readable by any script running on this page. It is not a vault. It is
     acceptable here because the token expires quickly, is revocable server
     side, and grants nothing the signed-in user cannot already do. The real
     defence is that the SERVER re-checks every request. */

  let accessToken = null;

  function setSession(tokens) {
    accessToken = tokens.access_token || null;
    if (tokens.refresh_token) sessionStorage.setItem("hol.refresh", tokens.refresh_token);
  }
  function clearSession() {
    accessToken = null;
    sessionStorage.removeItem("hol.refresh");
  }
  function refreshToken() { return sessionStorage.getItem("hol.refresh"); }

  /* --- errors ----------------------------------------------------------
     The API answers a failure with a JSON body carrying a message written
     for a reader. Show that message. Do not replace it with "Error 409" and
     do not invent your own wording: the server knows why it refused. */

  class ApiError extends Error {
    constructor(status, body) {
      super((body && (body.message || body.error)) || "The request could not be completed.");
      this.status = status;
      this.body = body;
    }
  }

  async function request(method, path, payload, retrying) {
    const headers = { "Accept": "application/json" };
    if (payload !== undefined) headers["Content-Type"] = "application/json";
    if (accessToken) headers["Authorization"] = "Bearer " + accessToken;

    let response;
    try {
      response = await fetch(HOL.API + path, {
        method,
        headers,
        body: payload === undefined ? undefined : JSON.stringify(payload),
      });
    } catch (networkFailure) {
      // fetch() rejects only when the request never completed: no connection,
      // DNS failure, CORS refusal. An HTTP 500 is a resolved promise.
      throw new ApiError(0, { message: "Could not reach the library server. Check your connection." });
    }

    // 401 once means the access token expired. Refresh and replay exactly
    // one time; a second 401 means the session is genuinely finished.
    if (response.status === 401 && !retrying && refreshToken()) {
      const renewed = await renew();
      if (renewed) return request(method, path, payload, true);
    }

    if (response.status === 204) return null;

    const text = await response.text();
    let body = null;
    if (text) { try { body = JSON.parse(text); } catch (e) { body = { message: text }; } }

    if (!response.ok) throw new ApiError(response.status, body);
    return body;
  }

  async function renew() {
    try {
      const r = await fetch(HOL.API + "/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken() }),
      });
      if (!r.ok) { clearSession(); return false; }
      setSession(await r.json());
      return true;
    } catch (e) { clearSession(); return false; }
  }

  return {
    ApiError,
    get:  (path)          => request("GET", path),
    post: (path, payload) => request("POST", path, payload),
    patch:(path, payload) => request("PATCH", path, payload),
    // DELETE carries a body on /me/devices, which names the device being
    // removed. Unusual for the verb, but it is what the contract says:
    // https://api.library.appmd.dev/docs
    del:  (path, payload) => request("DELETE", path, payload),

    async login(identifier, password) {
      const tokens = await request("POST", "/auth/login", { identifier, password });
      setSession(tokens);
      return tokens;
    },
    logout() { clearSession(); },
    isSignedIn() { return Boolean(accessToken || refreshToken()); },
  };
})();

/* Announce a message in a page's live region, so a screen reader hears the
   result of an action it cannot see. Every page has
   <p class="liveregion" id="live" aria-live="polite" role="status"></p> */
function announce(message) {
  const region = document.getElementById("live");
  if (region) region.textContent = message;
}
