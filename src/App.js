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
      MySwal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'New Room Created',
        showConfirmButton: false,
        timer: 1500
      })
      break;
    case ALERTS.ROOM_JOINED:
      MySwal.fire({
        position: 'top-end',
        icon: 'info',
        title: 'Room Joined',
        showConfirmButton: false,
        timer: 1500
      })
      break;
    case ALERTS.ALREADY_FILLED:
      MySwal.fire({
        position: 'top-end',
        icon: 'error',
        title: 'This Room is already full',
        showConfirmButton: false,
        timer: 1500
      })

      break;
    case ALERTS.PEER_CALLING:
      let { pickCallback, declineCallback } = data;
      MySwal.fire({
        title: 'Received a Call',
        text: "The other peer is trying to connect with you",
        imageUrl: 'https://i.giphy.com/media/5xtDarxurku3BqgIbjq/giphy.gif',
        imageWidth: 400,
        imageHeight: 200,
        imageAlt: 'Calling Simpson image',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes Pick Up!',
        cancelButtonText: 'Decline',
        allowOutsideClick: false,
      }).then((result) => {

        // call picked
        if (result.isConfirmed) {
          pickCallback();
        }
        // call declined
        else {
          declineCallback()
        }
      })
      break;
    case ALERTS.CALL_DAILING:
      let { cancelCallback } = data;
      MySwal.fire({
        title: 'Calling the Peer Now',
        text: "Wait until the receiver picks up the call",
        imageUrl: 'https://i.giphy.com/media/xT5LMzhyrAku8HzaQE/giphy.gif',
        imageWidth: 400,
        imageHeight: 200,
        imageAlt: 'Calling Simpson image',
        confirmButtonText: 'End Call',
        confirmButtonColor: '#d33',
        allowOutsideClick: false,
      }).then((result) => {
        // I dial but ended before establishing the call
        cancelCallback();

      })
      break;
    case ALERTS.CALL_CANCELLED: // will be trigged only on remote end 
      MySwal.fire({
        icon: 'error',
        title: 'Call Cancelled by Remote Peer',
      })
      break;
    case ALERTS.CALL_DECLINED: // will be trigged only on remote end
      MySwal.fire({
        icon: 'error',
        title: 'Call Declined by Remote Peer',
      })
      break;
    case ALERTS.CALL_ACCEPTED: // will be trigged only on remote end
    MySwal.fire({
      title: 'Call Picked: Connecting',
      didOpen: () => {
        Swal.showLoading()
      }
    })
      break;
    case ALERTS.CALL_ENDED: // will be trigged only on remote end 
    MySwal.fire({
      title: 'Call Ended!',
      text: 'The remote peer Hanged Up!', 
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
  const [localStream, setLocalStream] = useState(null);

  return (
    <StoreContext.Provider value={
      {
        roomName,
        cameraDeviceId,
        microphoneDeviceId,
        localStream, 
        setLocalStream,
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
