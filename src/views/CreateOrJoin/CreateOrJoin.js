import './CreateOrJoin.css';
import "bootstrap/dist/css/bootstrap.css";


import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';

import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../../contexts/SocketContext';
import { StoreContext } from '../../contexts/StoreContext';
import { ALERTS } from '../../utils/constants';


export default function CreateOrJoin(params) {
    const [cameraList, setcameraList] = useState([]);
    const [micsList, setMicsList] = useState([]);
    const {
        roomName,
        cameraDeviceId,
        microphoneDeviceId,
        localStream, 
        setLocalStream,
        setRoomName,
        setCameraDeviceId,
        setMicrophoneDeviceId,
        showAlert, hideAlert,
    } = useContext(StoreContext);

    const navigate = useNavigate();
    const { sendPing, isChannelReady, isInitiator } = useContext(SocketContext);

    useEffect(() => {
        async function getCameraAndMicStream() {
            try {
                let stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
                setLocalStream(stream);
                let devices = await navigator.mediaDevices.enumerateDevices();
                let camers = devices.filter(device => device.kind === 'videoinput')
                let microphones = devices.filter(device => device.kind === 'audioinput')
                setcameraList(camers);
                setMicsList(microphones);
                setCameraDeviceId(camers[0].deviceId);
                setMicrophoneDeviceId(microphones[0].deviceId);
            } catch (error) {
                alert(error.message);
            }
        }
        getCameraAndMicStream();
    }, [])

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
        (isInitiator || isChannelReady) && setTimeout(() => {
            hideAlert()
            navigate(`/call`, { replace: true }
            )
        }, 3000);
    }, [isInitiator, isChannelReady])

    const handleSubmit = () => {
        showAlert(ALERTS.CREATE_OR_JOIN_SPINNER)
        sendPing('create or join', roomName)
    }

    return (

        <Container>
            <Row>
                <Col>
                    <div className='vh-100 d-flex align-items-center justify-content-center'>
                        <Form className='border border-2 container-fluid p-3'>
                            <h2 className='text-center'>Create or Join Room</h2>
                            <Form.Group className="mb-3 d-grid gap-2" controlId="formBasicCheckbox">
                                <Form.Label className='fw-semibold'>Watch Yourself Before Joining</Form.Label>
                                <div className='container'>
                                    <div className='col'>
                                        <VideoPlayer className='rounded mx-auto d-block col' stream={localStream} isRemoteStream={false} />
                                    </div>
                                </div>
                            </Form.Group>
                            <Form.Group className="mb-3 d-grid gap-2" controlId="formBasicCheckbox">
                                <Form.Label className='fw-semibold'>Select Camera</Form.Label>
                                <Form.Select aria-label="Default select example"
                                    className='text-wrap'
                                    value={cameraDeviceId}
                                    onChange={(evt) => {
                                        setCameraDeviceId(evt.target.value)
                                    }}
                                >
                                    {cameraList.map((item, key) => (
                                        <option key={key} value={item.deviceId}>{item.label}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3 d-grid gap-2" controlId="formBasicCheckbox">
                                <Form.Label className='fw-semibold'>Select Microphone</Form.Label>
                                <Form.Select aria-label="Default select example"
                                    className='text-wrap'
                                    value={microphoneDeviceId}
                                    onChange={(evt) => {
                                        setMicrophoneDeviceId(evt.target.value)
                                    }}
                                >
                                    {micsList.map((item, key) => (
                                        <option key={key} value={item.deviceId}>{item.label}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formBasicEmail">
                                <Form.Label>Room Name</Form.Label>
                                <Form.Control type="text" placeholder="Enter room name to join or create new"
                                    onChange={(e) => setRoomName(e.target.value)}
                                    value={roomName}
                                />
                                <span
                                    className={`text-danger d-${(roomName === '') ? 'block' : 'none'}`}
                                >
                                    * Name is required
                                </span>
                            </Form.Group>

                            <Button variant="primary"
                                onClick={e => handleSubmit()}
                                disabled={(roomName === '') ? true : false}
                            >
                                Create or Join Room
                            </Button>
                        </Form>
                    </div>
                </Col>
            </Row>
        </Container>

    )
}