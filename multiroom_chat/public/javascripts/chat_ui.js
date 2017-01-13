/**
 *  multiroom_chat - Basic chat server in Node.JS.
 *  chat_ui.js - Client-side code for the chat_server user interface.
 */

/**
 *  divEscapedContentElement - Build a <div> DOM element for message: normal text.
 *  @param  {string}    text
 */
function divEscapedContentElement(text) {
    return $('<div>').text(text);
}

/**
 *  divSystemContentElement - Build a <div> DOM element for message: highlighted text.
 *  @param  {string}    text
 */
function divSystemContentElement(text) {
    return $('<div>').html('<i>' + text + '</i>');
}

/**
 *  processUserInput - Get send-message text, and either process command or send message.
 *  @param  {object}    chatApp
 *  @param  {object}    socket
 */
function processUserInput(chatApp, socket) {
    debugger;
    var sendMessageElem = $('#send-message');
    var message = sendMessageElem.val();
    var messagesElem = $('#messages');

    if (message.charAt(0) == '/') {
        // Starts with a slash: it is a system command.
        var systemMessage = chatApp.processCommand(message);
        if (systemMessage) {
            messagesElem.append(divSystemContentElement(systemMessage));
        }
    } else {
        // No slash, normal message to send to room member.
        chatApp.sendMessage($('#room-name').text(), message);

        // Add to message log, and keep scrolled.
        messagesElem.append(divEscapedContentElement(message));
        messagesElem.scrollTop(messagesElem.prop('scrollHeight'));
    }

    // Clear out the text from the processed command/message.
    sendMessageElem.val('');
}

/**
 *  document.ready - Initialize client application
 */
$(document).ready(function() {
    console.log('chat_ui: document.ready');

    // Initialize the socket and the chat application.
    var socket = io.connect();
    var chatApp = new Chat(socket);

    // Set up callback for joinResult (room change).
    socket.on('joinResult', function(result) {
        console.log('chat_ui: joinResult: ' + result.room);

        $('#room-name').text(result.room);
        $('#messages').append(divSystemContentElement('Room changed to ' + result.room + '.'));
    });

    // Set up callback for received message.
    socket.on('message', function(message) {
        console.log('chat_ui: message text: ' + message.text);
        $('#messages').append(divEscapedContentElement(message.text));
    });

    // Set up callback for nameResult.
    socket.on('nameResult', function(result) {
        console.log('chat_ui: nameResult');
        var message;

        if (result.success) {
            message = 'You are now known as ' + result.name + '.';
        } else {
            message = result.message;
        }

        $('#messages').append(divSystemContentElement(message));
    });

    // Set up callback for rooms.
    socket.on('rooms', function(rooms) {
        console.log('chat_ui: rooms');
        var roomListElem = $('#room-list');
        roomListElem.empty();

        for (var room in rooms) {
            // Strip leading slash.
            room = room.substring(1, room.length);
            if (room != '') {
                roomListElem.append(divEscapedContentElement(room));
            }
        }

        // Set up the click handlers on the new list of rooms.
        $('#room-list div').click(function() {
            chatApp.processCommand('/join ' + $(this).text());
        });
    });

    // Keep the rooms list updated every couple of seconds.
    setInterval(function() {
        socket.emit('rooms');
    }, 5000);

    // Set the initial focus so the user doesn't have to click in the form input.
    $('#send-message').focus();

    // Set up the click handler for the submit button.
    $('#send-form').submit(function() {
        processUserInput(chatApp, socket);
        return false;
    });

});
