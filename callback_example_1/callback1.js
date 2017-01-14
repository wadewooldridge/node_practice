var http = require('http');
var fs = require('fs');

http.createServer(function(request, response) {
    if (request.url == '/') {
        fs.readFile('./titles.json', function(err, data) {
            if (err) {
                console.error(err);
                response.end('Server Error');
            } else {
                var titles = JSON.parse(data.toString());

                fs.readFile('./template.html', function(err, data) {
                    if (err) {
                        console.error(err);
                        response.end('Server Error');
                    } else {
                        var template = data.toString();
                        var html = template.replace('%', titles.join('</li><li>'));
                        response.writeHead(200, {'Content-Type': 'text/html'});
                        response.end(html);
                    }
                });
            }
        });
    }
}).listen(8000, '127.0.0.1');
console.log('Listening on port 8000');
