<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-deep-orange-10">
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

    <q-footer class="bg-deep-orange-1" bordered>
      <transition
        appear
        enter-active-class="animated fadeInLeftBig "
        leave-active-class="animated fadeOutRightBig"
      >
        <div class="bg-primary" v-if="showAppInstallBanner">
          <div class="constrain">
            <q-banner
              inline-actions
              rounded
              class="bg-primary text-white"
              dense
            >
              <template v-slot:avatar>
                <q-avatar
                  color="white"
                  text-color="deep-orange-10"
                  icon="workspaces_filled"
                  size="32px"
                />
              </template>
              <b>Install circles?</b>
              <template v-slot:action>
                <q-btn
                  flat
                  label="Yes"
                  dense
                  class="q-px-sm"
                  @click="installApp"
                />
                <q-btn
                  flat
                  label="Later"
                  dense
                  class="q-px-sm"
                  @click="showAppInstallBanner = false"
                />
                <q-btn
                  flat
                  label="Never"
                  dense
                  class="q-px-sm"
                  @click="neverShowAppInstallBanner"
                />
              </template>
            </q-banner>
          </div>
        </div>
      </transition>
      <q-tabs
        class="text-deep-orange-10 small-screen-only"
        active-bg-color="deep-orange-10"
        active-color="white"
        indicator-color="transparent"
      >
        <q-route-tab icon="home" to="/" />
        <q-route-tab icon="camera" to="/camera" />
      </q-tabs>
    </q-footer>
    <q-page-container class="bg-deep-orange-1">
      <router-view v-slot="{ Component }">
        <keep-alive include="PageHome">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";
let deferredPrompt;

export default defineComponent({
  name: "MainLayout",
  data() {
    return {
      showAppInstallBanner: false,
    };
  },
  methods: {
    installApp() {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted");
          this.neverShowAppInstallBanner();
        } else {
          console.log("User dismissed");
        }
      });
    },
    neverShowAppInstallBanner() {
      this.showAppInstallBanner = false;
      this.$q.localStorage.set("neverShowAppInstallBanner", "true");
    },
  },
  mounted() {
    let neverShowAppInstallBanner = this.$q.localStorage.getItem(
      "neverShowAppInstallBanner"
    );
    if (!neverShowAppInstallBanner) {
      window.addEventListener("beforeinstallprompt", (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;
        // Update UI notify the user they can install the PWA
        setTimeout(() => {
          this.showAppInstallBanner = true;
        }, 3000);
      });
    }
  },
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
