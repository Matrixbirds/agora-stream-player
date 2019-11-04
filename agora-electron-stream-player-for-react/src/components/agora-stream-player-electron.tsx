import React, { useMemo, useState, useEffect} from 'react';
import useRtcClient from '../hooks/rtc-client';

export default function StreamPlayerElectron(props: {uid: number, domId: string, preview: boolean}) {

  const {client} = useRtcClient();

  useEffect(() => {
    const dom = document.querySelector(`#${props.domId}`);
    if (dom) {
      if (props.preview) {
        client.setupLocalVideo(dom);
        client.setVideoRenderDimension(3, props.uid, 300, 300);
        client.setupViewContentMode('local', 0);
        client.startPreview();
      } else {
        client.subscribe(props.uid, dom);
        client.setupViewContentMode(props.uid, 0);
      }
    }
  }, []);

  return (
    <div id={props.domId} className="agora-stream-player">

    </div>
  )
}