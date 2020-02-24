<template>
  <div class="agora-video-player" ref="player" :id="uid"></div>
</template>
<style>
.agora-video-player {
  height: 240px;
  width: 320px;
}
</style>
<script>
export default {
  name: 'stream-player',
  props: [
    'stream',
    'uid',
    'audio',
    'video',
  ],
  mounted () {
    this.$nextTick(function () {
      if (this.stream && !this.stream.isPlaying()) {
        this.stream.play(`${this.uid}`, {fit: 'cover'}, (err) => {
          if (err && err.status !== 'aborted') {
            console.warn('trigger autoplay policy')
          }
        })
      }
    })
  },
  beforeDestroy () {
    if (this.stream) {
      if (this.stream.isPlaying()) {
        this.stream.stop()
      }
    }
  }
}
</script>