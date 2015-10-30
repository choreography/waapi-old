/**
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This generated service worker JavaScript will precache your site's resources.
// The code needs to be saved in a .js file at the top-level of your site, and registered
// from your pages in order to be used. See
// https://github.com/googlechrome/sw-precache/blob/master/demo/app/js/service-worker-registration.js
// for an example of how you can register this script and handle various service worker events.

/* eslint-env worker, serviceworker */
/* eslint-disable indent, no-unused-vars, no-multiple-empty-lines, max-nested-callbacks, space-before-function-paren */
'use strict';



/* eslint-disable quotes, comma-spacing */
var PrecacheConfig = [["/assets/fonts/Inconsolata-Bold.ttf","e156a118727053f0f6072d0ee05a48eb"],["/assets/fonts/Inconsolata-Regular.ttf","631f4ecd69f75ecc4c543b38da8f1b9c"],["/assets/fonts/LatoLatin-Bold.woff","a8a00e89adc0ba57870098be433da27a"],["/assets/fonts/LatoLatin-BoldItalic.woff","5db741ee009769f489f2cc91ac8387cf"],["/assets/fonts/LatoLatin-Italic.woff","d8c7b863f4c0c08a425b84c3dc0d46b2"],["/assets/fonts/LatoLatin-Regular.woff","96978e6fcc6395ca44894139e0baa0b2"],["/assets/fonts/LatoLatinBlack-Italic.woff","c7c9fb59b3ca841f984d63db1b72154c"],["/assets/fonts/LatoLatinBlack-Regular.woff","dd9066d166c6d58fe26c608b7ad50d11"],["/assets/fonts/LatoLatinExtBd-Italic.woff","50c84f6755b1d8e4b2c3fe0a0efdf616"],["/assets/fonts/LatoLatinExtBd-Regular.woff","57eec3776bf71e7b4d8c1545646b2041"],["/assets/fonts/LatoLatinHair-Italic.woff","8f606e6a87d93c39c6ed0c0f68d35f20"],["/assets/fonts/LatoLatinHair-Regular.woff","443a27166608ea2aef94f5cf05ff19ec"],["/assets/fonts/LatoLatinLight-Italic.woff","71ec0925573e22d5a756642a732828bb"],["/assets/fonts/LatoLatinLight-Regular.woff","34f4fb7db2bd6acd7b011434f72adb5c"],["/assets/fonts/LatoLatinMed-Italic.woff","6ad2452889177b1514de91151c1278f3"],["/assets/fonts/LatoLatinMed-Regular.woff","5d782610209748b90c256eba57061989"],["/assets/fonts/LatoLatinSemBd-Italic.woff","ff702e0e50d120f71b4977f2a2b3608e"],["/assets/fonts/LatoLatinSemBd-Regular.woff","78bc729334f2e994c2940b7c2973a16e"],["/assets/fonts/LatoLatinThin-Italic.woff","afa8ccd620c9189e2e17e63c109e6fcb"],["/assets/fonts/LatoLatinThin-Regular.woff","b4b3b570fdf16b71a4c617e03c8ee3b8"],["/assets/icon-close.svg","bfcec7a7b52039dd3d3803c87c33b4d2"],["/assets/icon-expand.svg","647eeda7f8064d4eacab1899c1f669e0"],["/assets/icon-search.svg","e1b66b24ba977c9a94c4556a4334924d"],["/assets/pattern-grid.png","42979a61bdd11f4ddeb624a86f10d685"],["/data.json","9f6f9b5adcb5119acd4b50731d61f426"],["/docs/Default.html","2ac371c22ce7218920c5fa43246a0230"],["/docs/Default.json","84a616fd60bf35396cc56f9ef34c841f"],["/docs/GroupEffect.html","0ef23bbdd3d768da4e2a1a3ad5015d1d"],["/docs/KeyframeEffect.html","8cc4dddd45229e078fef916efc4d8dd4"],["/docs/KeyframeEffect.json","6d30dc0927b248fde89119a74c9c8489"],["/docs/KeyframeEffect.png","1d83ae7f1593ce1841aa185ab02d973e"],["/docs/SequenceEffect.html","3b81eedb14c7478e05aadd2aeaa672d2"],["/documentation.json","3fa7682e22cf3a0c9b774e257d534f11"],["/index.html","bc0b9fc67729d0c688c344c86faa770c"],["/js/app.js","65715b715cc2606ec8a54b6ad44c51f4"],["/js/choreo.js","193ce5eb1ee4712dd73ce5c6221853ce"],["/lib/acorn.js","327d0f7c675aca7f4b6a2c859f7185c3"],["/lib/fontfaceobserver.js","5e04a078b8c34c47f5c96b90a059c15b"],["/lib/poly.js","aaeba3bbf15b10beeefce38fe4dc0914"],["/lib/router.js","2297cf3e4230ddb11de0cb2453bab0bf"],["/service-worker.js","3cd422d4c65d6723e6e195458f149fb4"],["/shared/js/choreography.js","b39ee40b6a70948f9695ec4b0d984a35"],["/shared/js/web-animations-next.js","4a82e5dc695d13cc3f18540adbb79fe7"],["/style.css","b64840dfad51ba43a6c914b1ba03f764"]];
/* eslint-enable quotes, comma-spacing */
var CacheNamePrefix = 'sw-precache-v1-sw-precache-' + (self.registration ? self.registration.scope : '') + '-';


