
import "./VideoPlayer.css";
import React, { useRef, useEffect } from "react";



const VideoPlayer = (props) => {
    const videoContainer = useRef(null);
    let { stream, isRemoteStream } = props;
    useEffect(() => {
        if (!videoContainer.current || !stream) return;
        videoContainer.current.srcObject = stream;
        return () => {
            // props.videoTrack?.stop();
            // props.stream.stop();
        };
    }, [stream]);

    // useEffect(() => {
    //     if (props.audioTrack) {
    //         props.audioTrack?.play();
    //     }
    //     return () => {
    //         props.audioTrack?.stop();
    //     };
    // }, [props.audioTrack]);

    return (
        <div className="video-container" >
            <video ref={videoContainer}
                muted={isRemoteStream ? false : true}
                className={`video-player ${!isRemoteStream && "local-video"}`}
                autoPlay
            ></video>
        </div>
    );
}

export default VideoPlayer;