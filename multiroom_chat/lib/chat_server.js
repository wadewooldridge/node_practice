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

        // Provide user with list of occupied rooms on request.
        socket.on('rooms', function() {
            socket.emit('rooms', io.sockets.manager.rooms);
        });

        // Cleanup logic when user disconnects.
        handleClientDisconnection(socket);
    });
};

/**
 *  assignGuestName - Generate a new guest name and save it.
 *  @param  {object}    socket -  for connection ID.
 *  @param  {number}    guestNumber - for unique names.
 *  @param  {object}    nickNames - associated guest name with connection ID.
 *  @param  {[string]}  namesUsed - to keep track of all names in use.
 */
function assignGuestName(socket, guestNumber, nickNames, namesUsed) {
    var name = 'Guest' + guestNumber;
    console.log('assignGuestName: socket id ' + socket.id + ' =  '  + name);
    nickNames[socket.id] = name;

    // Let the user know their guest name.
    socket.emit('nameResult', {
        success: true,
        name: name
    });

    // Add the name to the array of names used.
    namesUsed.push(name);

    // Return next guestNumber to use.
    return guestNumber + 1;
}

/**
 *  joinRoom - Handle user joining a room.
 *  @param  {object}    socket - identifying user.
 *  @param  {object}    room - being joined.
 */
function joinRoom(socket, room) {
    console.log('joinRoom: ' + socket.id + ', ' + room);

    // Point socket and room at each other.
    socket.join(room);
    currentRoom[socket.id] = room;

    // Emit result to this user, and broadcast to all users.
    socket.emit('joinResult', {room: room});
    socket.broadcast.to(room).emit('message', {
        text: nickNames[socket.id] + ' has joined ' + room + '.'
        });

    // Send a summary of the other users in the room, if there others.
    var usersInRoom = io.sockets.clients(room);
    if (usersInRoom.length > 1) {
        // At least one other user.
        var usersInRoomSummary = 'Users currently in ' + room + ': ';

        for (var index in usersInRoom) {
            var userSocketId = usersInRoom[index].id;
            if (userSocketId != socket.id) {
                // Not the current user.
                if (index > 0) {
                    usersInRoomSummary += ', ';
                }
                usersInRoomSummary += nickNames[userSocketId];
            }
        }

        usersInRoomSummary += '.';
        console.log('usersInRoomSummary: ' + usersInRoomSummary);
        socket.emit('message', {text: usersInRoomSummary});
    }
}

/**
 *  handleClientDisconnection - Add handler callback for 'disconnect'.
 *  @param  {object}    socket
 */
function handleClientDisconnection(socket) {
    socket.on('disconnect', function() {
        var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
        console.log('socket id ' + socket.id + ' disconnected from ' + namesUsed[nameIndex]);
        delete namesUsed[nameIndex];
        delete nickNames[socket.id];
    });
}

/**
 *  handleMessageBroadcasting - Add handler callback for 'message'.
 *  @param  {object}    socket
 */
function handleMessageBroadcasting(socket) {
    socket.on('message', function(message) {
        console.log('socket id ' + socket.id + ' room ' + message.room + ' text "' + message.text + '"');
        socket.broadcast.to(message.room).emit('message', {
            text: nickNames[socket.id] + ': ' + message.text
        });
    });
}

/**
 *  handleNameChangeAttempts - Add handler callback for 'nameAttempt'.
 *  @param  {object}    socket
 *  @param  {object}    nickNames
 *  @param  {[string]}  namesUsed
 */
function handleNameChangeAttempts(socket, nickNames, namesUsed) {
    // Set up callback function.
    socket.on('nameAttempt', function(name) {
        console.log('socket id ' + socket.id + ' changing name to ' + name);
        if (name.indexOf('Guest') == 0) {
            socket.emit('nameResult', {
                success: false,
                message: 'Names cannot begin with "Guest".'
            });
        } else if (namesUsed.indexOf(name) != -1) {
            socket.emit('nameResult', {
                success: false,
                message: 'That name is already in use.'
            });
        } else {
            // Valid name; replace the old name with the new one.
            var previousName = nickNames[socket.id];
            var previousNameIndex = namesUsed.indexOf(previousName);
            console.log('nameAttempt: ' + previousName + ' is now ' + name);
            namesUsed.push(name);
            nickNames[socket.id] = name;
            delete namesUsed[previousNameIndex];

            // Send success back to the user.
            socket.emit('nameResult', {
                success: true,
                name: name
            });

            // Notify everyone in the room of the name change.
            socket.broadcast.to(currentRoom[socket.id]).emit('message', {
                text: previousName + ' is now known as ' + name + '.'
            });
        }
    });
}

/**
 *  handleRoomJoining - Add handler callback for 'join'.
 *  @param  {object}    socket
 */
function handleRoomJoining(socket) {
    socket.on('join', function(room) {
        console.log('Socket id ' + socket.id + ' moving from ' + currentRoom[socket.id] + ' to ' + room.room);
        socket.leave(currentRoom[socket.id]);
        joinRoom(socket, room.room);
    });
}
