import React, { useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { SocketContext } from '../contexts/SocketContext';
import { StoreContext } from '../contexts/StoreContext';
import { ALERTS } from './constants';

const socket = io("ws://localhost:8001");


export default function SocketController(props) {
    const { children } = props;
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [lastPong, setLastPong] = useState(null);
    const [isInitiator, setIsInitiator] = useState(false);
    const [isChannelReady, setIsChannelReady] = useState(false);
    const [canInitiateCall, setCanInitiateCall] = useState(false);
    const [callRinging, setCallRinging] = useState(false);
    const [callHappening, setCallHappening] = useState(false);
    // const [call, setcall] = useState(initialState);
    const { roomName, showAlert, hideAlert } = useContext(StoreContext);


    useEffect(() => {

        socket.on('created', (roomObject) => {
            console.log(`ClientRecvLog: Created room ${roomObject}`);
            setIsInitiator(true);
            setTimeout(() => {
                showAlert(ALERTS.NEW_ROOM_CREATED);
            }, 1500);

        });

        socket.on('full', (roomObject) => {
            console.log(`ClientRecvLog: Room ${roomObject} is full`);
            setTimeout(() => {
                showAlert(ALERTS.ALREADY_FILLED);
            }, 1500);
        });

        socket.on('join', (roomObject) => {
            console.log(`ClientRecvLog: Another peer made a request to join room ${roomObject}`);
            console.log(`ClientRecvLog: This peer is the initiator of room ${roomObject}!`);
            // setIsChannelReady(true);
        });

        socket.on('joined', (roomObject) => {
            console.log(`ClientRecvLog: joined: ${roomObject}`);
            setIsChannelReady(true);
            setTimeout(() => {
                showAlert(ALERTS.ROOM_JOINED);
            }, 1500);
        });

        socket.on('ready', () => {
            console.log('ClientRecvLog: Peers now ready for initiating call');
            setTimeout(() => {
                // adding delay to accomodate the other peer UI transition to Call screen
                setCanInitiateCall(true);
            }, 4500);

        });

        socket.on('received-call', (data) => {
            console.log('ClientRecvLog: Seems like I received a call');
            console.log('ClientRecvLog: Lets see what Server data is: ', data);
            setCanInitiateCall(false); // Stop client to make new calls until ringing 
            setCallRinging(true);
            showAlert(ALERTS.PEER_CALLING, {
                pickCallback,
                declineCallback
            });
        });

        socket.on('remote-cancels-call', (data) => {
            console.log('ClientRecvLog: Remote cancelled the current ringing call');
            console.log('ClientRecvLog: Lets see what Server data is: ', data);
            setCanInitiateCall(true); // Enable client to make new calls now 
            setCallRinging(false);
            showAlert(ALERTS.CALL_CANCELLED);
        });

        socket.on('remote-declines-call', (data) => {
            console.log('ClientRecvLog: Remote declines my current ringing call');
            console.log('ClientRecvLog: Lets see what Server data is: ', data);
            setCanInitiateCall(true); // Enable client to make new calls now 
            setCallRinging(false);
            showAlert(ALERTS.CALL_DECLINED);
        });

        socket.on('remote-ends-call', (data) => {
            console.log('ClientRecvLog: Remote terminated the call');
            console.log('ClientRecvLog: Lets see what Server data is: ', data);
            // setCanInitiateCall(true); // Enable client to make new calls now 
            // setCallRinging(false);
            // showAlert(ALERTS.CALL_ENDED, {
            //     pickCallback: () => {

            //     },
            //     declineCallback: () => {

            //     }
            // });
        });

        socket.on('log', (array) => {
            console.log('ClientRecvLog: ', ...array);
        });

        // This client receives a message
        socket.on('message', (message) => {
            console.log('Client received message:', message);
            // if (message === 'got user media') {
            //     // maybeStart();
            // } else if (message.type === 'offer') {
            //     // if (!isInitiator && !isStarted) {
            //     //     maybeStart();
            //     // }
            //     // pc.setRemoteDescription(new RTCSessionDescription(message));
            //     // doAnswer();
            // } else if (message.type === 'answer' && isStarted) {
            //     pc.setRemoteDescription(new RTCSessionDescription(message));
            // } else if (message.type === 'candidate' && isStarted) {
            //     const candidate = new RTCIceCandidate({
            //         sdpMLineIndex: message.label,
            //         candidate: message.candidate,
            //     });
            //     pc.addIceCandidate(candidate);
            // } else if (message === 'bye' && isStarted) {
            //     handleRemoteHangup();
            // }
        });


        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('pong');
        };
    }, []);

    const pickCallback = () => {
        // setCanInitiateCall(true);
        // socket.emit('call-cancel', roomName);
        // console.log('ClientSentLog: Cancelling this call with other peer in room', roomName);
    }

    const cancelCallback = () => {
        socket.emit('call-cancel', roomName);
        console.log('ClientSentLog: Cancelling this call with other peer in room', roomName);
        setCanInitiateCall(true);
    }

    const declineCallback = () => {
        socket.emit('call-decline', roomName);
        console.log('ClientSentLog: Declining Call, do not want to pick this call with other peer in room', roomName);
        setCanInitiateCall(true);
    }

    const endCallback = () => {
        setCanInitiateCall(true);
        socket.emit('end-call', roomName);
        console.log('ClientSentLog: Ending the call with other peer in room', roomName);
    }



    const sendPing = (type, data) => {
        switch (type) {
            case 'create or join':
                socket.emit('create or join', roomName);
                console.log('ClientSentLog: Attempted to create or  join room', roomName);
                break;
            case 'begin call':
                setCanInitiateCall(false); // Lock the Call button
                socket.emit('call-peer', roomName);
                console.log('ClientSentLog: Attempted to call other peer in room', roomName);
                showAlert(ALERTS.CALL_DAILING, { cancelCallback });
                break;
            default:
                break;
        }
    }

    return (
        <SocketContext.Provider value={{ sendPing, isChannelReady, isInitiator, canInitiateCall, callRinging, callHappening }}>
            {children}
        </SocketContext.Provider>
    );
}
