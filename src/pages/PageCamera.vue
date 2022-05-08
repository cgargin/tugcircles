<template>
  <q-page class="constrain-more q-pa-md">
    <div class="camera-frame q-pa-md">
      <video class="full-width" autoplay ref="video" v-show="!imageCaptured" />
      <div class="text-caption text-center" v-show="!imageCaptured">
        {{ currentDeviceLabel }}
      </div>
      <canvas
        ref="canvas"
        class="full-width"
        height="240"
        v-show="imageCaptured"
      />
    </div>

    <div class="text-center q-pa-md">
      <div class="row">
        <div class="col-3">
          <q-btn
            round
            color="deep-orange-10"
            icon="photo_camera"
            size="12px"
            @click="captureImage"
            :disable="imageCaptured"
            v-if="hasCameraSupport"
          />
        </div>
        <div class="col-3">
          <q-btn
            round
            color="deep-orange-10"
            icon="restart_alt"
            size="12px"
            @click="resetCamera"
            :disable="!imageCaptured"
          />
        </div>
        <div class="col-3">
          <q-btn
            round
            color="deep-orange-10"
            icon="cameraswitch"
            size="12px"
            @click="changeCamera"
            :disable="imageCaptured"
            v-if="hasCameraSupport"
          />
        </div>
        <div class="col-3">
          <q-btn
            round
            color="deep-orange-10"
            icon="file_upload"
            size="12px"
            @click="fileUploadShow"
          />
        </div>
      </div>
    </div>
    <q-file
      outlined
      v-if="showFileUploader && !imageCaptured"
      label-color="deep-orange-10"
      color="deep-orange-10"
      dense
      accept="image/*"
      label="Choose an image"
      v-model="imageUpload"
      @update:model-value="captureImageFallback"
    >
      <template v-slot:prepend>
        <q-icon name="attach_file" color="deep-orange-10" />
      </template>
    </q-file>
    <div class="row justify-center q-ma-md">
      <q-input
        label="Caption"
        class="col col-sm-6"
        dense
        label-color="deep-orange-10"
        color="deep-orange-10"
        v-model="post.caption"
      />
    </div>
    <div class="row justify-center q-ma-md">
      <q-input
        label="Location"
        class="col col-sm-6"
        dense
        label-color="deep-orange-10"
        color="deep-orange-10"
        v-model="post.location"
        :loading="loadingStateForLocation"
      >
        <template v-slot:append>
          <q-btn
            color="deep-orange-10"
            round
            dense
            flat
            icon="my_location"
            @click="getLocation"
            v-if="!loadingStateForLocation && locationSupported"
          />
        </template>
      </q-input>
    </div>
    <div class="row justify-center q-mt-lg">
      <q-btn
        unelevated
        rounded
        color="deep-orange-10"
        label="Post"
        @click="addPost"
      />
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { format, uid } from "quasar";
require("md-gum-polyfill");
export default defineComponent({
  name: "PageCamera",
  data() {
    return {
      post: {
        id: uid(),
        caption: "",
        location: "",
        photo: null,
        date: Date.now(),
        favCount: 0,
      },
      videoDevices: [],
      videoDeviceIndex: null,
      currentStream: null,
      currentDeviceId: null,
      currentDeviceLabel: "",
      facingMode: "user",

      imageCaptured: false,
      firstEntry: true,
      hasCameraSupport: true,
      showFileUploader: false,
      imageUpload: [],

      loadingStateForLocation: false,
    };
  },
  computed: {
    locationSupported() {
      if (navigator.geolocation) return true;
      return false;
    },
  },
  methods: {
    addPost() {
      let formData = new FormData();
      formData.append("id", this.post.id);
      formData.append("caption", this.post.caption);
      formData.append("location", this.post.location);
      formData.append("date", this.post.date);
      formData.append("favCount", this.post.favCount);
      formData.append("file", this.post.photo, this.post.id + ".png");

      this.$axios
        .post(`${process.env.API}/createPost`, formData)
        .then((response) => {
          console.log(response);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    locationSuccess(result) {
      this.post.location = "";
      if (result.data.osmtags.name)
        this.post.location += " " + result.data.osmtags.name;
      if (result.data.postal) this.post.location += " " + result.data.postal;
      if (result.data.city) this.post.location += " " + result.data.city;
      if (result.data.country) this.post.location += " " + result.data.country;
      this.loadingStateForLocation = false;
    },
    locationFail(err) {
      console.log(err);
      this.$q.dialog({
        title: "Error getting location",
        message: err.message + ",could not connect to Geo Server.",
      });
      this.loadingStateForLocation = false;
    },
    getFullAddress(position) {
      let apiURL = `https://geocode.xyz/${position.coords.latitude},${position.coords.longitude}?json=1`;
      this.$axios.get(apiURL).then(
        (result) => {
          this.locationSuccess(result);
        },
        (err) => {
          this.locationFail(err);
        }
      );
    },
    getLocation() {
      this.loadingStateForLocation = true;
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.getFullAddress(position);
        },
        (err) => {
          this.locationFail(err);
        },
        {
          timeout: 5000,
        }
      );
    },
    fileUploadShow() {
      this.showFileUploader = !this.showFileUploader;
    },
    dataURItoBlob(dataURI) {
      // convert base64 to raw binary data held in a string
      // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
      var byteString = atob(dataURI.split(",")[1]);

      // separate out the mime component
      var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

      // write the bytes of the string to an ArrayBuffer
      var ab = new ArrayBuffer(byteString.length);

      // create a view into the buffer
      var ia = new Uint8Array(ab);

      // set the bytes of the buffer to the correct values
      for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      // write the ArrayBuffer to a blob, and you're done
      var blob = new Blob([ab], { type: mimeString });
      return blob;
    },
    resetCamera() {
      this.imageCaptured = false;
      this.showFileUploader = false;
      this.initCamera();
      this.firstEntry = true;
    },
    captureImage() {
      let video = this.$refs.video;
      let canvas = this.$refs.canvas;
      canvas.width = video.getBoundingClientRect().width;
      canvas.height = video.getBoundingClientRect().height;

      let context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      this.imageCaptured = true;
      this.post.photo = this.dataURItoBlob(canvas.toDataURL());
      this.disableCamera();
    },
    captureImageFallback(file) {
      this.post.photo = file;
      let canvas = this.$refs.canvas;
      let context = canvas.getContext("2d");

      var reader = new FileReader();
      reader.onload = (event) => {
        var img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          context.drawImage(img, 0, 0);
          this.imageCaptured = true;
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    },
    getVideoDevices(mediaDevices) {
      mediaDevices.forEach((mediaDevice) => {
        if (mediaDevice.kind === "videoinput") {
          this.videoDevices.push({
            id: mediaDevice.deviceId,
            label: mediaDevice.label,
          });
        }
      });
    },
    initCamera() {
      navigator.mediaDevices
        .getUserMedia({
          video: true,
        })
        .then((stream) => {
          this.$refs.video.srcObject = stream;
          this.currentStream = stream;
          this.currentDeviceId = this.videoDevices[0].id;
          this.currentDeviceLabel = this.videoDevices[0].label;
        })
        .catch((err) => {
          console.log(err);
          this.hasCameraSupport = false;
          this.showFileUploader = true;
          this.currentStream = null;
          this.videoDeviceIndex = -1;
        });
    },
    changeCamera() {
      if (this.firstEntry) {
        this.videoDeviceIndex = 1;
        this.firstEntry = false;
      }
      this.disableCamera();
      if (this.videoDeviceIndex === -1) {
        console.log("No Camera Attached");
        this.resetCamera();
        return;
      } else if (this.videoDeviceIndex === this.videoDevices.length - 1) {
        this.videoDeviceIndex = 0;
        this.currentDeviceId = this.videoDevices[0].id;
        this.currentDeviceLabel = this.videoDevices[0].label;
      } else {
        this.videoDeviceIndex++;
        this.currentDeviceId = this.videoDevices[this.videoDeviceIndex].id;
        this.currentDeviceLabel =
          this.videoDevices[this.videoDeviceIndex].label;
      }

      navigator.mediaDevices
        .getUserMedia({
          video: {
            deviceId: {
              exact: this.videoDevices[this.videoDeviceIndex].id,
            },
          },
        })
        .then((stream) => {
          this.$refs.video.srcObject = stream;
          this.currentStream = stream;
        })
        .catch((err) => {
          console.log(err);
          this.currentStream = null;
          this.videoDeviceIndex = -1;
        });
    },
    stopMediaTracks(stream) {
      console.log("stopMediaTracks", stream);
      stream.getTracks().forEach((track) => {
        track.stop();
      });
    },
    disableCamera() {
      this.$refs.video.srcObject.getVideoTracks().forEach((track) => {
        track.stop();
      });
    },
  },
  mounted() {
    navigator.mediaDevices.enumerateDevices().then(this.getVideoDevices);
    this.initCamera();
  },
  beforeUnmount() {
    if (this.hasCameraSupport) this.disableCamera();
  },
});
</script>
<style lang="sass">
.camera-frame
  border:2px solid $deep-orange-10
  border-radius:10px
</style>
