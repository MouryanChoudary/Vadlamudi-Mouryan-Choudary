const CACHE_NAME = 'pipe-counter-cache-v3'; // Incremented cache version
// This list should be expanded with actual build artifacts in a production environment
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json', // Added manifest
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/metadata.json',
  '/config.ts',
  '/components/Header.tsx',
  '/components/CameraCapture.tsx',
  '/components/AnalysisResult.tsx',
  '/components/HistoryView.tsx',
  '/components/Toast.tsx',
  '/components/ConfirmationModal.tsx',
  '/components/Spinner.tsx',
  '/components/AnalysisResultSkeleton.tsx',
  '/components/LoginScreen.tsx',
  '/components/UserManagement.tsx',
  '/components/Footer.tsx',
  '/components/PrivacyConsentModal.tsx', // Added new component
  '/components/CorrectionInterface.tsx', // Added new component
  '/hooks/useGeolocation.ts',
  '/hooks/useOnlineStatus.ts',
  '/services/pipeCounterService.ts',
  '/services/db.ts',
  '/services/authService.ts',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://cdn.jsdelivr.net/npm/@google/genai@0.1.0/dist/index.js', // Added AI library
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        const uniqueUrls = [...new Set(urlsToCache)];
        const requests = uniqueUrls.map(url => new Request(url, { mode: 'no-cors' }));
        return cache.addAll(requests);
      })
      .catch(error => {
        console.error('Failed to cache resources during install:', error);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          networkResponse => {
            if (!networkResponse || (networkResponse.status !== 200 && networkResponse.type !== 'opaque')) {
              return networkResponse;
            }
            
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        );
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});