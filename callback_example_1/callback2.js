var http = require('http');
var fs = require('fs');

// Main server - dispatch based on incoming URL.
var server = http.createServer(function(request, response) {
    if (request.url == '/') {
        readTitles(response);
    } else {
        response.writeHead(404, {'Content-Type': 'text/plain'});
        response.write('Error 404: resource not found.');
        response.end();
    }
}).listen(8000, '127.0.0.1');
console.log('Listening on port 8000');

// Handle the error case.
function hadError(err, response) {
    console.error(err);
    response.end('Server Error');
}

// Read the titles from the JSON.
function readTitles(response) {
    fs.readFile('./titles.json', function(err, data) {
        if (err) {
            return hadError(err);
        }
        readTemplate(JSON.parse(data.toString()), response);
    });
}

// Read the template.html file.
function readTemplate(titles, response) {
    fs.readFile('./template.html', function(err, data) {
        if (err) {
            return hadError(err);
        }
        formatHtml(titles, data.toString(), response);
    });
}

// Format the HTML and return it to the client.
function formatHtml(titles, template, response) {
    var html = template.replace('%', titles.join('</li><li>'));
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end(html);
}
