// Set up the HTTP server.
var http = require('http');
var server = http.createServer();

server.on('request', function(request, response) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('Hello World\n');
});

server.listen(3030);
console.log('Server running at http://localhost:3030/');
