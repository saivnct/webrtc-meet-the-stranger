import * as store from './store.js'
import * as ui from './ui.js'
import * as webRTCHandler from './webRTCHandler.js'
import * as constants from './constants.js'
import * as strangerUtils from './strangerUtils.js'

let socketIO = null;
export const registerSocketEvents = (socket) => {
    // console.log('registerSocketEvents');

    socket.on('connect', () => {
        socketIO = socket;

        console.log(`successfully connected to ws server - socketid = ${socket.id}`);
        store.setSocketId(socket.id)

        ui.updatePersonalCode(socket.id)
    });


    socket.on('pre-offer', (data) => {
        webRTCHandler.handlePreOffer(data)
    });


    socket.on('pre-offer-answer', (data) => {
        webRTCHandler.handlePreOfferAnswer(data)
    });

    socket.on('webrtc-signaling', (data) => {
        switch (data.type) {
            case constants.webRTCSignaling.OFFER:
                webRTCHandler.handleWebRTCOffer(data);
                break;
            case constants.webRTCSignaling.ANSWER:
                webRTCHandler.handleWebRTCAnswer(data)
                break
            case constants.webRTCSignaling.ICE_CANDIDATE:
                webRTCHandler.handleWebRTCICECandidate(data)
                break
            default:
                return;
        }
    });

    socket.on('user-hangup', () => {
        webRTCHandler.handleUserHangUpRequest()
    });

    socket.on('stranger-socket-id', (data) => {
        strangerUtils.connectWithStranger(data)
    });

};

export const sendPreOffer = (data) => {
    socketIO.emit('pre-offer', data);
};

export const sendPreOfferAnswer = (data) => {
    socketIO.emit('pre-offer-answer', data);
}

export const sendDataUsingWebRTCSignaling = (data) => {
    socketIO.emit('webrtc-signaling', data);
}

export const sendUserHangUp = (data) => {
    socketIO.emit('user-hangup', data);
}

export const changeStrangerConnectionStatus = (data) => {
    socketIO.emit('stranger-connection-status', data);
}

export const getStrangerSocketId = (data) => {
    socketIO.emit('get-stranger-socket-id');
}