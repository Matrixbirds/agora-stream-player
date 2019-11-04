import React from 'react';

import * as AgoraRTC from 'agora-electron-sdk';

export default function StreamPlayerElectron() {

  // @ts-ignore
  window.AgoraRTC = AgoraRTC;
  console.log(AgoraRTC);

  return (
    <div></div>
  )
}