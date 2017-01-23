/* todo_server - Node.JS example "to do" list server. */

/**
 *  Node modules.
 */
var http = require('http');
var url = require('url');

/**
 *  items - Main database of current items.
 *  @type   {[string]}
 */
var items = [];

/**
 *  processRequest - main handling for the various requests.
 */
function processRequest(req, res) {
    switch(req.method) {
        case 'GET':
            console.log('GET received');
            var body = items.map(function(item, i) {
                return i + ')' + item;
            }).join('\n');
            res.setHeader('Content-Length', Buffer.byteLength(body));
            res.setHeader('Content-Type', 'text/plain; charset="utf-8"');
            res.end(body);
            break;

        case 'POST':
            console.log('POST received');
            // Process multiple chunks if required to get the item.
            var item = '';
            req.setEncoding('utf8');
            req.on('data', function(chunk) {
                item += chunk;
            });
            req.on('end', function() {
                items.push(item);
                res.end('OK\n');
            });
            break;

        case 'DELETE':
            console.log('DELETE received');
            var path = url.parse(req.url).pathname;
            var itemNum = parseInt(path.slice(1));

            if (isNaN(itemNum)) {
                res.statusCode = 400;
                res.end('Invalid item id');
            } else if (!items[itemNum]) {
                res.statusCode = 404;
                res.end('Item not found');
            } else {
                // Delete the item from the array.
                items.splice(itemNum, 1);
                res.end('OK\n');
            }
            break;

        default:
            console.log('Invalid method: ' + req.method);
            break;
    }
}
/**
 *  Create the server and start listening.
 */
var server = http.createServer(processRequest);
server.listen(3000);
console.log('Server listening on port 3000.');


