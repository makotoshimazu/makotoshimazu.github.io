const VERSION = 1;
const STATIC_CACHE_NAME = 'static_' + VERSION;
const BASE_URL = location.href.replace(/\/sw\.js$/, '');

const STATIC_FILES = [
    BASE_URL + '/',
    BASE_URL + '/app.js',
    BASE_URL + '/style.css',
    BASE_URL + '/favicon.ico'
];

self.addEventListener('install', e => {
    // Cache all resources in |STATIC_FILES|.
    let p = caches.open(STATIC_CACHE_NAME).then(cache => {
        return Promise.all(STATIC_FILES.map(url => {
            return fetch(url).then(res => {
                if (!res.ok) {
                    return Promise.reject(`Invalid response. url: ${res.url}, status: ${res.status}`);
                }
                return cache.put(res.url, res);
            });
        }));
    });
    e.waitUntil(p);
});

self.addEventListener('activate', e => {
    // Remove all caches except for |STATIC_CACHE_NAME|.
    e.waitUntil(caches.keys().then(keys => {
        return Promise.all(
            keys.filter(key => key != STATIC_CACHE_NAME)
                .map(key => caches.delete(key)));
    }));
});

self.addEventListener('fetch', e => {
    e.respondWith(caches.match(e.request).then(res => {
            return res || fetch(e.request);
        }));
});
