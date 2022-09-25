import React, { useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { SocketContext } from '../contexts/SocketContext';
import { StoreContext } from '../contexts/StoreContext';
import { ALERTS } from './constants';

const socket = io("ws://localhost:8001"); //https://peer-club-backend.pages.dev


export default function SocketController(props) {

    const { children } = props;
    const [isInitiator, setIsInitiator] = useState(false);
    const [isChannelReady, setIsChannelReady] = useState(false);
    const [canInitiateCall, setCanInitiateCall] = useState(false);
    const [callRinging, setCallRinging] = useState(false);
    const [callHappening, setCallHappening] = useState(false);

    //callbacks triggers
    const [isPicked, setIsPicked] = useState(false);
    const [isDeclined, setIsDeclined] = useState(false);
    const [isCallEnded, setisCallEnded] = useState(false);

    // RTCPeerCon & SDP envents
    const [haveIceServers, setHaveIceServers] = useState(null);
    const [haveOffer, setHaveOffer] = useState(null);
    const [haveAnswer, setHaveAnswer] = useState(null);
    const [haveCandidate, setHaveCandidate] = useState(null);

    const [isRemoteMute, setisRemoteMute] = useState(false);

    // const [call, setcall] = useState(initialState);
    const { roomName, setRoomName, showAlert, hideAlert } = useContext(StoreContext);
    let stopDoublePropagation = false;

    useEffect(() => {
        if (stopDoublePropagation) return;
        stopDoublePropagation = true;
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

        socket.on('iceservers', (iceServers) => {
            console.warn('Got IceServers: ', iceServers);
            setHaveIceServers(iceServers);
        });

        socket.on('received-call', (data) => {
            let { message, iceServers } = data;
            console.log('ClientRecvLog: Seems like I received a call');
            console.log('ClientRecvLog: Lets see what Server data is: ', message);
            console.warn(iceServers);
            setHaveIceServers(iceServers);
            setCanInitiateCall(false); // Stop client to make new calls until ringing 
            setCallRinging(true);
            showAlert(ALERTS.PEER_CALLING, {
                pickCallback,
                declineCallback,
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

        socket.on('remote-accepts-call', (data) => {
            console.log('ClientRecvLog: Remote accepts this call, should initiate RTCPeerConnection');
            console.log('ClientRecvLog: Lets see what Server data is: ', data);
            setCallRinging(false);
            setCallHappening(true);
            // setIsPicked(true);
            showAlert(ALERTS.CALL_ACCEPTED);
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

        socket.on('remote-toggle-mic', (data) => {
            let { message } = data;
            setisRemoteMute(message);
        });

        socket.on('log', (array) => {
            console.log('ClientRecvLog: ', ...array);
        });

        // This client receives a message
        socket.on('message', (message) => {
            // console.log('Client received message:', message);
            if (message === 'got user media') {
                // maybeStart();
            } else if (message.type === 'offer') {
                setHaveOffer(message);
                // pc.setRemoteDescription(new RTCSessionDescription(message));
                // doAnswer();
            } else if (message.type === 'answer') {
                console.error('answer aya tha', message);
                setHaveAnswer(message);
                // pc.setRemoteDescription(new RTCSessionDescription(message));
            } else if (message.type === 'candidates') {
                let remoteCandifates = message.candidatesList;
                remoteCandifates.forEach(candidate => {
                    setHaveCandidate(candidate);
                });

                // const candidate = new RTCIceCandidate({
                //     sdpMLineIndex: message.label,
                //     candidate: message.candidate,
                // });
                // pc.addIceCandidate(candidate);
            } else if (message === 'bye') {
                setisCallEnded(true);
                // handleRemoteHangup();
            }
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('pong');
        };
    }, []);

    useEffect(() => {
        if (isDeclined) {
            socket.emit('call-decline', roomName);
            console.log('ClientSentLog: Declining Call, do not want to pick this call with other peer in room', roomName);
            setCanInitiateCall(true);
        }
    }, [isDeclined]);

    useEffect(() => {
        if (isPicked) {
            socket.emit('call-accept', roomName);
            console.log('ClientSentLog: Accepting Call, waiting for Offer SDP cycle to start on socket.on("message")', roomName);
            showAlert(ALERTS.CALL_ACCEPTED);
        }
    }, [isPicked]);

    useEffect(() => {
        callHappening && hideAlert()
    }, [callHappening]);

    useEffect(() => {
        if (isCallEnded) {
            showAlert(ALERTS.CALL_ENDED);
            setIsInitiator(false);
            setIsChannelReady(false);
            setCanInitiateCall(false);
            setCallRinging(false);

            setIsPicked(false);
            setIsDeclined(false);

            setHaveIceServers(null);
            setHaveOffer(null);
            setHaveAnswer(null);
            setHaveCandidate(null);
            setRoomName('');
            setTimeout(() => {
                setisCallEnded(false);
            }, 3000);
        }

    }, [isCallEnded])


    const pickCallback = () => {
        setIsPicked(true);
    }

    const declineCallback = () => {
        setIsDeclined(true);
    }

    const cancelCallback = () => {
        socket.emit('call-cancel', roomName);
        console.log('ClientSentLog: Cancelling this call with other peer in room', roomName);
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
            case 'toggle mic':
                socket.emit('peer-mute', data);
                console.log('ClientSentLog: Signify my Mute status to other peer in room', data);
                break;
            default:
                break;
        }
    }

    const sendMessage = (message) => {
        let payload = { room: roomName, message }
        console.log('Client sending message: ',);
        socket.emit('message', payload);
    }

    return (
        <SocketContext.Provider value={{
            sendPing, sendMessage,
            isChannelReady, isInitiator, canInitiateCall, callRinging, callHappening, isPicked, isCallEnded, isRemoteMute,
            haveIceServers, haveOffer, haveAnswer, haveCandidate,
            setisCallEnded,
            setCallHappening,
        }}>
            {children}
        </SocketContext.Provider>
    );
}
