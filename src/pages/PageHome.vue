<template>
  <q-page class="constrain q-pa-md">
    <div class="row q-col-gutter-lg">
      <div class="col-12 col-sm-8">
        <q-card class="card-post q-mb-md" v-for="post in posts" :key="post.id">
          <q-item>
            <q-item-section avatar>
              <q-avatar>
                <img
                  src="https://pbs.twimg.com/profile_images/1138509963809165313/V5c3p4CD_400x400.jpg"
                />
              </q-avatar>
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
              <div class="col-10">
                <div>{{ post.caption }}</div>
              </div>
              <div class="col-2 text-caption">
                <q-icon
                  size="xs"
                  name="favorite"
                  color="pink-6"
                  v-if="post.favCount > 0"
                />
                <span v-if="post.favCount > 0">{{ post.favCount }}</span>
                <q-icon
                  size="xs"
                  name="favorite_border"
                  color="pink-6"
                  v-if="post.favCount === 0"
                />
              </div>
            </div>

            <div class="text-caption text-grey">{{ niceDate(post.date) }}</div>
          </q-card-section>
        </q-card>
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
      posts: [
        {
          id: 1,
          caption: "Golden Gate Bridge",
          date: 1651227055955,
          location: "Sanfransisco, USA",
          imageUrl: "https://cdn.quasar.dev/img/parallax2.jpg",
          favCount: 0,
        },
        {
          id: 2,
          caption: "Golden Gate Bridge",
          date: 1651227055955,
          location: "Sanfransisco, USA",
          imageUrl: "https://cdn.quasar.dev/img/parallax2.jpg",
          favCount: 120,
        },
        {
          id: 3,
          caption: "Golden Gate Bridge",
          date: 1651227055955,
          location: "Sanfransisco, USA",
          imageUrl: "https://cdn.quasar.dev/img/parallax2.jpg",
          favCount: 0,
        },
        {
          id: 4,
          caption: "Golden Gate Bridge",
          date: 1651227055955,
          location: "Sanfransisco, USA",
          imageUrl: "https://cdn.quasar.dev/img/parallax2.jpg",
          favCount: 23,
        },
      ],
    };
  },
  methods: {
    niceDate(aNumericDate) {
      return date.formatDate(aNumericDate, "D MMM YYYY hh:mma");
    },
  },
});
</script>

<style lang="sass">
.card-post
  .q-image
    min-height:200px
</style>
