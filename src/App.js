// import './App.css';

import React, { useState, useContext } from 'react'
import { Route, Routes, BrowserRouter } from 'react-router-dom'
import Index from './views/CreateOrJoin/CreateOrJoin'
import Call from './views/Call/Call'

import SocketController from "./utils/SocketController";
import { StoreContext } from './contexts/StoreContext';
import { ALERTS } from './utils/constants';

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'


const MySwal = withReactContent(Swal)



const showAlert = (type, data) => {
  switch (type) {
    case ALERTS.CREATE_OR_JOIN_SPINNER:
      MySwal.fire({
        title: <p>Please Wait</p>,
        didOpen: () => {
          MySwal.showLoading()
        },
      })
      break;
    case ALERTS.NEW_ROOM_CREATED:
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'New Room Created',
        showConfirmButton: false,
        timer: 1500
      })
      break;
    default:
      break;
  }
}

const hideAlert = () => {
  MySwal.close();
}

function App() {
  const [roomName, setRoomName] = useState("");
  const [cameraDeviceId, setCameraDeviceId] = useState("");
  const [microphoneDeviceId, setMicrophoneDeviceId] = useState("");


  return (
    <StoreContext.Provider value={
      {
        roomName,
        cameraDeviceId,
        microphoneDeviceId,
        setRoomName,
        setCameraDeviceId,
        setMicrophoneDeviceId,

        showAlert, hideAlert
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