var IgnoreUrlParametersMatching = [/^utm_/];



var addDirectoryIndex = function (originalUrl, index) {
    var url = new URL(originalUrl);
    if (url.pathname.slice(-1) === '/') {
      url.pathname += index;
    }
    return url.toString();
  };

var populateCurrentCacheNames = function (precacheConfig, cacheNamePrefix, baseUrl) {
    var absoluteUrlToCacheName = {};
    var currentCacheNamesToAbsoluteUrl = {};

    precacheConfig.forEach(function(cacheOption) {
      var absoluteUrl = new URL(cacheOption[0], baseUrl).toString();
      var cacheName = cacheNamePrefix + absoluteUrl + '-' + cacheOption[1];
      currentCacheNamesToAbsoluteUrl[cacheName] = absoluteUrl;
      absoluteUrlToCacheName[absoluteUrl] = cacheName;
    });

    return {
      absoluteUrlToCacheName: absoluteUrlToCacheName,
      currentCacheNamesToAbsoluteUrl: currentCacheNamesToAbsoluteUrl
    };
  };

var stripIgnoredUrlParameters = function (originalUrl, ignoreUrlParametersMatching) {
    var url = new URL(originalUrl);

    url.search = url.search.slice(1) // Exclude initial '?'
      .split('&') // Split into an array of 'key=value' strings
      .map(function(kv) {
        return kv.split('='); // Split each 'key=value' string into a [key, value] array
      })
      .filter(function(kv) {
        return ignoreUrlParametersMatching.every(function(ignoredRegex) {
          return !ignoredRegex.test(kv[0]); // Return true iff the key doesn't match any of the regexes.
        });
      })
      .map(function(kv) {
        return kv.join('='); // Join each [key, value] array into a 'key=value' string
      })
      .join('&'); // Join the array of 'key=value' strings into a string with '&' in between each

    return url.toString();
  };


var mappings = populateCurrentCacheNames(PrecacheConfig, CacheNamePrefix, self.location);
var AbsoluteUrlToCacheName = mappings.absoluteUrlToCacheName;
var CurrentCacheNamesToAbsoluteUrl = mappings.currentCacheNamesToAbsoluteUrl;

function deleteAllCaches() {
  return caches.keys().then(function(cacheNames) {
    return Promise.all(
      cacheNames.map(function(cacheName) {
        return caches.delete(cacheName);
      })
    );
  });
}

