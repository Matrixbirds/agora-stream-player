import React, {useState, useMemo, useEffect} from 'react';
import AgoraRTC from 'agora-rtc-sdk';

const isDev = process.env.REACT_APP_ENV === 'development';

class Log {
  static debug (...args: any[]) {
    isDev && console.log('DEBUG StreamPlayer: ', ...args);
  }
}

interface AgoraStreamPlayerProps {
  preview?: boolean
  uid: number
  stream?: any
  muteVideo?: boolean
  muteAudio?: boolean
  domID: string
}

export default function AgoraStreamPlayer(props: AgoraStreamPlayerProps) {

  const {domID, uid, preview, muteAudio, muteVideo} = props;

  const _stream = preview ? null : props.stream;

  const stream = useMemo(() => {
    const currentStream = preview ? AgoraRTC.createStream({streamID: uid, video: true, audio: true}) : props.stream;
    return currentStream;
  }, [uid, preview, _stream]);

  const [state, setState] = useState(false);

  useEffect(() => {
    if (stream !== null) {
      preview && stream.init(() => {
        setState(true);
      }, (err: any) => {
        setState(false);
      })
      !preview && setState(true);
    }
  }, [stream, preview]);

  useEffect(() => {
    if (state) {
      if (stream.isPlaying() === false) {
        stream.play(`${domID}`, {fit: 'cover', muted: false}, (err: any) => {
          if (err && err.status === 'aborted') {
            Log.debug('err', err);
          }
        });
      }
    }
  }, [state, stream]);


  useEffect(() => {
    if (state) {
      Log.debug(`muteAudio ${muteAudio}`, `muteVideo ${muteVideo}`);
      if (muteAudio) {
        stream.muteAudio();
      } else {
        stream.unmuteAudio();
      }
  
      if (muteVideo) {
        stream.muteVideo();
      } else {
        stream.unmuteVideo();
      }
    }
  }, [state, stream, muteVideo, muteAudio]);

  useEffect(() => {
    return () => {
      stream.close();
    }
  }, []);

  return (
    <div id={domID} className="agora-stream-player"></div>
  )
}