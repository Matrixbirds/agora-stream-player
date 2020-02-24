import AgoraRTC from 'agora-rtc-sdk'
import {EventEmitter} from 'events'

const DEFAULT_APP_ID = process.env.VUE_APP_AGORA_APP_ID

export class RTCClient extends EventEmitter {

  constructor () {
    super();
    this.config = {
      mode: 'live',
      codec: 'vp8',
      appId: DEFAULT_APP_ID
    }
    this._localStream = undefined
    this._client = undefined
  }

  initClient() {
    return new Promise((resolve, reject) => {
      const _client = AgoraRTC.createClient({
        mode: this.config.mode,
        codec: this.config.codec
      })

      const onSuccess = () => {
        this.subscribeClient(_client)
        resolve(_client)
      }

      const onError = (err) => {
        console.warn(err)
        this.unsubscribeClient(_client)
        reject('init failed')
      }
      console.log("[agora-vue] appId", this.config.appId)
      _client.init(this.config.appId, onSuccess, onError);
    });
  }

  async join({token, uid, cname}) {
    if (!this._client) return console.warn("NO _client FOUND")
    console.log("[agora-vue] token ", token, " uid ", uid, " cname, ", cname)
    return new Promise((resolve, reject) => {
      const _uid = isNaN(+uid) ? uid : +uid;
      typeof _uid !== 'number' && console.warn("We are not recommend use string uid")
      this._client.join(token, cname, _uid, resolve, reject)
    })
  }

  subscribeStreamEvents = (stream) => {
    stream.on('accessAllowed', (evt) => {
      this.emit('accessAllowed', {evt, uid: stream.getId()})
    })
  }

  unsubscribeStreamEvents = (stream) => {
    stream.removeEventListener('accessAllowed', (evt) => {})
  }

  subscribeClient (client) {
    client.on('connection-state-change', (evt) => {
      this.emit('connection-state-change', evt)
    })
    client.on('error', (evt) => {
      this.emit('error', evt)
    })
    client.on('exception', (evt) => {
      this.emit('exception', evt)
    })
    client.on('stream-added', (evt) => {
      this.emit('stream-added', evt)
    })
    client.on('stream-subscribed', (evt) => {
      this.emit('stream-subscribed', evt)
    })
    client.on('stream-removed', (evt) => {
      this.emit('stream-removed', evt)
    })
    client.on('peer-online', (evt) => {
      this.emit('peer-online', evt)
    })
    client.on('peer-leave', (evt) => {
      this.emit('peer-leave', evt)
    })
    client.on('mute-audio', (evt) => {
      this.emit('mute-audio', evt)
    })
    client.on('unmute-audio', (evt) => {
      this.emit('unmute-audio', evt)
    })
    client.on('mute-video', (evt) => {
      this.emit('mute-video', evt)
    })
    client.on('unmute-video', (evt) => {
      this.emit('unmute-video', evt)
    })
  }

  unsubscribeClient = (client) => {
    client.off('connection-state-change', (evt) => {})
    client.off('error', (evt) => {})
    client.off('exception', (evt) => {})
    client.off('stream-added', (evt) => {})
    client.off('stream-removed', (evt) => {})
    client.off('peer-online', (evt) => {})
    client.off('peer-leave', (evt) => {})
    client.off('mute-audio', (evt) => {})
    client.off('unmute-audio', (evt) => {})
    client.off('mute-video', (evt) => {})
    client.off('unmute-video', (evt) => {})
  }

  async createLocalStream(streamSpec) {
    let localStream = AgoraRTC.createStream(streamSpec)
    const initStreamPromise = new Promise((resolve, reject) => {

      const onSuccess = () => {
        this.subscribeStreamEvents(localStream)
        resolve(localStream)
      }

      const onError = (err) => {
        reject(err)
      }
      localStream.init(onSuccess, onError)
    })
    return initStreamPromise
  }

  destroyLocalStream(stream) {
    if (!stream) return
    this.unsubscribeStreamEvents(stream)
    stream.isPlaying() && stream.stop()
    stream.close()
  }

  async publishLocalStream(streamSpec) {
    if (!this._client) return console.warn("NO _client FOUND")
    const localStream = await this.createLocalStream(streamSpec);
    const publishStreamPromise = new Promise((resolve, reject) => {
      const onPubSuccess = () => {
        this.subscribeStreamEvents(localStream)
        this._localStream = localStream
        resolve(this._localStream)
      }

      const onPubError = (err) => {
        this.destroyLocalStream(this._localStream)
        this._localStream = undefined
        reject(err)
      }
      this._client.on('stream-published', onPubSuccess)
      this._client.publish(localStream, onPubError)
    })
    return publishStreamPromise
  }

  async joinRTC({token, uid, cname}, streamConfig) {
    try {
      this._client = await this.initClient()
      let _uid = await this.join({token, uid, cname})
      const streamSpec = {streamID: _uid, ...streamConfig}
      console.log("[agora-vue] streamSpec: ", streamSpec)
      return this.publishLocalStream(streamSpec)
    } catch (err) {
      if (this._client) {
        this.unsubscribeClient(this._client)
        this._client = undefined
      }
    }
  }

  async leaveRTC() {
    if (this._localStream) {
      this.destroyLocalStream(this._localStream)
    }
    if (!this._client) return console.warn('Not client found')
    this._client.leave()
    console.log("[agora-vue] client leave")
    this.unsubscribeClient(this._client)
  }

  async getDevices() {
    const tmpStream = await this.createLocalStream({
      video: false,
      audio: true,
      screen: false,
      audioScreen: false,
      microphoneId: '',
      cameraId: ''
    })
    try {
      return new Promise((resolve, reject) => {
        AgoraRTC.getDevices((devices) => {
          const _devices = []
          devices.forEach((item) => {
            _devices.push({deviceId: item.deviceId, kind: item.kind, label: item.label})
          })
          resolve(_devices)
        }, (err) => {
          reject(err)
        })
      })
    } finally {
      this.destroyLocalStream(tmpStream)
    }
  }
}

export const VideoInput = (devices) => {
  return devices.filter(it => it.kind === "videoinput");
}

export const VideoOutput = (devices) => {
  return devices.filter(it => it.kind === "videooutput");
}

export const AudioInput = (devices) => {
  return devices.filter(it => it.kind === "audioinput");
}

export const AudioOutput = (devices) => {
  return devices.filter(it => it.kind === "audiooutput");
}