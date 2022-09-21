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



export default function Call(params) {
    const [localStream, setLocalStream] = useState(null);
    const [cameraList, setcameraList] = useState([]);
    const [micsList, setMicsList] = useState([]);
    const {
        roomName,
        cameraDeviceId,
        microphoneDeviceId,
        setRoomName,
        setCameraDeviceId,
        setMicrophoneDeviceId
    } = useContext(StoreContext);

    const { sendPing, isChannelReady } = useContext(SocketContext);

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
    }, [microphoneDeviceId, cameraDeviceId])

    useEffect(() => {
        // isChannelReady && setTimeout(() => navigate(`/call`, { replace: true }), 1500);

    }, [isChannelReady])

    const handleButtonsClick = (whichButton) => {
        switch (whichButton) {
            case 'init-call':
                break;

            case 'hang-up':
                break;

            case 'mic-mute':
                break;

            case 'voice-change':
                break;

            default:
                break;
        }
        sendPing('create or join', roomName)
    }

    return (

        <Container>
            <h2 className='text-center'>Calling Zone</h2>

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
                                    <VideoPlayer className='rounded mx-auto d-block col' stream={localStream} isRemoteStream={false} />
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
                        disabled={(roomName === '') ? true : false}
                    >
                        Call
                    </Button>
                    <Button variant="primary" className="m-2"
                        onClick={e => handleButtonsClick('hang-up')}
                        disabled={(roomName === '') ? true : false}
                    >
                        Hang up
                    </Button>
                    <Button variant="primary" className="m-2"
                        onClick={e => handleButtonsClick('mic-mute')}
                        disabled={(roomName === '') ? true : false}
                    >
                        Mic Mute
                    </Button>

                    <Button variant="primary" className="m-2"
                        onClick={e => handleButtonsClick('voice-change')}
                        disabled={(roomName === '') ? true : false}
                    >
                        Activate Voice Changer
                    </Button>
                </div>



            </Row>
        </Container>

    )
}