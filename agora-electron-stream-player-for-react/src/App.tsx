import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import StreamPlayer from './components/agora-stream-player-electron';
import './App.css';
import useEngine, {RTCClient} from './hooks/rtc-client';

const App: React.FC = () => {

  const {uids, setUids} = useEngine();

  const [join, setJoin] = useState<boolean>(false);

  useEffect(() => {
    RTCClient.join('agora.io-test');
    setJoin(true);
    // const windowId = RTCClient.engine.getScreenWindowsInfo()[0];
    // RTCClient.createScreenSharing(windowId.windowId, 15, {left: 0, top: 0, right: 0, bottom: 0}, 1);
  }, []);

  useEffect(() => {
    if (join) {

    }
  },[join]);

  return (
    <div className="flex-container">
      <StreamPlayer uid={0} domId="local" preview={true}/>
      {uids.map(
        (uid: number, idx: number) => 
          <StreamPlayer uid={uid} domId={`remote-${uid}`} key={idx} preview={false}/>
        )}
    </div>
  );
}

export default App;
