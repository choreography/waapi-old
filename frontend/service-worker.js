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
var PrecacheConfig = [["/assets/fonts/Inconsolata-Bold.ttf","e156a118727053f0f6072d0ee05a48eb"],["/assets/fonts/Inconsolata-Regular.ttf","631f4ecd69f75ecc4c543b38da8f1b9c"],["/assets/fonts/LatoLatin-Bold.woff","a8a00e89adc0ba57870098be433da27a"],["/assets/fonts/LatoLatin-BoldItalic.woff","5db741ee009769f489f2cc91ac8387cf"],["/assets/fonts/LatoLatin-Italic.woff","d8c7b863f4c0c08a425b84c3dc0d46b2"],["/assets/fonts/LatoLatin-Regular.woff","96978e6fcc6395ca44894139e0baa0b2"],["/assets/fonts/LatoLatinBlack-Italic.woff","c7c9fb59b3ca841f984d63db1b72154c"],["/assets/fonts/LatoLatinBlack-Regular.woff","dd9066d166c6d58fe26c608b7ad50d11"],["/assets/fonts/LatoLatinExtBd-Italic.woff","50c84f6755b1d8e4b2c3fe0a0efdf616"],["/assets/fonts/LatoLatinExtBd-Regular.woff","57eec3776bf71e7b4d8c1545646b2041"],["/assets/fonts/LatoLatinHair-Italic.woff","8f606e6a87d93c39c6ed0c0f68d35f20"],["/assets/fonts/LatoLatinHair-Regular.woff","443a27166608ea2aef94f5cf05ff19ec"],["/assets/fonts/LatoLatinLight-Italic.woff","71ec0925573e22d5a756642a732828bb"],["/assets/fonts/LatoLatinLight-Regular.woff","34f4fb7db2bd6acd7b011434f72adb5c"],["/assets/fonts/LatoLatinMed-Italic.woff","6ad2452889177b1514de91151c1278f3"],["/assets/fonts/LatoLatinMed-Regular.woff","5d782610209748b90c256eba57061989"],["/assets/fonts/LatoLatinSemBd-Italic.woff","ff702e0e50d120f71b4977f2a2b3608e"],["/assets/fonts/LatoLatinSemBd-Regular.woff","78bc729334f2e994c2940b7c2973a16e"],["/assets/fonts/LatoLatinThin-Italic.woff","afa8ccd620c9189e2e17e63c109e6fcb"],["/assets/fonts/LatoLatinThin-Regular.woff","b4b3b570fdf16b71a4c617e03c8ee3b8"],["/assets/fonts/MaterialIcons-Regular.ttf","d70c3de3129495c146daaa248c542f2f"],["/assets/fonts/MaterialIcons-Regular.woff","ead0f796431d02360bb912475f68f823"],["/assets/fonts/MaterialIcons-Regular.woff2","9b590521ff1c8b9fa99942e2253a0f52"],["/assets/ic_cached_black_24px.svg","e5694e360d6e298e7ca29d402d9bd479"],["/assets/ic_clear_black_24px.svg","09e70abbf7f3c8e0a712186b7840f08d"],["/assets/ic_code_black_24px.svg","cdf2dd5a5bb15a9bffc91022ad55f508"],["/assets/ic_delete_black_24px.svg","3692f35f78a81ca903f1c3ea5ede00e2"],["/assets/ic_error_black_24px.svg","25fc5546b1738292c6e1bd62ed74342a"],["/assets/ic_feedback_black_24px.svg","11b9077586592f67bb493c76eaf03490"],["/assets/ic_folder_black_24px.svg","38959976e9a5c897da8616fdcea1fad2"],["/assets/ic_folder_open_black_24px.svg","ebd1ecf3293db761a1b2ce87b230d67a"],["/assets/ic_home_black_24px.svg","d7397dd7ecdbe18e1856637599f023f5"],["/assets/ic_invert_colors_black_24px.svg","d96c3e3ca2246079fe818beea7d6feaf"],["/assets/ic_label_black_24px.svg","4ad8c6e33d3481d5715d9e023db63c1f"],["/assets/ic_label_outline_black_24px.svg","8e1940aded61ab382af34b721ed347d3"],["/assets/ic_language_black_24px.svg","3c4bf4ca2bce63cb14cfbe77632fe076"],["/assets/ic_list_black_24px.svg","f491a05f7bf7cbedc4c36865e05fe1d5"],["/assets/ic_open_in_new_black_24px.svg","0885970e0da2d1654c6fbf91369329b1"],["/assets/ic_pageview_black_24px.svg","5ff8c3c6c9d25d68c958cfa37427ce61"],["/assets/ic_report_problem_black_24px.svg","85f8c740c10d47bd172c2c6e1228c5f4"],["/assets/ic_search_black_24px.svg","8a0c8c4e90d8ac7681629b333225fc86"],["/assets/ic_settings_black_24px.svg","4cd9ca115bfcac41c23791fdc95baa4b"],["/assets/ic_view_array_black_24px.svg","ea5f75c7981a1c79cd0b6e8dad894f3f"],["/assets/ic_view_carousel_black_24px.svg","e526bff7714d7950a4464024cd1239f7"],["/assets/ic_view_column_black_24px.svg","d72e622178aa75584380f398970fe560"],["/assets/ic_view_day_black_24px.svg","2e72fb3e82cd563fac8c35cc21f60e14"],["/assets/ic_view_headline_black_24px.svg","36b824720c542be4c6d7f89d09834d09"],["/assets/ic_view_list_black_24px.svg","0afc14c80525cb8d5c88fbfac208cb3d"],["/assets/ic_view_module_black_24px.svg","3024dafdcf8d6a9e9bb9f444e7e20841"],["/assets/ic_view_quilt_black_24px.svg","491a506f7d48a2b6f3f6fa5cf9c19764"],["/assets/ic_view_stream_black_24px.svg","a1bdf54fc7df362a15e4979e6b0c2cb0"],["/assets/ic_view_week_black_24px.svg","bdfdd32d07d3a81f4d1a72ea0a3afc35"],["/assets/ic_visibility_black_24px.svg","10ceeeb5571f592f121ae92054ddda53"],["/assets/ic_visibility_off_black_24px.svg","5d71a72fe33236e0a5172f5c204c47a6"],["/assets/pattern-grid.png","42979a61bdd11f4ddeb624a86f10d685"],["/data.json","9f6f9b5adcb5119acd4b50731d61f426"],["/docs/Animation.html","07c813682b1080d63c17fb138bdfc6b2"],["/docs/Default.html","b74813fada398884e319ce27992288ea"],["/docs/Default.json","84a616fd60bf35396cc56f9ef34c841f"],["/docs/GroupEffect.html","25a2a763a424d80e18abf4a323495b28"],["/docs/KeyframeEffect.html","c7bd525670d94ace997d37b1cb996f3f"],["/docs/KeyframeEffect.json","6d30dc0927b248fde89119a74c9c8489"],["/docs/KeyframeEffect.png","1d83ae7f1593ce1841aa185ab02d973e"],["/docs/KeyframeEffectOptions.html","5da776e6f050c84cd8a04e29a68cce6e"],["/docs/Resources.html","10c2cc205372e397d6e82211615f3a65"],["/docs/SequenceEffect.html","9d16515e4abed98c7a09f78eeb5186ab"],["/docs/document.timeline.html","2ffc52801ed93df3788c0999c2a9ec4f"],["/docs/element.animate.html","42ec5418f6e39a7df63113fe49f0c191"],["/documentation.json","3fa7682e22cf3a0c9b774e257d534f11"],["/index.html","65a322fea3aaaa2a39e3d4ca1e02cdf8"],["/js/app.js","17cbe7934e781ac1839806980a93be04"],["/js/choreo.js","193ce5eb1ee4712dd73ce5c6221853ce"],["/lib/acorn.js","327d0f7c675aca7f4b6a2c859f7185c3"],["/lib/fontfaceobserver.js","5e04a078b8c34c47f5c96b90a059c15b"],["/lib/poly.js","52890756d56bed7f284d1e05d3be8296"],["/lib/router.js","2297cf3e4230ddb11de0cb2453bab0bf"],["/service-worker.js","c8b52bf86d333490e0f57fa63bc03bc9"],["/shared/js/choreography.js","b39ee40b6a70948f9695ec4b0d984a35"],["/shared/js/web-animations-next.js","4a82e5dc695d13cc3f18540adbb79fe7"],["/style.css","c58cec0b65f2db67638c73378c565dcb"]];
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

