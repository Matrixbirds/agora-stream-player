import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import StreamComponent from './components/agora-stream-player';
import './App.css';

const App: React.FC = () => {

  const [uids, setUidList] = useState<number[]>([]);

  const [value, setValue] = useState<number>(1);

  const handleChange = (evt: any) => {
    setValue(evt.target.value);
  }

  const add = (evt: any) => {
    setUidList(uids.concat(+value));
  }

  const remove = (evt: any) => {
    const list = uids.filter(
      (it: number) => 
        it !== +value
    );
    setUidList(list);
  }

  return (
    <div className="App">
      <div className="player">
        {uids.map((item: any, idx: number) => (
          <StreamComponent preview={true} uid={item} domID={`preview-${item}`} key={idx} />
        ))}
      </div>
      <div>
        <button onClick={add}>add</button>
        <input type="number" defaultValue={value} onChange={handleChange}/>
        <button onClick={remove}>remove</button>
      </div>
    </div>
  );
}

export default App;
