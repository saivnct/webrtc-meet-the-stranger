import * as constants from "./constants.js";

let state = {
    socketId: null,
    remoteStream: null,
    localStream: null,
    allowConnectionFromStrangers: false,
    screenSharingActive: false,
    screenSharingStream: null,
    callState: constants.callState.CALL_AVAILABLE_ONLY_CHAT,
};

export const setSocketId = (socketId) => {
    state = {
        ...state,   //copy all other properties
        socketId: socketId
    };
};

export const setRemoteStream = (stream) => {
    state = {
        ...state,   //copy all other properties
        remoteStream: stream
    };
};

export const setLocalStream = (stream) => {
    state = {
        ...state,   //copy all other properties
        localStream: stream
    };
};

export const setAllowConnectionFromStrangers = (allowConnection) => {
    state = {
        ...state,   //copy all other properties
        allowConnectionFromStrangers: allowConnection
    };
};

export const setScreenSharingActive = (screenSharingActive) => {
    state = {
        ...state,   //copy all other properties
        screenSharingActive: screenSharingActive
    };
};

export const setScreenSharingStream = (stream) => {
    state = {
        ...state,   //copy all other properties
        screenSharingStream: stream
    };
};

export const setCallState = (callState) => {
    state = {
        ...state,   //copy all other properties
        callState: callState
    };
};

export const getState = () => {
    return state;
};