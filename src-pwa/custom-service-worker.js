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
let updatePostQueue = null;
let deletePostQueue = null;
/* queue - createPost */
if (backgroundsyncSupported) {
  createPostQueue = new Queue("createPostQueue", {
    onSync: async ({ queue }) => {
      let entry;
      while ((entry = await queue.shiftRequest())) {
        try {
          await fetch(entry.request);
          console.log("(Create)Replay successful for request", entry.request);
          const channel = new BroadcastChannel("sw-messages");
          channel.postMessage({ msg: "offline-post-uploaded" });
        } catch (error) {
          console.error(
            "(Create)Replay failed for request",
            entry.request,
            error
          );

          // Put the entry back in the queue and re-throw the error:
          await queue.unshiftRequest(entry);
          throw error;
        }
      }
      console.log("(Create)Replay complete!");
    },
  });

  updatePostQueue = new Queue("updatePostQueue", {
    onSync: async ({ queue }) => {
      let entry;
      while ((entry = await queue.shiftRequest())) {
        try {
          await fetch(entry.request);
          console.log("(Update)Replay successful for request", entry.request);
          const channel = new BroadcastChannel("sw-messages");
          channel.postMessage({ msg: "offline-updatepost-executed" });
        } catch (error) {
          console.error(
            "(Update)Replay failed for request",
            entry.request,
            error
          );

          // Put the entry back in the queue and re-throw the error:
          await queue.unshiftRequest(entry);
          throw error;
        }
      }
      console.log("(Update)Replay complete!");
    },
  });

  deletePostQueue = new Queue("deletePostQueue", {
    onSync: async ({ queue }) => {
      let entry;
      while ((entry = await queue.shiftRequest())) {
        try {
          await fetch(entry.request);
          console.log("(Delete)Replay successful for request", entry.request);
          const channel = new BroadcastChannel("sw-messages");
          channel.postMessage({ msg: "offline-deletepost-executed" });
        } catch (error) {
          console.error(
            "(Delete)Replay failed for request",
            entry.request,
            error
          );

          // Put the entry back in the queue and re-throw the error:
          await queue.unshiftRequest(entry);
          throw error;
        }
      }
      console.log("(Delete)Replay complete!");
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
    /*

    createPost için

    */
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

    /*

    deletePost için

    */
    if (event.request.url.endsWith("/deletePost")) {
      // Add in your own criteria here to return early if this
      // isn't a request that should use background sync.
      console.log("deletePost ile bitiyor");
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
          await deletePostQueue.pushRequest({ request: event.request });
          return error;
        }
      };

      event.respondWith(bgSyncLogic());
    }

    /*

    updatePost için

    */
    if (event.request.url.endsWith("/updatePost")) {
      // Add in your own criteria here to return early if this
      // isn't a request that should use background sync.
      console.log("updatePost ile bitiyor");
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
          await updatePostQueue.pushRequest({ request: event.request });
          return error;
        }
      };

      event.respondWith(bgSyncLogic());
    }
  });
}

/*
events - notifications
*/
self.addEventListener("notificationclick", (event) => {
  let notification = event.notification;
  let action = event.action;

  if (action === "hello") {
    console.log("Hello button clicked");
  } else if (action === "goodbye") {
    console.log("Goodbye button clicked");
  } else {
    console.log("Main notification clicked");
  }
  notification.close();
});


