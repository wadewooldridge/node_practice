/**
 *  multiroom_chat - Basic chat server in Node.JS.
 *  chat_server.js - Server-side code for the chat_server.
 */

/**
 *  Node.JS modules.
 */
var socketio = require('socket.io');

/**
 *  Global data.
 */
var io = undefined;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

/**
 *  listen - Main setup to listen on socket.
 *  @param  {object}    server - to listen on the same port.
 */
exports.listen = function(server) {
    io = socketio.listen(server);
    io.set('log level', 1);

    io.sockets.on('connection', function(socket) {
        guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
        joinRoom(socket, 'Lobby');

        handleMessageBroadcasting(socket, nickNames);
        handleNameChangeAttempts(socket, nickNames, namesUsed);
        handleRoomJoining(socket);

        socket.on('rooms', io.sockets.manager.rooms);
    });

    // Cleanup logic when user disconnects.
    handleClientDisconnection(socket, nickNames, namesUsed);
};

