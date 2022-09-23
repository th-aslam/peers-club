import './Call.css';
import "bootstrap/dist/css/bootstrap.css";


import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';

import { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../../contexts/SocketContext';
import { StoreContext } from '../../contexts/StoreContext';
import { SDP_CONSTRAINTS } from '../../utils/constants';




export default function Call(params) {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);

    const [cameraList, setcameraList] = useState([]);
    const [micsList, setMicsList] = useState([]);
    const [pc, setPc] = useState(null);
    const {
        roomName,
        cameraDeviceId,
        microphoneDeviceId,
        setRoomName,
        setCameraDeviceId,
        setMicrophoneDeviceId
    } = useContext(StoreContext);

    const {
        sendPing,
        sendMessage,
        isInitiator,
        isPicked,
        haveOffer,
        haveAnswer,
        haveCandidate,
        canInitiateCall,
        callRinging,
        callHappening,
        setCallHappening } = useContext(SocketContext);

    useEffect(() => {
        async function getCameraStreamWithDeviceId() {
            try {
                let stream = await navigator.mediaDevices.getUserMedia({
                    audio: microphoneDeviceId !== '' ? { deviceId: microphoneDeviceId } : true,
                    video: cameraDeviceId !== '' ? { deviceId: cameraDeviceId } : true
                })
                setLocalStream(stream);
            } catch (error) {
                alert(error.message);
            }
        }
        getCameraStreamWithDeviceId();
        return () => {
            // sendMessage('bye');
        }
    }, [microphoneDeviceId, cameraDeviceId])

    // The caller will start RTCPeerConnection from this event 
    useEffect(() => {
        callHappening && maybeStart()
    }, [callHappening])

    // The receiver will fire this event when accepts the call to do RTCPeerConnection
    useEffect(() => {
        isPicked && maybeStart()
    }, [isPicked])

    useEffect(() => {
        if (haveOffer !== null) {
            pc.setRemoteDescription(new RTCSessionDescription(haveOffer));
            doAnswer();
        }

    }, [haveOffer])

    useEffect(() => {
        if (haveAnswer !== null) {
            pc.setRemoteDescription(new RTCSessionDescription(haveAnswer));
        }

    }, [haveAnswer])

    useEffect(() => {
        if (haveCandidate !== null) {
            const candidate = new RTCIceCandidate({
                sdpMLineIndex: haveCandidate.label,
                candidate: haveCandidate.candidate,
            });
            pc.addIceCandidate(candidate);
        }

    }, [haveCandidate])


    const doCall = () => {
        console.log('Sending offer to peer');
        pc.createOffer([SDP_CONSTRAINTS])
            .then((offer) => setLocalAndSendMessage(offer))
            .catch(handleCreateOfferError);
    }

    const maybeStart = () => {
        console.log('>>>>>>> maybeStart() ', callHappening, localStream, canInitiateCall);
        if (!callHappening && typeof localStream !== 'undefined' && canInitiateCall) {
            console.log('>>>>>> creating peer connection');
            createPeerConnection();
            pc.addStream(localStream);
            console.log('isInitiator', isInitiator);
            if (isInitiator) {
                doCall();
            }
        }
    }

    function createPeerConnection() {
        try {
            let pc = new RTCPeerConnection(/* Add iceServers here**/);
            pc.onicecandidate = handleIceCandidate;
            pc.onaddstream = handleRemoteStreamAdded;
            pc.onremovestream = handleRemoteStreamRemoved;
            console.log('Created RTCPeerConnnection');
            setPc(pc);
        } catch (e) {
            console.log(`Failed to create PeerConnection, exception: ${e.message}`);
            alert('Cannot create RTCPeerConnection object.');
        }
    }

    function handleIceCandidate(event) {
        console.log('icecandidate event: ', event);
        if (event.candidate) {
            sendMessage({
                type: 'candidate',
                label: event.candidate.sdpMLineIndex,
                id: event.candidate.sdpMid,
                candidate: event.candidate.candidate,
            });
        } else {
            console.log('End of candidates.');
        }
    }

    function handleRemoteStreamAdded(event) {
        console.log('Remote stream added.');
        setRemoteStream(event.stream);

    }

    function handleRemoteStreamRemoved(event) {
        console.log('Remote stream removed. Event: ', event);
    }

    function handleCreateOfferError(event) {
        console.log('createOffer() error: ', event);
    }

    function setLocalAndSendMessage(sessionDescription) {
        // Set Opus as the preferred codec in SDP if Opus is present.
        //  sessionDescription.sdp = preferOpus(sessionDescription.sdp);
        pc.setLocalDescription(sessionDescription);
        console.log('setLocalAndSendMessage sending message', sessionDescription);
        sendMessage(sessionDescription);
    }

    function doAnswer() {
        console.log('Sending answer to peer.');
        pc.createAnswer()
            .then((answer) => setLocalAndSendMessage(answer))
            .catch(onCreateSessionDescriptionError);
    }

    function onCreateSessionDescriptionError(error) {
        console.error(`Failed to create session description: ${error.toString()}`);
    }

    function stop() {
        setCallHappening(false);
        pc.close();
        setPc(null);
    }

    function handleRemoteHangup() {
        console.log('Session terminated.');
        stop();
        isInitiator = false;
    }

    const handleButtonsClick = (whichButton) => {
        switch (whichButton) {
            case 'init-call':
                sendPing('begin call', roomName)
                break;

            case 'hang-up':
                sendPing('hang call', roomName)
                break;

            case 'toggle-mic':
                // mute my mic & notify
                sendPing('toggle mic', roomName)
                break;

            case 'voice-change':
                // AudioContext logic comes here
                break;

            default:
                break;
        }

    }

    return (

        <Container>
            <h2 className='text-center'>Calling Zone</h2>
            <p className='text-center'>Room Name: {roomName}</p>


            <Row>
                <Col>
                    <div className='d-flex justify-content-center'>
                        <div className="mb-3 d-grid gap-2">
                            <label className='fw-semibold'>Local Stream</label>
                            <div className='container'>
                                <div className='col'>
                                    <VideoPlayer className='rounded mx-auto d-block col' stream={localStream} isRemoteStream={false} />
                                </div>
                            </div>
                        </div>
                    </div>
                </Col>
                <Col>
                    <div className='d-flex justify-content-center'>
                        <div className="mb-3 d-grid gap-2">
                            <label className='fw-semibold'>Remote Stream</label>
                            <div className='container'>
                                <div className='col'>
                                    {
                                        callHappening ? <VideoPlayer className='rounded mx-auto d-block col' stream={remoteStream} isRemoteStream={true} /> :
                                            <img src='https://via.placeholder.com/480x320.png?text=Waiting+For+Call+to+Initiate' alt='Just a place holder'></img>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </Col>

            </Row>

            <Row>
                <div className='d-flex align-items-center justify-content-center'>
                    <Button variant="primary" className="m-2"
                        onClick={e => handleButtonsClick('init-call')}
                        disabled={!canInitiateCall}
                    >
                        Call
                    </Button>
                    <Button variant="primary" className="m-2"
                        onClick={e => handleButtonsClick('hang-up')}
                        disabled={!callHappening}
                    >
                        Hang up
                    </Button>
                    <Button variant="primary" className="m-2"
                        onClick={e => handleButtonsClick('mic-mute')}
                        disabled={true}
                    >
                        Mic Mute
                    </Button>

                    <Button variant="primary" className="m-2"
                        onClick={e => handleButtonsClick('voice-change')}
                        disabled={true}
                    >
                        Activate Voice Changer
                    </Button>
                </div>



            </Row>
        </Container>

    )
}