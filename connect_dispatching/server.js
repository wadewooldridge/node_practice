/* server - Basic connect dispatcher testing. */

/**
 *  Node modules.
 */
var connect = require('connect');
var logger = require('morgan');
var favicon = require('serve-favicon');

/**
 *  hello - second middlware piece that returns a "hello" response.
 */
function hello(req, res, next) {
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello, world');
}
/**
 *  Main server.
 */
var app = connect()
    .use(favicon(__dirname + '/favicon.ico'))
    .use(logger('common'))
    .use(hello)
    .listen(3000);
console.log('Server listening on port 3000.');
