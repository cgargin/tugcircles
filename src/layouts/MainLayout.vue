<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-deep-orange-1">
      <q-toolbar
        class="bg-deep-orange-10 constrain"
        indicator-color="transparent"
      >
        <q-icon name="workspaces_filled" class="small-screen-only" />
        <q-btn
          flat
          round
          icon="camera"
          class="large-screen-only q-mr-sm"
          size="16px"
          dense
          to="/camera"
        />
        <q-separator vertical class="large-screen-only" spaced />
        <q-toolbar-title class="text-bold"> ug circles </q-toolbar-title>
        <q-btn
          flat
          round
          icon="home"
          class="large-screen-only"
          size="16px"
          dense
          to="/"
        />
      </q-toolbar>
    </q-header>
    <q-footer class="bg-deep-orange-1 small-screen-only" bordered>
      <q-tabs
        class="text-deep-orange-10"
        active-bg-color="deep-orange-10"
        active-color="white"
        indicator-color="transparent"
      >
        <q-route-tab icon="home" to="/" />
        <q-route-tab icon="camera" to="/camera" />
      </q-tabs>
    </q-footer>
    <q-page-container class="bg-deep-orange-1">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "MainLayout",
});
</script>
<style lang="sass">
.q-footer
  .q-tab__icon
    font-size:30px

.q-toolbar__title
  font-size:30px
  @media (max-width: $breakpoint-xs-max)
    text-align: center

.q-toolbar
  @media (min-width: $breakpoint-sm-min)
    height:78px
</style>
