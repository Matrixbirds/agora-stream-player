import React, {useMemo, useState, useEffect} from 'react';
import {default as AgoraRTC} from 'agora-electron-sdk';

const APP_ID = 'Your Agora.io appID';
export class RTCClient {
  public static engine: any = null;

  public static streams: any[];

  public static _uids: number[];

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

  static createScreenSharing(windowId: any, captureFreq: number, rect: { left: number; right: number; top: number; bottom: number }, bitrate: number) {
    this.engine.startScreenCapture2(windowId, captureFreq, rect, bitrate);
    this.engine.videoSourceSetVideoProfile(43, false);
    this.engine.startScreenCapturePreview();
  }

  static stopScreenCapture2() {
    this.engine.stopScreenCapture2();
  }

  static join(channel: string) {
    this.engine.setChannelProfile(1);
    this.engine.setAudioProfile(0, 1);
    this.engine.setClientRole(1);
    this.engine.setAudioProfile(0, 1);
    this.engine.joinChannel(null, channel, '', 0);
  }
}

const engine = RTCClient.initRtcEngine();

export default function useEngine () {

  const [uids, setUids] = useState<number[]>([]);

  const client = useMemo(() => {
    const _client = engine;
    return _client;
  }, []);

  useEffect(() => {
    if (client) {
      client.on('addStream', (uid: number, elapsed: number) => {
        setUids(uids.concat(uid));
      })
  
      client.on('removeStream', (uid: number, elapsed: number) => {
        setUids(uids.filter((item: number) => item === uid));
      })

      return () => {
        client.off('addStream', () => {});
        client.off('removeStream', () => {});
      }
    }
  }, [client]);

  const cameraList = useMemo(() => {
    return client.getVideoDevices();
  }, [client]);

  const microphoneList = useMemo(() => {
    return client.getAudioRecordingDevices();
  }, [client]);

  const speakerList = useMemo(() => {
    return client.getAudioPlaybackDevices();
  }, [client]);

  return {
    client,
    uids,
    setUids,
    cameraList,
    microphoneList,
    speakerList
  }
}