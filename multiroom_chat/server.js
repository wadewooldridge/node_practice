/**
 *  multiroom_chat - Basic chat server in Node.JS.
 *  server.js - Node.js main server-side code.
 */

/**
 *  Node.JS modules.
 */
var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');

/**
 *  Cached files.
 *  @type {{}}
 */
var cache = {};

/**
 *  send404 - Return 404 error status.
 *  @param  {object}    response
 */
function send404(response) {
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.write('Error 404: resource not found.');
    response.end();
}

/**
 *  sendFile - Return file contents and status.
 *  @param  {object}    response
 *  @param  {string}    filePath
 *  @param  {string}    fileContents
 */
function sendFile(response, filePath, fileContents) {
    response.writeHead(200, {'Content-Type': mime.lookup(path.basename(filePath))});
    response.end(fileContents);
}

/**
 *  serveStatic - Server file from cache, or read from fs and fill cache.
 *  @param  {object}    response
 *  @param  {object}    cache
 *  @param  {string}    absPath - Absolute path to file.
 */
function serveStatic(response, cache, absPath) {
    //console.log('serveStatic: ' + response + ', ' + cache + ', ' + absPath);
    if (cache[absPath]) {
        // File exists in cache.
        sendFile(response, absPath, cache[absPath]);
    }
    else
    {
        // File does not exist in cache; try to read it.
        fs.exists(absPath, function(exists) {
            if (exists) {
                fs.readFile(absPath, function(err, data) {
                    if (err) {
                        send404(response);
                    } else {
                        console.log('Caching: ' + absPath);
                        cache[absPath] = data;
                        sendFile(response, absPath, data);
                    }
                });
            } else {
                // File does not exist.
                send404(response);
            }
        });
    }
}

/**
 *  Main code - start up the http server.
 */
var server = http.createServer(function(request, response) {
    var filePath = undefined;

    if (request.url == '/') {
        // Use index.html by default.
        filePath = 'public/index.html';
    } else {
        // Translate URL path to relative file path.
        filePath = 'public' + request.url;
    }

    var absPath = './' + filePath;
    serveStatic(response, cache, absPath);
});

// Start the http server listening.
server.listen(3001, function() {
    console.log('Server listening on port 3001');
});

// Start up the chat_server and start it listening.
var chatServer = require('./lib/chat_server');
chatServer.listen(server);
