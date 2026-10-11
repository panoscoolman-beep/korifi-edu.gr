/* «Το πρόγραμμά μου» — service worker μόνο για τη σελίδα του εργαλείου
   (scope: /ergaleia/programma-meletis.html, δεν αγγίζει το υπόλοιπο site).
   - Σελίδα: πρώτα το δίκτυο, ώστε κάθε αλλαγή να φτάνει αμέσως· χωρίς internet
     (ή αν το δίκτυο αργεί πάνω από 4″) ανοίγει η αποθηκευμένη έκδοση.
   - Γραμματοσειρές Google: από την cache, ανανεώνονται στο παρασκήνιο.
   Τα δεδομένα του μαθητή δεν περνούν από εδώ· μένουν στο localStorage της συσκευής.
   Όταν αλλάζει αυτό το αρχείο, ανέβασε το VERSION ώστε να καθαρίσει η παλιά cache. */
var VERSION = "programma-v1";
var PAGE = "/ergaleia/programma-meletis.html";
var PRECACHE = [PAGE, "/ergaleia/programma-meletis.webmanifest", "/ergaleia/programma-icon-192.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(VERSION).then(function (c) { return c.addAll(PRECACHE); }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k.indexOf("programma-") === 0 && k !== VERSION; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function fromCache(req) {
  return caches.match(req, { ignoreSearch: true }).then(function (r) { return r || caches.match(PAGE); });
}

function pageNetworkFirst(req) {
  return new Promise(function (resolve) {
    var done = false;
    var timer = setTimeout(function () {
      fromCache(req).then(function (r) { if (r && !done) { done = true; resolve(r); } });
    }, 4000);
    fetch(req).then(function (res) {
      if (res && res.ok) {
        var copy = res.clone();
        caches.open(VERSION).then(function (c) { return c.put(PAGE, copy); });
      }
      clearTimeout(timer);
      if (!done) { done = true; resolve(res); }
    }).catch(function () {
      clearTimeout(timer);
      fromCache(req).then(function (r) {
        if (!done) { done = true; resolve(r || new Response("Χωρίς σύνδεση", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } })); }
      });
    });
  });
}

function fontsStaleWhileRevalidate(e) {
  var req = e.request;
  return caches.open(VERSION).then(function (c) {
    return c.match(req).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && (res.ok || res.type === "opaque")) c.put(req, res.clone());
        return res;
      }).catch(function () { return hit; });
      if (hit) { e.waitUntil(net); return hit; }
      return net;
    });
  });
}

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin === self.location.origin && url.pathname === PAGE) {
    e.respondWith(pageNetworkFirst(req));
  } else if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(fontsStaleWhileRevalidate(e));
  }
});
