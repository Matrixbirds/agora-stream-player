<template>
  <v-row>
    <v-col class="shrink col-3 md-3">
      <v-app>
        <v-container class="grey lighten-5">
          <v-form ref="form" v-model="valid" :lazy-validation="lazy">
            <v-text-field v-model="cname" :rules="cnameRules" label="channelName" required></v-text-field>
            <v-text-field v-model="uid" :rules="uidRules" label="uid" required></v-text-field>
            <v-select
              v-model="camera"
              :items="cameraList"
              label="camera"
              item-text="label"
              item-value="deviceId"
              required
            ></v-select>
            <v-select
              v-model="microphone"
              :items="microphoneList"
              label="microphone"
              item-text="label"
              item-value="deviceId"
              required
            ></v-select>

            <v-row>
              <v-col>
                <v-btn color="primary" class="mr-4" @click="publish">publish</v-btn>
                <v-btn color="error" @click="leave">leave</v-btn>
              </v-col>
            </v-row>
          </v-form>
                      <v-col>
              <StreamPlayer :stream="localStream" :uid="localStream.getId()" v-if="localStream"></StreamPlayer>
            </v-col>
            <v-col :key="index" v-for="(remoteStream, index) in remoteStreams">
              <StreamPlayer :stream="remoteStream" :uid="remoteStream.getId()"></StreamPlayer>
            </v-col>
        </v-container>
      </v-app>
    </v-col>
  </v-row>
</template>

<script>
import { RTCClient, VideoInput, AudioInput } from "../rtc-client";
import StreamPlayer from "./stream-player";
export default {
  name: 'Main',
  components: {
    StreamPlayer
  },
  data: () => ({
    valid: true,
    appId: "",
    cname: "",
    cnameRules: [v => !!v || "channelName is required"],
    uid: "",
    uidRules: [v => /\d+/.test(v) || "uid must be number"],
    checkbox: false,
    lazy: false,
    loading: false,

    // media device
    microphone: '',
    camera: '',
    cameraList: [],
    microphoneList: [],
    
    // media stream
    localStream: undefined,
    remoteStreams: []
  }),

  methods: {
    publish() {
      this.$rtc
        .joinRTC(
          {
            token: null,
            uid: this.uid,
            cname: this.cname
          },
          {
            cameraId: this.camera,
            microphoneId: this.microphone,
            video: Boolean(this.camera),
            audio: Boolean(this.microphone),
            screen: false
          }
        )
        .then(stream => {
          this.loading = true;
          this.localStream = stream;
          console.log("publish", this.loading, stream);
        })
        .catch(err => {
          console.warn(err);
        });
    },
    leave() {
      this.$rtc.leaveRTC();
      this.localStream = undefined
    }
  },

  created() {
    this.$rtc = new RTCClient();
    this.$rtc
      .getDevices()
      .then(devices => {
        this.cameraList = VideoInput(devices);
        this.microphoneList = AudioInput(devices);
        this.camera = this.cameraList[0] ? this.cameraList[0].deviceId : "";
        this.microphone = this.microphoneList[0]
          ? this.microphoneList[0].deviceId
          : "";
      })
      .catch(console.warn)

    this.$rtc.on('stream-added', ({stream}) => {
      console.log("[agora] [stream-added] stream-added", stream.getId())
      this.$rtc._client.subscribe(stream)
    })
      
    this.$rtc.on('stream-subscribed', ({stream}) => {
      console.log("[agora] [stream-subscribed] stream-added", stream.getId())
      if (this.remoteStreams.length === 0 || !this.remoteStreams.find((it) => it.getId() !== stream.getId())) {
        this.remoteStreams = this.remoteStreams.concat(stream)
      }
    })

    this.$rtc.on('stream-removed', ({stream}) => {
      this.remoteStreams = this.remoteStreams.filter((it) => it.getId() !== stream.getId())
    })
    
    this.$rtc.on('peer-leave', ({uid}) => {
      this.remoteStreams = this.remoteStreams.filter((it) => it.getId() !== uid)
    })

    navigator.mediaDevices.ondevicechange = (event) => {
      this.rtc.getDevices().then((devices) => {
        this.cameraList = VideoInput(devices);
        this.microphoneList = AudioInput(devices);
        this.camera = this.cameraList[0] ? this.cameraList[0].deviceId : "";
        this.microphone = this.microphoneList[0]
          ? this.microphoneList[0].deviceId
          : "";
      })
    }
  },

  beforeDestroy() {
    if (!this.$rtc) return
    this.$rtc.removeAllListeners();
  }
};
</script>