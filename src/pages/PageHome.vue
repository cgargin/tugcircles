<template>
  <q-page class="constrain q-pa-md">
    <div class="row q-col-gutter-lg">
      <div class="col-12 col-sm-8">
        <template v-if="!loadingPosts && posts.length > 0"
          ><q-card
            class="card-post q-mb-md"
            v-for="post in posts"
            :key="post.id"
          >
            <q-item>
              <q-item-section avatar>
                <q-avatar>
                  <img
                    src="https://pbs.twimg.com/profile_images/1138509963809165313/V5c3p4CD_400x400.jpg"
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
import { defineComponent } from "vue";
import { date } from "quasar";
export default defineComponent({
  name: "PageHome",
  data() {
    return {
      posts: [],
      loadingPosts: false,
    };
  },
  methods: {
    deletePost(postId) {
      this.$q
        .dialog({
          title: "Confirm",
          message: "Are you sure you want to delete?",
          cancel: true,
          persistent: true,
        })
        .onOk(() => {
          console.log(">>>> OK");
        })
        .onCancel(() => {
          console.log(">>>> Cancel");
        });

      //File ları da delete edeceksin. unutma...
    },
    increaseFavCount(postId) {
      console.log("postId", postId);
      //end point call edilecek!
      this.posts.find((p) => p.id === postId).favCount++;
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
        })
        .catch((err) => {
          this.loadingPosts = false;
          this.$q.dialog({
            title: "Error getting posts",
            message: err.message + ",could not connect to Server.",
          });
        });
    },
  },
  mounted() {
    this.getPosts();
  },
});
</script>

<style lang="sass">
.card-post
  .q-image
    min-height:200px
</style>
