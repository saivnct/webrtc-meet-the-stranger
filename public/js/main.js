import * as store from './store.js';
import * as wss from './wss.js';
import * as webRTCHandler from './webRTCHandler.js';
import * as constants from './constants.js';
import * as ui from "./ui.js";
import * as recordingUtils from "./recordingUtils.js";
import * as strangerUtils from "./strangerUtils.js";
import {getStrangerSocketIdAndConnect} from "./strangerUtils.js";


//region Initialization of socketio connection
// const socket = io('localhost:3000');
const socket = io('/');
wss.registerSocketEvents(socket);
//endregion

webRTCHandler.getLocalPreview();


//region register event listener for personal code copy button
const personalCodeCopyButton = document.getElementById("personal_code_copy_button");

personalCodeCopyButton.addEventListener('click', () => {
    const personalCode = store.getState().socketId;
    navigator.clipboard && navigator.clipboard.writeText(personalCode); //write to clipboard
});
//endregion




//region register event listener for connection button
const personalCodeChatButton = document.getElementById("personal_code_chat_button");
const personalCodeVideoButton = document.getElementById("personal_code_video_button");

personalCodeChatButton.addEventListener('click', () => {
    // console.log("personalCodeChatButton click");
    const calleePersonalCode = document.getElementById("personal_code_input").value;

    const currentSocketId = store.getState().socketId;
    if (currentSocketId && currentSocketId.length > 0 &&
        currentSocketId !== calleePersonalCode && calleePersonalCode.length >0){
        webRTCHandler.sendPreOffer(constants.callType.CHAT_PERSONAL_CODE, calleePersonalCode);
    }else{
        ui.showInfoDialog(constants.preOfferAnswer.CALL_ERROR);
    }
});

personalCodeVideoButton.addEventListener('click', () => {
    // console.log("personalCodeVideoButton click");
    const calleePersonalCode = document.getElementById("personal_code_input").value;

    const currentSocketId = store.getState().socketId;
    if (currentSocketId && currentSocketId.length > 0 &&
        currentSocketId !== calleePersonalCode && calleePersonalCode.length >0){
        webRTCHandler.sendPreOffer(constants.callType.VIDEO_PERSONAL_CODE, calleePersonalCode);
    }else{
        ui.showInfoDialog(constants.preOfferAnswer.CALL_ERROR);
    }
});
//endregion


//region register event listener for STRANGER
const strangerChatButton = document.getElementById("stranger_chat_button");
const strangerVideoButton = document.getElementById("stranger_video_button");
const allowStrangerCheckbox = document.getElementById("allow_strangers_checkbox");

strangerChatButton.addEventListener('click', () => {
    strangerUtils.getStrangerSocketIdAndConnect(constants.callType.CHAT_STRANGER);
});

strangerVideoButton.addEventListener('click', () => {
    strangerUtils.getStrangerSocketIdAndConnect(constants.callType.VIDEO_STRANGER)
});

allowStrangerCheckbox.addEventListener('click', () => {
    const checkboxState = store.getState().allowConnectionFromStrangers;
    ui.updateStrangerCheckbox(!checkboxState);
    store.setAllowConnectionFromStrangers(!checkboxState);
    strangerUtils.changeStrangerConnectionStatus(!checkboxState);
});


//endregion


//region register event listener for call buttons
const micButton = document.getElementById('mic_button');
const cameraButton = document.getElementById('camera_button');
const screenSharingButton = document.getElementById('screen_sharing_button');

micButton.addEventListener('click', () => {
    const localStream = store.getState().localStream;
    const micEnabled = localStream.getAudioTracks()[0].enabled; //we know there's only 1 audio track
    localStream.getAudioTracks()[0].enabled = !micEnabled;
    ui.updateMicButton(micEnabled);
});

cameraButton.addEventListener('click', () => {
    const localStream = store.getState().localStream;
    const cameraEnabled = localStream.getVideoTracks()[0].enabled; //we know there's only 1 video track
    localStream.getVideoTracks()[0].enabled = !cameraEnabled;
    ui.updateCameraButton(cameraEnabled);
});

screenSharingButton.addEventListener('click', () => {
    const screenSharingActive = store.getState().screenSharingActive;
    webRTCHandler.switchBetweenCameraAndScreenSharing(screenSharingActive);
});
//endregion



//region data channel message
const newMessageInput = document.getElementById('new_message_input');
newMessageInput.addEventListener('keydown', (event) => {
    const key = event.key;

    if (key === 'Enter'){
        const message = event.target.value;
        if (message.length > 0){
            webRTCHandler.sendMessageUsingDataChannel(message);
            ui.appendMessage(message, true);
            newMessageInput.value = '';
        }
    }
});

const sendMessageButton = document.getElementById('send_message_button');
sendMessageButton.addEventListener('click', () => {
    const message = newMessageInput.value;
    if (message.length > 0){
        webRTCHandler.sendMessageUsingDataChannel(message);
        ui.appendMessage(message, true);
        newMessageInput.value = '';
    }
});
//endregion



//region recording
const startRecordingButton = document.getElementById('start_recording_button');
startRecordingButton.addEventListener('click', () => {
    recordingUtils.startRecording();
    ui.showRecordingPanel();
});

const stopRecordingButton = document.getElementById('stop_recording_button');
stopRecordingButton.addEventListener('click', () => {
    recordingUtils.stopRecording();
    ui.resetRecordingButtons();
});


const pauseRecordingButton = document.getElementById('pause_recording_button');
pauseRecordingButton.addEventListener('click', () => {
    recordingUtils.pauseRecording();
    ui.switchRecordingButton(true);
});

const resumeRecordingButton = document.getElementById('resume_recording_button');
resumeRecordingButton.addEventListener('click', () => {
    recordingUtils.resumeRecording();
    ui.switchRecordingButton(false);
});
//endregion



//region hangup
const hangupButton = document.getElementById('hang_up_button');
hangupButton.addEventListener('click', () => {
    webRTCHandler.handleHangUp();
});

const hangupChatButton = document.getElementById('finish_chat_call_button');
hangupChatButton.addEventListener('click', () => {
    webRTCHandler.handleHangUp();
});
//endregion
