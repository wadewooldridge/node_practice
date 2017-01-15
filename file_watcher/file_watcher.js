// file_watcher - Watch the ./input dir and copy/rename to the ./output dir.

// Create the basic Watcher prototype.
function Watcher(inputDir, outputDir) {
    this.inputDir = inputDir;
    this.outputDir = outputDir;
}

var events = require('events');
var util = require('util');
var fs = require('fs');

// Add an events.EventEmitter to the Watcher prototype.
util.inherits(Watcher, events.EventEmitter);

// Add a watch function that does the work of watching and processing a directory.
Watcher.prototype.watch = function() {
    var self = this;
    console.log('watch: ' + self.inputDir + ' --> ' + self.outputDir);

    fs.readdir(this.inputDir, function(err, files) {
        console.log('readdir: ');
        console.dir(files);
        if (err) throw err;

        for (var index in files) {
            var file = files[index];
            console.log('Emitting process: ' + file);
            self.emit('process', file);
        }
    });
};

// Add a start function that kicks of the watching.
Watcher.prototype.start = function() {
    var self = this;
    console.log('start:');
    fs.watchFile(this.inputDir, function() {
        console.log('watchFile triggered');
        self.watch();
    });
};

// Create the instance of the Watcher to watch/process the desired directories.
var watcher = new Watcher('./infiles', './outfiles');

// Add the 'process' handler to move/rename a single file.
watcher.on('process', function process(file) {
    console.log('on process: ' + file);
    var infileName = this.inputDir + '/' + file;
    var outfileName = this.outputDir + '/' + file.toLowerCase();
    fs.rename(infileName, outfileName, function(err) {
        if (err) throw err;
    });
});

// Start the actual watching.
watcher.start();