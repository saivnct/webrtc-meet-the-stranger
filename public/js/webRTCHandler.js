import * as wss from './wss.js'
import * as constants from './constants.js'
import * as ui from './ui.js'
import * as store from './store.js'

let connectedUserDetails;

let peerConnection;

let dataChannel;

const defaultConstraints = {
    audio: true,
    video: true
}

const configuration = {
    iceServers: [
        {
            urls: 'stun:stun.l.google.com:19302'
        }
    ]
}

export const getLocalPreview = async () => {
    //SELECT CAMERA IN CHROME
    //chrome://settings/content/camera
    try{
        const stream = await navigator.mediaDevices.getUserMedia(defaultConstraints);
        ui.updateLocalVideo(stream);
        store.setLocalStream(stream);
        store.setCallState(constants.callState.CALL_AVAILABLE);
        ui.showVideoCallButtons();
    }catch (e) {
        console.error('error occurred when trying to get an access to camera', e);
    }
}

const createPeerConnection = () => {
    console.log('createPeerConnection');
    peerConnection = new RTCPeerConnection(configuration);

    //create Data Channel
    dataChannel = peerConnection.createDataChannel('chat');
    peerConnection.ondatachannel = (event) => {
        const dataChannel = event.channel;

        dataChannel.onopen = () => {
            console.log('peer connection is ready for receiving data channel messages');
        }

        dataChannel.onmessage = (event) => {
            handleDataChannelMessage(event.data);
        }

        dataChannel.onclose = () => {
            console.log('peerConnection data channel is closed !!!');
        }
    }


    //getting candidate from stun server
    peerConnection.onicecandidate = (event) => {
        // console.log('getting ice candidate from stun server')
        if (event.candidate) {
            // console.log('candidate',event.candidate)
            //send our ice candidates to other peer
            sendWebRTCICECandidate(event.candidate)
        }
    }

    //listen for successful connection
    peerConnection.onconnectionstatechange = (event) => {
        if (peerConnection.connectionState === 'connected'){
            console.log('successfully connected with other peer');
        }
    }

    //receiving remote tracks
    const remoteStream = new MediaStream();
    store.setRemoteStream(remoteStream);
    ui.updateRemoteVideo(remoteStream);
    peerConnection.ontrack = (event) => {
        console.log("peerConnection.ontrack")
        remoteStream.addTrack(event.track);
    }

    //add our stream to peer connection
    if (connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE ||
        connectedUserDetails.callType === constants.callType.VIDEO_STRANGER) {
        const localStream = store.getState().localStream;
        if (localStream){
            for (const track of localStream.getTracks()){
                peerConnection.addTrack(track, localStream)
            }
        }
    }
}



//region PRE_OFFER

export const sendPreOffer = (callType, calleePersonalCode) => {
    // console.log('pre offer func executed', callType,calleePersonalCode)
    connectedUserDetails = {
        socketId: calleePersonalCode,
        callType
    };

    if (
        callType === constants.callType.CHAT_PERSONAL_CODE ||
        callType === constants.callType.VIDEO_PERSONAL_CODE ||
        callType === constants.callType.CHAT_STRANGER ||
        callType === constants.callType.VIDEO_STRANGER
    ){
        const data = {
            callType,
            calleePersonalCode
        }

        store.setCallState(constants.callState.CALL_UNAVAILABLE);
        wss.sendPreOffer(data)

        ui.showCallingDialog(callingDialogRejectCallHandler);
    }
}

const checkCallPossibility = (callType) => {
    const callState = store.getState().callState;

    if (callState === constants.callState.CALL_AVAILABLE){
        return true;
    }else if (callState === constants.callState.CALL_AVAILABLE_ONLY_CHAT){
        if (callType === constants.callType.CHAT_PERSONAL_CODE ||
            callType === constants.callType.CHAT_STRANGER){
            return true;
        }
    }

    return false;
}

export const handlePreOffer = (data) => {
    const { callerSocketId, callType} = data;

    if (!checkCallPossibility(callType)){
        return sendPreOfferAnswer(constants.preOfferAnswer.CALL_UNAVAILABLE, callerSocketId);
    }

    connectedUserDetails = {
        socketId: callerSocketId,
        callType
    };

    store.setCallState(constants.callState.CALL_UNAVAILABLE);

    if (
        callType === constants.callType.CHAT_PERSONAL_CODE ||
        callType === constants.callType.VIDEO_PERSONAL_CODE ||
        callType === constants.callType.CHAT_STRANGER ||
        callType === constants.callType.VIDEO_STRANGER
    ){
        ui.showIncomingCallingDialog(callType, acceptCallHandler, rejectCallHandler);
    }


}

const sendPreOfferAnswer = (preOfferAnswer, callerSocketId = null) => {
    const socketId = callerSocketId ? callerSocketId : connectedUserDetails.socketId;
    const data = {
        callerSocketId: socketId,
        preOfferAnswer
    };


    wss.sendPreOfferAnswer(data);

    if (socketId === connectedUserDetails.socketId) {
        ui.removeAllDialogs();
    }
}

export const handlePreOfferAnswer = (data) => {
    const { preOfferAnswer } = data;
    // console.log("handlePreOfferAnswer", preOfferAnswer);

    ui.removeAllDialogs();

    if(preOfferAnswer === constants.preOfferAnswer.CALL_ACCEPTED){
        ui.showCallElements(connectedUserDetails.callType)
        //create peer connection
        createPeerConnection();
        //send webRTC offer
        sendWebRTCOffer();
    }else{
        setCallStateAvailable();
        ui.showInfoDialog(preOfferAnswer);
    }
}