self.addEventListener('install', function(event) {
  var now = Date.now();

  event.waitUntil(
    caches.keys().then(function(allCacheNames) {
      return Promise.all(
        Object.keys(CurrentCacheNamesToAbsoluteUrl).filter(function(cacheName) {
          return allCacheNames.indexOf(cacheName) === -1;
        }).map(function(cacheName) {
          var url = new URL(CurrentCacheNamesToAbsoluteUrl[cacheName]);
          // Put in a cache-busting parameter to ensure we're caching a fresh response.
          if (url.search) {
            url.search += '&';
          }
          url.search += 'sw-precache=' + now;
          var urlWithCacheBusting = url.toString();

          console.log('Adding URL "%s" to cache named "%s"', urlWithCacheBusting, cacheName);
          return caches.open(cacheName).then(function(cache) {
            var request = new Request(urlWithCacheBusting, {credentials: 'same-origin'});
            return fetch(request.clone()).then(function(response) {
              if (response.ok) {
                return cache.put(request, response);
              }

              console.error('Request for %s returned a response with status %d, so not attempting to cache it.',
                urlWithCacheBusting, response.status);
              // Get rid of the empty cache if we can't add a successful response to it.
              return caches.delete(cacheName);
            });
          });
        })
      ).then(function() {
        return Promise.all(
          allCacheNames.filter(function(cacheName) {
            return cacheName.indexOf(CacheNamePrefix) === 0 &&
                   !(cacheName in CurrentCacheNamesToAbsoluteUrl);
          }).map(function(cacheName) {
            console.log('Deleting out-of-date cache "%s"', cacheName);
            return caches.delete(cacheName);
          })
        );
      });
    }).then(function() {
      if (typeof self.skipWaiting === 'function') {
        // Force the SW to transition from installing -> active state
        self.skipWaiting();
      }
    })
  );
});

if (self.clients && (typeof self.clients.claim === 'function')) {
  self.addEventListener('activate', function(event) {
    event.waitUntil(self.clients.claim());
  });
}

self.addEventListener('message', function(event) {
  if (event.data.command === 'delete_all') {
    console.log('About to delete all caches...');
    deleteAllCaches().then(function() {
      console.log('Caches deleted.');
      event.ports[0].postMessage({
        error: null
      });
    }).catch(function(error) {
      console.log('Caches not deleted:', error);
      event.ports[0].postMessage({
        error: error
      });
    });
  }
});


self.addEventListener('fetch', function(event) {
  if (event.request.method === 'GET') {
    var urlWithoutIgnoredParameters = stripIgnoredUrlParameters(event.request.url,
      IgnoreUrlParametersMatching);

    var cacheName = AbsoluteUrlToCacheName[urlWithoutIgnoredParameters];
    var directoryIndex = 'index.html';
    if (!cacheName && directoryIndex) {
      urlWithoutIgnoredParameters = addDirectoryIndex(urlWithoutIgnoredParameters, directoryIndex);
      cacheName = AbsoluteUrlToCacheName[urlWithoutIgnoredParameters];
    }

    var navigateFallback = '';
    // Ideally, this would check for event.request.mode === 'navigate', but that is not widely
    // supported yet:
    // https://code.google.com/p/chromium/issues/detail?id=540967
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1209081
    if (!cacheName && navigateFallback && event.request.headers.has('accept') &&
        event.request.headers.get('accept').includes('text/html')) {
      var navigateFallbackUrl = new URL(navigateFallback, self.location);
      cacheName = AbsoluteUrlToCacheName[navigateFallbackUrl.toString()];
    }

    if (cacheName) {
      event.respondWith(
        // We can't call cache.match(event.request) since the entry in the cache will contain the
        // cache-busting parameter. Instead, rely on the fact that each cache should only have one
        // entry, and return that.
        caches.open(cacheName).then(function(cache) {
          return cache.keys().then(function(keys) {
            return cache.match(keys[0]).then(function(response) {
              return response || fetch(event.request).catch(function(e) {
                console.error('Fetch for "%s" failed: %O', urlWithoutIgnoredParameters, e);
              });
            });
          });
        }).catch(function(e) {
          console.error('Couldn\'t serve response for "%s" from cache: %O', urlWithoutIgnoredParameters, e);
          return fetch(event.request);
        })
      );
    }
  }
});

