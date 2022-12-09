import * as constants from "./constants.js";
import * as elements from "./elements.js";

export const updateLocalVideo = (stream) => {
    const localVideo = document.getElementById("local_video");
    localVideo.srcObject = stream;

    localVideo.addEventListener('loadedmetadata', () => {
        localVideo.play();
    });
}

export const showVideoCallButtons = () => {
    const personalCodeVideoButton = document.getElementById("personal_code_video_button");
    const strangerVideoButton = document.getElementById("stranger_video_button");

    showElement(personalCodeVideoButton);
    showElement(strangerVideoButton);
}

export const updateRemoteVideo = (stream) => {
    const remoteVideo = document.getElementById("remote_video");
    remoteVideo.srcObject = stream;
}

export const updatePersonalCode = (personalCode) => {
    const personalCodeParagraph = document.getElementById("personal_code_paragraph");
    personalCodeParagraph.innerHTML = personalCode;
}


//region call buttons
const micOnImgSrc = './utils/images/mic.png';
const micOffImgSrc = './utils/images/micOff.png';
export const updateMicButton = (micEnabled) => {
    const micButtonImage = document.getElementById('mic_button_image');
    micButtonImage.src = micEnabled ? micOffImgSrc : micOnImgSrc;
}

const cameraOnImgSrc = './utils/images/camera.png';
const cameraOffImgSrc = './utils/images/cameraOff.png';
export const updateCameraButton = (cameraEnabled) => {
    const cameraButtonImage = document.getElementById('camera_button_image');
    cameraButtonImage.src = cameraEnabled ? cameraOffImgSrc : cameraOnImgSrc;
}
//endregion



//region STRANGER
export const updateStrangerCheckbox = (status) => {
    const allowStrangersCheckboxImage = document.getElementById('allow_strangers_checkbox_image');
    status ? showElement(allowStrangersCheckboxImage) : hideElement(allowStrangersCheckboxImage);
}
//endregion


//region dialogs
export const showIncomingCallingDialog = (callType, acceptCallHandler, rejectCallHandler) => {
    let callTypeInfo = "";
    switch (callType) {
        case constants.callType.CHAT_PERSONAL_CODE:
            callTypeInfo = "Chat";
            break;
        case constants.callType.VIDEO_PERSONAL_CODE:
            callTypeInfo = "Video";
            break;
        case constants.callType.CHAT_STRANGER:
            callTypeInfo = "Chat From Stranger";
            break;
        case constants.callType.VIDEO_STRANGER:
            callTypeInfo = "Video From Stranger";
            break;
    }

    const incomingCallDialog = elements.getIncomingCallDialog(callTypeInfo, acceptCallHandler, rejectCallHandler);

    removeAllDialogs()

    const dialog = document.getElementById('dialog');
    dialog.appendChild(incomingCallDialog);
}

export const showCallingDialog = (callingDialogRejectCallHandler) => {
    const callingDialog  = elements.getCallingDialog(callingDialogRejectCallHandler);

    removeAllDialogs()

    const dialog = document.getElementById('dialog');
    dialog.appendChild(callingDialog);
}

export const showInfoDialog = (preOfferAnswer) => {
    let infoDialog  = null;
    if (preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND){
        infoDialog = elements.getInfoDialog('Callee not found','Please check personal code');
    }else if(preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE){
        infoDialog = elements.getInfoDialog('Call unavailable','Callee is busy');
    }else if(preOfferAnswer === constants.preOfferAnswer.CALL_ERROR){
        infoDialog = elements.getInfoDialog('Error','Cannot make call');
    }else if(preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED){
        infoDialog = elements.getInfoDialog('Call rejected','Callee rejected your call');
    }

    if (infoDialog){
        removeAllDialogs();

        const dialog = document.getElementById('dialog');
        dialog.appendChild(infoDialog);

        setTimeout(() => {
            removeAllDialogs();
        }, [2000]);
    }
}

export const showNoStrangerAvailableDialog = () => {
    const infoDialog = elements.getInfoDialog('Error','No stranger available!');

    removeAllDialogs();

    const dialog = document.getElementById('dialog');
    dialog.appendChild(infoDialog);

    setTimeout(() => {
        removeAllDialogs();
    }, [2000]);
}

