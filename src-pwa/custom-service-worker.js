/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.config.js > pwa > workboxPluginMode is set to "InjectManifest"
 */

/* dependencies */
import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import {
  StaleWhileRevalidate,
  CacheFirst,
  NetworkFirst,
} from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { Queue } from "workbox-background-sync";

/* config */
self.__WB_DISABLE_DEV_LOGS = true;
precacheAndRoute(self.__WB_MANIFEST);

let backgroundsyncSupported = "sync" in self.registration ? true : false;
let createPostQueue = null;
/* queue - createPost */
if (backgroundsyncSupported) {
  createPostQueue = new Queue("createPostQueue", {
    onSync: async ({ queue }) => {
      let entry;
      while ((entry = await queue.shiftRequest())) {
        try {
          await fetch(entry.request);
          console.log("Replay successful for request", entry.request);
          const channel = new BroadcastChannel("sw-messages");
          channel.postMessage({ msg: "offline-post-uploaded" });
        } catch (error) {
          console.error("Replay failed for request", entry.request, error);

          // Put the entry back in the queue and re-throw the error:
          await queue.unshiftRequest(entry);
          throw error;
        }
      }
      console.log("Replay complete!");
    },
  });
}

/* Caching Strategies*/

registerRoute(
  ({ url }) => url.host.startsWith("fonts.g"),
  new CacheFirst({
    cacheName: "google-fonts",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

registerRoute(
  ({ url }) => url.pathname.startsWith("/posts"),
  new NetworkFirst()
);

registerRoute(
  ({ url }) => url.href.startsWith("http"),
  new StaleWhileRevalidate()
);

/* events  - fetch */
if (backgroundsyncSupported) {
  self.addEventListener("fetch", (event) => {
    if (event.request.url.endsWith("/createPost")) {
      // Add in your own criteria here to return early if this
      // isn't a request that should use background sync.
      console.log("createPost ile bitiyor");
      if (event.request.method !== "POST") {
        console.log("method POST değilse çık");
        return;
      }

      const bgSyncLogic = async () => {
        try {
          const response = await fetch(event.request.clone());
          console.log("try içinde");
          return response;
        } catch (error) {
          console.log("error a düştü", error);
          await createPostQueue.pushRequest({ request: event.request });
          return error;
        }
      };

      event.respondWith(bgSyncLogic());
    }
  });
}
