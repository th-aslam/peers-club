
import convolerAudio from "../assets/LargeWideEchoHall.wav";
import fireAudio from '../assets/brush_fire-Stephan_Schutze-55390065.mp3';
export const demonBeastTransform = async function (stream, doFilter) {
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    const streamDestination = audioCtx.createMediaStreamDestination();

    // Get the video tracks and add them to the stream destination.
    const videoTracks = stream.getVideoTracks();
    for (const videoTrack of videoTracks) {
        streamDestination.stream.addTrack(videoTrack);
    }

    // Reverb
    let convolver = audioCtx.createConvolver();

    try {
          const convolerResponse = await fetch("http://localhost:8001/LargeWideEchoHall.wav");
        // const convolerResponse = new Response(convolerAudio);
        const convolverBuffer = await convolerResponse.arrayBuffer();
        convolver.buffer = await audioCtx.decodeAudioData(convolverBuffer);
    } catch (error) {
        return Promise.reject(error);
    }

    // Fire
    let fire = audioCtx.createBufferSource();

    try {
        const fireResponse = await fetch("http://localhost:8001/brush_fire-Stephan_Schutze-55390065.mp3");
        // const fireResponse = new Response(fireAudio);
        const fireBuffer = await fireResponse.arrayBuffer();
        fire.buffer = await audioCtx.decodeAudioData(fireBuffer);
        fire.loop = true;
    } catch (error) {
        return Promise.reject(error);
    }

    // Compressor
    let compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.value = -50;
    compressor.ratio.value = 16;

    // Wobble
    let oscillator = audioCtx.createOscillator();
    oscillator.frequency.value = 50;
    oscillator.type = 'sawtooth';
    // ---
    let oscillatorGain = audioCtx.createGain();
    oscillatorGain.gain.value = 0.004;
    // ---
    let delay = audioCtx.createDelay();
    delay.delayTime.value = 0.01;
    // ---
    let fireGain = audioCtx.createGain();
    fireGain.gain.value = 0.2;
    // ---
    let convolverGain = audioCtx.createGain();
    convolverGain.gain.value = 2;

    // Filter
    let filter = audioCtx.createBiquadFilter();
    filter.type = "highshelf";
    filter.frequency.value = 1000;
    filter.gain.value = 10;

    // Create graph
    oscillator.connect(oscillatorGain);
    oscillatorGain.connect(delay.delayTime);
    // ---
    source.connect(delay)
    delay.connect(convolver);
    //waveShaper.connect(convolver);

    fire.connect(fireGain);
    convolver.connect(convolverGain);

    convolverGain.connect(filter);
    filter.connect(compressor);

    // Instead of audioCtx.destination we pass the audio into the new stream.
    fireGain.connect(streamDestination);
    compressor.connect(streamDestination);

    let filter2 = audioCtx.createBiquadFilter();
    filter2.type = "lowpass";
    filter2.frequency.value = 2000;

    let noConvGain = audioCtx.createGain();
    noConvGain.gain.value = 0.9;

    delay.connect(filter2);
    filter2.connect(filter);
    filter.connect(noConvGain);
    noConvGain.connect(compressor);

    // Render
    oscillator.start(0);
    fire.start(0);

    return streamDestination.stream;
}

