// import './App.css';

import React, { useState, useContext } from 'react'
import { Route, Routes, BrowserRouter } from 'react-router-dom'
import Index from './views/CreateOrJoin/CreateOrJoin'
import Call from './views/Call/Call'

import SocketController from "./utils/SocketController";
import { StoreContext } from './contexts/StoreContext';

const defaultState = {
  loading: false,
  roomName: '',
  microphoneId: '',
  cameraId: '',
}

function App() {
  const [roomName, setRoomName] = useState("");
  const [cameraDeviceId, setCameraDeviceId] = useState("");
  const [microphoneDeviceId, setMicrophoneDeviceId] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <StoreContext.Provider value={
      {
        roomName,
        cameraDeviceId,
        microphoneDeviceId,
        setRoomName,
        setCameraDeviceId,
        setMicrophoneDeviceId
      }}>
      <SocketController>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/call" element={<Call />} />
          </Routes>
        </BrowserRouter>
      </SocketController>
    </StoreContext.Provider>


  );
}

export default App;
