/**
 * Service Worker for 着物バーチャル試着アプリ
 */

const CACHE_NAME = 'kimono-app-v2';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json'
];

// インストール時にアセットをキャッシュ
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching app assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// 古いキャッシュを削除
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// リクエストをインターセプト
self.addEventListener('fetch', (event) => {
    // API呼び出しはキャッシュしない
    if (event.request.url.includes('/api/')) {
        return;
    }

    // Network First (ネットワーク優先)
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // 有効なレスポンスならキャッシュを更新して返す
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                }
                return response;
            })
            .catch(() => {
                // オフライン時はキャッシュから返す
                return caches.match(event.request)
                    .then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        // 画像のフォールバック
                        if (event.request.destination === 'image') {
                            return new Response(
                                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 133"><rect fill="#16213e" width="100" height="133"/><text x="50" y="70" text-anchor="middle" fill="#8b4c70" font-size="40">👘</text></svg>',
                                { headers: { 'Content-Type': 'image/svg+xml' } }
                            );
                        }
                    });
            })
    );
});
