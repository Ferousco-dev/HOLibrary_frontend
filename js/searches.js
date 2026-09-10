/* Saved-search storage stays local until the API exposes an account endpoint.
   The search itself remains a normal URL, so it can still be shared anywhere. */
function savedSearchKey() {
  const user = api.who() || {};
  const id = user.id || user.ID || user.login || user.email;
  return id ? "hol.saved-searches." + id : null;
}

function readSavedSearches() {
  const key = savedSearchKey();
  if (!key) return [];
  try { return JSON.parse(localStorage.getItem(key) || "[]"); }
  catch (error) { return []; }
}

function writeSavedSearches(searches) {
  const key = savedSearchKey();
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(searches));
}

function savedSearchUrl(search) {
  const url = new URL("../index.html", window.location.href);
  Object.keys(search.params || {}).forEach(function (key) {
    if (search.params[key]) url.searchParams.set(key, search.params[key]);
  });
  return url.pathname + url.search;
}

function saveCurrentSearch(label, url) {
  if (!savedSearchKey()) return null;
  const searches = readSavedSearches();
  const existing = searches.find(function (search) { return search.url === url; });
  if (existing) return existing;
  const search = { id: String(Date.now()), label: label || "Catalogue search", url: url, created: new Date().toISOString() };
  writeSavedSearches([search].concat(searches));
  return search;
}

function removeSavedSearch(id) {
  writeSavedSearches(readSavedSearches().filter(function (search) { return search.id !== id; }));
}
