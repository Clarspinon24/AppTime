// const CACHE_NAME = 'apptime-v1';

// const ASSETS = [
//   './',
//   './index.html',
//   './girlmath.png',
//   './icons/logo.png',
//   './icons/logo2.png'
// ];

// // Installation : Mise en cache des ressources
// self.addEventListener('install', (event) => {
//   event.waitUntil(
//     caches.open(CACHE_NAME)
//       .then((cache) => cache.addAll(ASSETS))
//       .then(() => self.skipWaiting())
//   );
// });

// // Activation : Nettoyage des anciens caches
// self.addEventListener('activate', (event) => {
//   event.waitUntil(
//     caches.keys().then((keys) => {
//       return Promise.all(
//         keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
//       );
//     })
//   );
// });

// // Stratégie "Cache First" : On pioche dans le cache, sinon on va sur le réseau
// self.addEventListener('fetch', (event) => {
//   event.respondWith(
//     caches.match(event.request).then((response) => {
//       return response || fetch(event.request);
//     })
//   );
// });
