import * as store from './store.js';

let mediaRecorder;

const vp9Codec = 'video/webm; codecs=vp=9';
const vp9Options = {
    mimeType: vp9Codec
};

const recordedChunks = [];
export const startRecording = () => {
    const remoteStream = store.getState().remoteStream;

    if (remoteStream){
        if (MediaRecorder.isTypeSupported(vp9Codec)){
            mediaRecorder = new MediaRecorder(remoteStream, vp9Options)// force media recorder to use vp9 codec if vp9 is supported
        }else{
            mediaRecorder = new MediaRecorder(remoteStream) //let media recorder to choose which codec should be used
        }

        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.start();
    }
}

export const pauseRecording = () => {
    if (mediaRecorder){
        mediaRecorder.pause();
    }
}

export const resumeRecording = () => {
    if (mediaRecorder){
        mediaRecorder.resume();
    }
}

export const stopRecording = () => {
    if (mediaRecorder){
        mediaRecorder.stop();
        mediaRecorder = null;
    }
}

const handleDataAvailable = (event) => {
    //this function will be call after stopping recorder
    // console.log('handleDataAvailable');
    if (event.data.size > 0){
        recordedChunks.push(event.data);
        downloadRecordedVideo();
    }
}

const downloadRecordedVideo = () => {
    const blob = new Blob(recordedChunks, {
        type: 'video/webm'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display: none';
    a.href = url;
    a.download = 'recording.webm';
    a.click();
    window.URL.revokeObjectURL(url)
}