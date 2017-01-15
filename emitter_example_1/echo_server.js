var net = require('net');

var server = net.createServer(function(socket) {
    socket.on('data', function(data) {
        socket.write(data);
    });
});

server.listen(8888);
console.log('Listening on port 8888.');
