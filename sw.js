/* Filament Lab v2 Service Worker：离线缓存
 * 版本升级时改 CACHE 名（如 fl-v2-20260909）即可全量刷新缓存 */
var CACHE = "fl-v2-20260908";
var ASSETS = [
  "./", "./index.html", "./js/app.js", "./js/data.js", "./theme-v2.css",
  "./icons/icon-192.png", "./icons/icon-512.png",
  "./share/donate-wechat.jpg", "./share/donate-alipay.jpg"
];
self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.allSettled(ASSETS.map(function (u) { return c.add(u); }));
    }).then(function () { return self.skipWaiting(); })
  );
});
self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});
self.addEventListener("fetch", function (e) {
  var url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit;
      return fetch(e.request).then(function (res) {
        if (res && res.ok) {
          var clone = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, clone); });
        }
        return res;
      }).catch(function () { return caches.match("./index.html"); });
    })
  );
});
