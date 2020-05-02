self.addEventListener('install', function (event) {
    self.skipWaiting()
    event.waitUntil(
        caches.open('test-cache').then(async function (cache) {
            // const normalizedUrl = new URL('http://localhost:3000/images/icon.png');
            // console.log(normalizedUrl)
            // const fetchResponseP = fetch(normalizedUrl);
            // const fetchResponseCloneP = fetchResponseP.then(r => r.clone());
            // await cache.put(normalizedUrl, await fetchResponseCloneP);

            return cache.addAll([
                'reacts.js',
                'vendors.js',
                'default.js',
                'images/icon.png'
            ]);
        })
    );
});

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.open('test-cache').then(function (cache) {
            return cache.match(event.request).then(async function (response) {
                // console.log(event.request)

                if (response) {
                    return response
                } else {
                    var fetchPromise = fetch(event.request).then(function (networkResponse) {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    })
                    return fetchPromise
                }
            })
        })
    );
});