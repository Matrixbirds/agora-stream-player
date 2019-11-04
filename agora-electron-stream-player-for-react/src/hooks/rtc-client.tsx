import React, {useMemo} from 'react';
import {default as AgoraRTC} from 'agora-electron-sdk';

const APP_ID = 'Your Agora.io APP_ID';

class RTCClient {
  public static engine: any = null;

  static initRtcEngine () {
    if(this.engine === null) {
      console.log("really initRtcEngine");
      this.engine = new AgoraRTC();
      this.engine.initialize(APP_ID);
      this.engine.enableVideo();
      this.engine.enableWebSdkInteroperability(true);
      this.engine.setVideoEncoderConfiguration({width: 480, height: 320, frameRate: 15, bitrate: 0});
    }
    return this.engine;
  }
}

const engine = RTCClient.initRtcEngine();

export default function useEngine () {

  const client = useMemo(() => {
    const _client = engine;
    return _client;
  }, []);

  return client;
}