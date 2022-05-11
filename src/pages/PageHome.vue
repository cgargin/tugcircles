<template>
  <q-page class="constrain q-pa-md">
    <transition
      appear
      enter-active-class="animated fadeInLeftBig "
      leave-active-class="animated fadeOutRightBig"
    >
      <div
        class="bg-primary"
        v-if="showNotificationsBanner && pushNotificationsSupported"
      >
        <div class="constrain">
          <q-banner class="bg-grey-3 q-mb-md">
            <template v-slot:avatar>
              <q-icon color="primary" name="notifications" />
            </template>
            Would you like to enable notifications ?
            <template v-slot:action>
              <q-btn
                flat
                label="Yes"
                dense
                color="primary"
                class="q-px-sm"
                @click="enableNotifications"
              />
              <q-btn
                flat
                label="Later"
                dense
                color="primary"
                class="q-px-sm"
                @click="showNotificationsBanner = false"
              />
              <q-btn
                flat
                label="Never"
                dense
                color="primary"
                class="q-px-sm"
                @click="neverShowNotificationsBanner"
              />
            </template>
          </q-banner>
        </div>
      </div>
    </transition>
    <div class="row q-col-gutter-lg">
      <div class="col-12 col-sm-8">
        <template v-if="!loadingPosts && posts.length > 0"
          ><q-card
            class="card-post q-mb-md"
            :class="{ 'bg-red-3': post.offline }"
            v-for="post in posts"
            :key="post.id"
          >
            <q-badge
              color="red"
              class="absolute-top-right badge-offline"
              v-if="post.offline"
            >
              Stored offline
            </q-badge>
            <q-item>
              <q-item-section avatar>
                <q-avatar>
                  <img
                    src="https://firebasestorage.googleapis.com/v0/b/tugcircles.appspot.com/o/circles_images%2Favatar_circles.png?alt=media&token=d2c2b3dd-3329-494d-bd83-cf4a3eb14918"
                  />
                </q-avatar>
                <q-btn
                  text-color="deep-orange-10"
                  size="xs"
                  flat
                  icon="more_vert"
                  class="absolute-right"
                >
                  <q-menu cover anchor="center start">
                    <q-item clickable>
                      <q-item-section>
                        <q-btn
                          text-color="deep-orange-10"
                          size="sm"
                          flat
                          icon="delete"
                          class="absolute-right"
                          unelevated
                          fab-mini
                          round
                          @click="deletePost(post.id)"
                        />
                      </q-item-section>
                    </q-item>
                  </q-menu>
                </q-btn>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-bold">cgargin</q-item-label>
                <q-item-label>{{ post.location }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-img :src="post.imageUrl" />
            <q-card-section>
              <div class="row">
                <div class="col-8">
                  <div>{{ post.caption }}</div>
                </div>
                <div class="col-4 text-caption text-deep-orange-10 text-bold">
                  <q-btn
                    flat
                    round
                    :label="post.favCount > 0 ? post.favCount : ''"
                    color="pink-6"
                    :icon="post.favCount > 0 ? 'favorite' : 'favorite_border'"
                    @click="increaseFavCount(post.id)"
                  />
                </div>
              </div>

              <div class="text-caption text-grey">
                {{ niceDate(post.date) }}
              </div>
            </q-card-section>
          </q-card>
        </template>
        <template v-else-if="!loadingPosts && posts.length === 0">
          <h5 class="text-center text-grey">No posts yet!</h5>
          <q-img
            class="fixed-center rounded-borders"
            src="https://firebasestorage.googleapis.com/v0/b/tugcircles.appspot.com/o/circles_images%2Favatar_circles.png?alt=media&token=d2c2b3dd-3329-494d-bd83-cf4a3eb14918"
            spinner-color="white"
            style="height: 140px; max-width: 150px"
            :ratio="1"
          >
            <div class="absolute-bottom text-h2 text-center text-ms-madi">
              ug circles
            </div>
          </q-img>
        </template>
        <template v-else>
          <div class="q-pa-md">
            <q-card flat bordered>
              <q-item>
                <q-item-section avatar>
                  <q-skeleton type="QAvatar" animation="fade" size="" />
                </q-item-section>

                <q-item-section>
                  <q-item-label>
                    <q-skeleton type="text" animation="fade" />
                  </q-item-label>
                  <q-item-label caption>
                    <q-skeleton type="text" animation="fade" />
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-skeleton height="200px" square animation="fade" />

              <q-card-section>
                <q-skeleton
                  type="text"
                  class="text-subtitle2"
                  animation="fade"
                />
                <q-skeleton
                  type="text"
                  width="50%"
                  class="text-subtitle2"
                  animation="fade"
                />
              </q-card-section>
            </q-card>
          </div>
        </template>
      </div>
      <div class="col-4 large-screen-only">
        <q-item class="fixed">
          <q-item-section avatar>
            <q-avatar size="48px">
              <img
                src="https://pbs.twimg.com/profile_images/1138509963809165313/V5c3p4CD_400x400.jpg"
              />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-bold">cgargin</q-item-label>
            <q-item-label>Cüneyt Gargın</q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </div>
  </q-page>
</template>

<script>
import { openDB } from "idb";
import { defineComponent } from "vue";
import { date } from "quasar";
export default defineComponent({
  name: "PageHome",
  data() {
    return {
      posts: [],
      loadingPosts: false,
      showNotificationsBanner: false,
    };
  },
  computed: {
    serviceWorkerSupported() {
      if ("serviceWorker" in navigator) return true;
      return false;
    },
    backgroundSyncSupported() {
      if ("serviceWorker" in navigator && "SyncManager" in window) return true;
      return false;
    },
    pushNotificationsSupported() {
      if ("PushManager" in window) return true;
      return false;
    },
  },
  methods: {
    sendDelete(postId) {
      let formData = new FormData();
      formData.append("id", postId);
      this.$q.loading.show({
        message: "Delete post is in progress. Hang on...",
      });
      this.$axios
        .post(`${process.env.API}/deletePost`, formData)
        .then((response) => {
          this.$q.loading.hide();
          this.getPosts();
          this.$q.notify({
            message: "Post Deleted",
            color: "deep-orange-10",
            avatar:
              "https://firebasestorage.googleapis.com/v0/b/tugcircles.appspot.com/o/circles_images%2Favatar_circles.png?alt=media&token=d2c2b3dd-3329-494d-bd83-cf4a3eb14918",
            actions: [{ label: "Dismiss", color: "white" }],
          });
        })
        .catch((err) => {
          if (!navigator.onLine && this.backgroundSyncSupported) {
            this.$q.notify("Post Deleted Offline");
            let indexToDelete = this.posts.findIndex(
              (post) => post.id === postId
            );
            this.posts.splice(indexToDelete, 1);
            this.$q.loading.hide();
          } else {
            this.$q.loading.hide();
            this.$q.dialog({
              title: "Error deleting post",
              message: err.message + ",could not connect to Server.",
            });
          }
        });
    },
    deletePost(postId) {
      this.$q
        .dialog({
          title: "Confirm",
          message: "Are you sure you want to delete?",
          cancel: true,
          persistent: true,
        })
        .onOk(() => {
          this.sendDelete(postId);
        })
        .onCancel(() => {
          console.log(">>>> Cancel");
        });

      //File ları da delete edeceksin. unutma...
    },
    increaseFavCount(postId) {
      //end point call edilecek!
      let selectedPost = this.posts.find((p) => p.id === postId);
      selectedPost.favCount++;
      let favCount = selectedPost.favCount;
      let formData = new FormData();
      formData.append("id", postId);
      formData.append("favCount", favCount);
      this.$axios
        .post(`${process.env.API}/updatePost`, formData)
        .then((response) => {
          console.log("FavCount increased", postId, favCount);
        })
        .catch((err) => {
          if (!navigator.onLine && this.backgroundSyncSupported) {
            this.$q.notify("Post Updated Offline");
            selectedPost.favCount--;
            this.$q.loading.hide();
          } else
            this.$q.dialog({
              title: "Error updating favCount",
              message: err.message + ",could not connect to Server.",
            });
        });
    },
    niceDate(aNumericDate) {
      return date.formatDate(aNumericDate, "D MMM YYYY hh:mma");
    },
    getPosts() {
      this.loadingPosts = true;
      this.$axios
        .get(`${process.env.API}/posts`)
        .then((response) => {
          this.loadingPosts = false;
          this.posts = response.data;
          if (!navigator.onLine) {
            this.getOfflinePosts();
          }
        })
        .catch((err) => {
          this.loadingPosts = false;
          this.$q.dialog({
            title: "Error getting posts",
            message: err.message + ",could not connect to Server.",
          });
        });
    },
    getOfflinePosts() {
      console.log("offline posts içinde");
      let db = openDB("workbox-background-sync").then((db) => {
        db.getAll("requests")
          .then((offlineRequests) => {
            offlineRequests.forEach((offlineRequest) => {
              if (offlineRequest.queueName === "createPostQueue") {
                let request = new Request(
                  offlineRequest.requestData.url,
                  offlineRequest.requestData
                );
                request.formData().then((formData) => {
                  let offlinePost = {};
                  offlinePost.id = formData.get("id");
                  offlinePost.caption = formData.get("caption");
                  offlinePost.location = formData.get("location");
                  offlinePost.date = parseInt(formData.get("date"));
                  offlinePost.favCount = formData.get("favCount");
                  offlinePost.offline = true;

                  let reader = new FileReader();
                  reader.readAsDataURL(formData.get("file"));
                  reader.onloadend = () => {
                    offlinePost.imageUrl = reader.result;
                    this.posts.unshift(offlinePost);
                  };
                });
              }
            });
          })
          .catch((err) => {
            console.log("Error accessing indexed db: ", err);
          });
      });
    },
    listenForOfflinePostsUploaded() {
      if (this.serviceWorkerSupported) {
        console.log("Listen for offline posts uploaded");
        const channel = new BroadcastChannel("sw-messages");
        channel.addEventListener("message", (event) => {
          console.log("received", event.data);

          /*addPost*/
          if (event.data.msg === "offline-post-uploaded") {
            let offlinePostCount = this.posts.filter(
              (post) => post.offline
            ).length;
            this.posts[offlinePostCount - 1].offline = false;
          }

          /*updatePost*/
          if (event.data.msg === "offline-updatepost-executed") {
            console.log("offline update posts executed");
          }

          /*deletePost*/
          if (event.data.msg === "offline-deletepost-executed") {
            console.log("offline delete posts executed");
          }
        });
      }
    },
    enableNotifications() {
      if(this.pushNotificationsSupported){
        Notification.requestPermission(result=>{
          
        })
      }

    },
    neverShowNotificationsBanner() {
      this.showNotificationsBanner = false;
      this.$q.localStorage.set("neverShowNotificationsBanner", "true");
    },
    initNotificationsBanner() {
      let neverShowNotificationsBanner = this.$q.localStorage.getItem(
        "neverShowNotificationsBanner"
      );

      if (!neverShowNotificationsBanner) {
        this.showNotificationsBanner = true;
      }
    },
  },
  activated() {
    console.log("Activated");
    this.getPosts();
  },

  created() {
    this.listenForOfflinePostsUploaded();
    this.initNotificationsBanner();
  },
});
</script>

<style lang="sass">
.card-post
  .badge-offline
    border-top-left-radius:0 !important
  .q-image
    min-height:200px
</style>