export const removeAllDialogs = () => {
    //remove all dialogs inside HTML dialog element
    const dialog = document.getElementById('dialog');
    dialog.querySelectorAll('*').forEach((child) => child.remove());
}
//endregion


//region call elements
export const showCallElements = (callType) => {
    if (callType === constants.callType.CHAT_PERSONAL_CODE ||
        callType === constants.callType.CHAT_STRANGER){
        showChatCallElements();
    }else if (callType === constants.callType.VIDEO_PERSONAL_CODE ||
            callType === constants.callType.VIDEO_STRANGER){
        showVideoCallElements();
    }
}

const showChatCallElements = () => {
    const finishConnectionChatButtonContainer = document.getElementById('finish_chat_button_container');
    showElement(finishConnectionChatButtonContainer);

    const newMessageInput = document.getElementById('new_message');
    showElement(newMessageInput);

    //block panel
    disableDashboard();
}

const showVideoCallElements = () => {
    const callButtons = document.getElementById('call_buttons');
    showElement(callButtons);

    const placeholder = document.getElementById('video_placeholder');
    hideElement(placeholder);

    const remoteVideo = document.getElementById('remote_video');
    showElement(remoteVideo);

    const newMessageInput = document.getElementById('new_message');
    showElement(newMessageInput);

    //block panel
    disableDashboard();
}
//endregion


//region data channel message
export const appendMessage = (message, sending = false) => {
    const messageContainer = document.getElementById('messages_container');
    const messageElement = sending ? elements.getSendingMessage(message) : elements.getIncomingMessage(message);
    messageContainer.appendChild(messageElement);
}

export const clearMessenger = () => {
    const messageContainer = document.getElementById('messages_container');
    messageContainer.querySelectorAll('*').forEach((child) => child.remove());
}
//endregion


//region recording
export const showRecordingPanel = () => {
    const recordingButtons = document.getElementById('video_recording_buttons');
    showElement(recordingButtons);

    //hide start recording button if it's active
    const startRecordingButton = document.getElementById('start_recording_button');
    hideElement(startRecordingButton);
}

export const resetRecordingButtons = () => {
    const startRecordingButton = document.getElementById('start_recording_button');
    showElement(startRecordingButton);

    const recordingButtons = document.getElementById('video_recording_buttons');
    hideElement(recordingButtons);
}

export const switchRecordingButton = (switchForResume = false) => {
    const resumeRecordingButton = document.getElementById('resume_recording_button');
    const pauseRecordingButton = document.getElementById('pause_recording_button');

    if (switchForResume) {
        hideElement(pauseRecordingButton);
        showElement(resumeRecordingButton);
    }else{
        hideElement(resumeRecordingButton);
        showElement(pauseRecordingButton);
    }
}
//endregion


//region HANGUP
export const updateUIAfterHangUp = (callType) => {
    enableDashboard();

    //hide the call buttons
    if (callType === constants.callType.VIDEO_PERSONAL_CODE ||
        callType === constants.callType.VIDEO_STRANGER){
        const callButtons = document.getElementById('call_buttons');
        hideElement(callButtons);
    }else{
        const chatCallButtons = document.getElementById('finish_chat_button_container');
        hideElement(chatCallButtons);
    }

    //hide message input
    const newMessageInput = document.getElementById('new_message');
    hideElement(newMessageInput);
    clearMessenger();

    updateMicButton(false);
    updateCameraButton(false);

    //hide remote video and show placeholder
    const remoteVideo = document.getElementById('remote_video');
    hideElement(remoteVideo);

    const videoPlaceholder = document.getElementById('video_placeholder');
    showElement(videoPlaceholder);

    removeAllDialogs();
}
//endregion


//region helper functions
const enableDashboard = () => {
    const dashboardBlocker = document.getElementById('dashboard_blur');
    if (!dashboardBlocker.classList.contains('display_none')){
        dashboardBlocker.classList.add('display_none');
    }
}

const disableDashboard = () => {
    const dashboardBlocker = document.getElementById('dashboard_blur');
    if (dashboardBlocker.classList.contains('display_none')){
        dashboardBlocker.classList.remove('display_none');
    }
}

const hideElement = (element) => {
    if (!element.classList.contains('display_none')){
        element.classList.add('display_none');
    }
}

const showElement = (element) => {
    if (element.classList.contains('display_none')){
        element.classList.remove('display_none');
    }
}
//endregion