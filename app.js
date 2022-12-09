const express = require('express');
const http = require('http');


const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

app.use(express.static("public")); //tell express to make all the files in "public" folder to be accessible from the outside of our server

app.get('/', (req,res) => {
   res.sendFile(__dirname + '/public/index.html')
});


let connectedPeers = [];
let connectedPeersStrangers = [];

io.on('connection', (socket) => {
    console.log(`user connected to socket : ${socket.id}`);
    connectedPeers.push(socket.id);
    console.log(`peers:`,connectedPeers);


    socket.on('disconnect', () => {
        console.log(`user disconnected : ${socket.id}`)

        const newConnectedPeers = connectedPeers.filter((peerSocketId) => {
            return peerSocketId !== socket.id;
        });

        connectedPeers = newConnectedPeers;
        console.log(`peers:`,connectedPeers);

        const newConnectedPeersStrangers = connectedPeersStrangers.filter((peerSocketId) => {
            return peerSocketId !== socket.id;
        });
        connectedPeersStrangers = newConnectedPeersStrangers;
        console.log(`peers strangers:`,connectedPeersStrangers);
    });

    socket.on('stranger-connection-status', (data) => {
       const { status } = data;
       if (status) {
           connectedPeersStrangers.push(socket.id)
       }else {
           const newConnectedPeersStrangers = connectedPeersStrangers.filter((peerSocketId) => {
               return peerSocketId !== socket.id;
           });
           connectedPeersStrangers = newConnectedPeersStrangers;
       }
        console.log(`peers strangers:`,connectedPeersStrangers);
    });

    socket.on('get-stranger-socket-id', () => {
        let randomStrangerSocketId;
        const filterConnectedPeersStrangers = connectedPeersStrangers.filter((peerSocketId) => {
            return peerSocketId !== socket.id;
        });

        if (filterConnectedPeersStrangers.length > 0){
            randomStrangerSocketId = filterConnectedPeersStrangers[
                    Math.floor(Math.random() * filterConnectedPeersStrangers.length)
                ];
        }else {
            randomStrangerSocketId = null;
        }

        const data = {
            randomStrangerSocketId
        }

        io.to(socket.id).emit('stranger-socket-id', data);

    });


    socket.on('pre-offer', (data) => {
        const { callType, calleePersonalCode } = data;

        // console.log('pre-offer',callType,calleePersonalCode);

        const connectedPeer = connectedPeers.find((peerSocketId) =>{
            return peerSocketId === calleePersonalCode;
        });

        if (connectedPeer) {
            const sendData = {
                callerSocketId: socket.id,
                callType,
            };

            io.to(calleePersonalCode).emit('pre-offer', sendData);
        }else{
            const sendData = {
                callerSocketId: socket.id,
                preOfferAnswer: 'CALLEE_NOT_FOUND',
            };
            io.to(socket.id).emit('pre-offer-answer', sendData);
        }
    });


    socket.on('pre-offer-answer', (data) => {
        const { callerSocketId } = data;
        // console.log('pre-offer-answer', data);

        const connectedPeer = connectedPeers.find((peerSocketId) =>{
            return peerSocketId === callerSocketId;
        });

        if (connectedPeer) {
            io.to(callerSocketId).emit('pre-offer-answer', data);
        }
    });

    socket.on('webrtc-signaling', (data) => {
        const { connectedUserSocketId } = data;

        const connectedPeer = connectedPeers.find((peerSocketId) =>{
            return peerSocketId === connectedUserSocketId;
        });

        if (connectedPeer) {
            io.to(connectedUserSocketId).emit('webrtc-signaling', data);
        }
    });

    socket.on('user-hangup', (data) => {
        const { connectedUserSocketId } = data;

        const connectedPeer = connectedPeers.find((peerSocketId) =>{
            return peerSocketId === connectedUserSocketId;
        });

        if (connectedPeer) {
            io.to(connectedUserSocketId).emit('user-hangup');
        }
    });



});



server.listen(PORT, () => {
    console.log(`listening on ${PORT}`)
});