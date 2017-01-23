/* Static file_server in Node.JS. */

/**
 *  Node modules.
 */
var http = require('http');
var parse = require('url').parse;
var join = require('path').join;
var fs = require('fs');

var root = __dirname;

/**
 *  Main server.
 */
var server = http.createServer(function(req, res) {
    var url = parse(req.url);
    var path = join(root, 'files', url.pathname);
    fs.stat(path, function(err, stat) {
        if (err) {
            if (err.code === 'ENOENT') {
                res.statusCode = 404;
                res.end('Not Found');
            } else {
                res.statusCode = 500;
                res.end('Internal Server Error');
            }
        } else {
            res.setHeader('Content-Length', stat.size);
            var stream = fs.createReadStream(path);
            stream.pipe(res);
            stream.on('error', function(err) {
                res.statusCode = 500;
                res.end('Internal server error');
            });
        }
    });
});

server.listen(3000);
console.log('Server listening on port 3000.');
