/* EventEmitter example of publish/subscribe. */

var events = require('events');
var net = require('net');

var channel = new events.EventEmitter();
channel.clients = {};
channel.subscriptions = {};

channel.on('join', function(id, client) {
    var self = this;
    console.log('channel: on join: id ' + id + ', client ' + client);
    self.clients[id] = client;
    self.subscriptions[id] = function(senderId, message) {
        console.log('sub function[' + id + ']: ' + senderId + ', ' + message.toString());
        if (id !== senderId) {
            self.clients[id].write(message);
        }
    };
    this.on('broadcast', this.subscriptions[id]);
});

channel.on('leave', function(id) {
    console.log('channel: on leave: id ' + id);
    channel.removeListener('broadcast', this.subscriptions[id]);
    channel.emit('broadcast', id, id + " has left the chat\n");
});

// client is an instance of Socket.
var server = net.createServer(function(client) {
    var id = client.remoteAddress + ':' + client.remotePort;
    console.log('New ID: ' + id);

    client.on('close', function(hadError) {
        console.log('client: on close: hadError = ' + hadError);
        channel.emit('leave', id);
    });

    client.on('connect', function() {
        console.log('client: on connect');
        channel.emit('join', id, client);
    });

    client.on('data', function(buffer) {
        var data = buffer.toString();
        console.log('client: on data');
        channel.emit('broadcast', id, data);
    });

    client.on('drain', function() {
        console.log('client: on drain');
    });

    client.on('end', function() {
        console.log('client: on end');
    });

    client.on('error', function(err) {
        console.log('client: on error: ' + err);
    });

    client.on('lookup', function(err, ipAddress, family, host) {
        console.log('client: on lookup: err=' + err);
        console.log('client: on lookup: ip=' + ipAddress + ', family=' + family + ', host=' + host);
    });

    client.on('timeout', function() {
        console.log('client: on timeout');
    });

});

server.on('connection', function(socket) {
    console.log('server: on connection: ');
    //console.dir(socket);
    var id = socket.remoteAddress + ':' + socket.remotePort;
    console.log('New ID: ' + id);
    channel.emit('join', id, socket);
});
server.listen(8888);
console.log('Server listening on port 8888.');