const acceptCallHandler = () => {
    // console.log('Call accepted');
    //create peer connection
    createPeerConnection();
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED);
    ui.showCallElements(connectedUserDetails.callType)
}

const rejectCallHandler = () => {
    // console.log('Call rejected');
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_REJECTED);
    setCallStateAvailable();
}

const callingDialogRejectCallHandler = () => {
    console.log('Reject the call');
    const data = {
        connectedUserSocketId : connectedUserDetails.socketId
    }

    closePeerConnectionAndResetState();

    wss.sendUserHangUp(data)
}
//endregion



//region webRTC signaling
const sendWebRTCOffer = async () =>{
    console.log('sendWebRTCOffer');
    const offer = await peerConnection.createOffer(); //create offer which include SDP information
    await peerConnection.setLocalDescription(offer); //save to local peerConnection

    wss.sendDataUsingWebRTCSignaling({
        connectedUserSocketId: connectedUserDetails.socketId,
        type: constants.webRTCSignaling.OFFER,
        offer
    });
}

export const handleWebRTCOffer = async (data) =>{
    const { offer } = data
    console.log('handleWebRTCOffer - offer:',offer);

    await peerConnection.setRemoteDescription(offer);//save remote description to peerConnection
    const answer = await peerConnection.createAnswer();//create offer's answer which include SDP information
    await peerConnection.setLocalDescription(answer); //save local description to peerConnection

    wss.sendDataUsingWebRTCSignaling({
        connectedUserSocketId: connectedUserDetails.socketId,
        type: constants.webRTCSignaling.ANSWER,
        answer
    });
}

export const handleWebRTCAnswer = async (data) =>{
    const { answer } = data
    console.log('handleWebRTCAnswer - answer:',answer);
    await peerConnection.setRemoteDescription(answer);//save remote description to peerConnection
}


const sendWebRTCICECandidate = (candidate) => {
    wss.sendDataUsingWebRTCSignaling({
        connectedUserSocketId: connectedUserDetails.socketId,
        type: constants.webRTCSignaling.ICE_CANDIDATE,
        candidate
    });
}

export const handleWebRTCICECandidate = async (data) => {
    const { candidate } = data
    // console.log('handleWebRTCICECandidate - candidate:',candidate);
    try{
        await peerConnection.addIceCandidate(candidate);//save remote candidate to peerConnection
    }catch (e) {
        console.error("error occurred when trying to add remote candidate", e)
    }
}
//endregion



//region WORKING WITH SCREEN SHARING STREAM
let screenSharingStream
export const switchBetweenCameraAndScreenSharing = async (screenSharingActive) => {
    if (screenSharingActive){
        console.log('switching for camera');
        const localStream = store.getState().localStream;
        if (localStream) {
            //replace track which sender's track kind is video
            const senders = peerConnection.getSenders();

            const sender = senders.find((sender) => {
                return sender.track.kind === localStream.getVideoTracks()[0].kind;
            });

            if (sender) {
                await sender.replaceTrack(localStream.getVideoTracks()[0]);
            }

            //stop screen sharing stream
            store.getState().screenSharingStream.getTracks().forEach((track) => {
                track.stop();
            });


            store.setScreenSharingActive(!screenSharingActive);

            ui.updateLocalVideo(localStream);
        }
    }else{
        console.log('switching for screenSharing');
        try{
            screenSharingStream = await navigator.mediaDevices.getDisplayMedia({
               video: true
            });

            store.setScreenSharingStream(screenSharingStream);

            //replace track which sender's track kind is video
            const senders = peerConnection.getSenders();

            // for (const sender of senders){
            //     console.log("sender:",sender);
            // }

            const sender = senders.find((sender) => {
                return sender.track.kind === screenSharingStream.getVideoTracks()[0].kind;
            });

            if (sender) {
                await sender.replaceTrack(screenSharingStream.getVideoTracks()[0]);
            }

            store.setScreenSharingActive(!screenSharingActive);

            ui.updateLocalVideo(screenSharingStream);
        }catch (e) {
            console.error('error occurred when trying to get screen sharing stream', e);
        }
    }
}
//endregion



//region WORKING WITH DATA CHANNEL
export const sendMessageUsingDataChannel = (message) => {
    if (dataChannel){
        const msgJSON = JSON.stringify(message);    //Convert a JavaScript object into a string
        dataChannel.send(msgJSON);
    }else {
        console.error('No dataChannel !!!');
    }
}

const handleDataChannelMessage = (data) => {
    const message = JSON.parse(data);
    console.log('handleDataChannelMessage', message);
    ui.appendMessage(message, false);
}
//endregion



//region HANGUP
export const handleHangUp = () => {
    // console.log('finishing the call');

    const data = {
        connectedUserSocketId: connectedUserDetails.socketId,
    }

    wss.sendUserHangUp(data);
    closePeerConnectionAndResetState();
}

export const handleUserHangUpRequest = () => {
    // console.log('connected peer hanged up');
    closePeerConnectionAndResetState();
}

const closePeerConnectionAndResetState = () => {
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }

    //deactive mic and camera
    if (connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE ||
        connectedUserDetails.callType === constants.callType.VIDEO_STRANGER){

        const localStream = store.getState().localStream;
        if (localStream){
            localStream.getVideoTracks()[0].enabled = true;
            localStream.getAudioTracks()[0].enabled = true;
        }

    }

    ui.updateUIAfterHangUp(connectedUserDetails.callType);
    setCallStateAvailable();
    connectedUserDetails = null;
}
//endregion



const setCallStateAvailable = () => {
    const localStream = store.getState().localStream;
    if (localStream) {
        store.setCallState(constants.callState.CALL_AVAILABLE);
    }else{
        store.setCallState(constants.callState.CALL_AVAILABLE_ONLY_CHAT);
    }
}