import React, { useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { SocketContext } from '../contexts/SocketContext';
import { StoreContext } from '../contexts/StoreContext';

const socket = io("ws://localhost:8001");


export default function SocketController(props) {
    const { children } = props;
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [lastPong, setLastPong] = useState(null);
    const [isInitiator, setIsInitiator] = useState(false);
    const [isChannelReady, setIsChannelReady] = useState(false);

    const { roomName } = useContext(StoreContext);


    useEffect(() => {
         
        socket.on('created', (roomObject) => {
            console.log(`Created room ${roomObject}`);
            setIsInitiator(true);
            setIsChannelReady(true);
        });

        socket.on('full', (roomObject) => {
            console.log(`Room ${roomObject} is full`);
        });

        socket.on('join', (roomObject) => {
            console.log(`Another peer made a request to join room ${roomObject}`);
            console.log(`This peer is the initiator of room ${roomObject}!`);
            setIsChannelReady(true);
        });

        socket.on('joined', (roomObject) => {
            console.log(`joined: ${roomObject}`);
            setIsChannelReady(true);
        });

        socket.on('log', (array) => {
            console.log(...array);
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

    const sendPing = (type, data) => {
        switch (type) {
            case 'create or join':
                socket.emit('create or join', roomName);
                console.log('Attempted to create or  join room', roomName);
                break;

            default:
                break;
        }
    }

    return (
        <SocketContext.Provider value={{ sendPing, isChannelReady, isInitiator }}>
            {children}
        </SocketContext.Provider>
    );
}
