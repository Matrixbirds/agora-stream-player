import React, { useMemo, useState, useEffect} from 'react';
import useRtcClient from '../hooks/rtc-client';

export default function StreamPlayerElectron(props: {uid: number, domId: string, preview: boolean}) {

  const client = useRtcClient();

  useEffect(() => {
    const dom = document.querySelector(`#${props.domId}`);
    if (dom) {
      if (props.preview) {
        client.setupLocalVideo(dom);
        client.startPreview();
      } else {
        client.subscribe(props.uid, dom);
        client.setupViewContentMode(props.uid, 1);
      }
    }
  }, []);

  return (
    <div id={props.domId} className="agora-stream-player">

    </div>
  )
}