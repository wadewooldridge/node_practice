// Node modules.
var Photo = require('../models/Photo');
var path = require('path');
var fs = require('fs');
var join = path.join;

/* Dummy database of photos stored in an array for now. */
/*
var photos = [];

photos.push({
    name:   'Node.js Logo',
    path:   'http://nodejs.org/images/logos/nodejs-green.png'
});

photos.push({
    name:   'Ryan speaking',
    path:   'http://nodejs.org/images/ryan-speaker.jpg'
});
 */

// Export a function to render the form function.
exports.form = function(req, res) {
    res.render('photos/upload', {
        title: 'Photo upload'
    });
};

// Export a function to render the list of photos.
exports.list = function(req, res, next) {
    Photo.find({}, function(err, photos) {
        console.log('find: err: ' + err + ', photos: ' + photos);
        if (err) return next(err);

        res.render('photos', {
            title:  'Photos',
            photos: photos
        });
    });
};

// Export a function to handle the submit of an upload.
exports.submit = function(dir) {
    console.log('Building function for upload for ' + dir);
    return function(req, res, next) {
        // Now using busboy for the data transfer.
        console.dir(req.busboy);
        req.pipe(req.busboy);
        req.busboy.on('file', function(fieldname, file, filename) {
            console.log('Uploading: ' + filename);

            var fstream = fs.createWriteStream(dir + '/' + filename);
            file.pipe(fstream);
            fstream.on('close', function() {
                console.log('Upload complete.');
                res.redirect('/');
            })
        });

        /*
        res.setHeader('Content-Type', 'text/plain');
        res.write('You posted:');
        res.end(JSON.stringify(req.body, null, 2));
        console.log('req:');
        console.dir(req);
        var img = req.files.photo.image;
        var name = req.body.photo.name || img.name;
        var path = join(dir, img.name);

        fs.rename(img.path, path, function(err) {
            if (err) return next(err);

            Photo.create({
                name: name,
                path: img.name
            }, function(err) {
                if (err) return next(err);
                res.redirect('/');
            });
        });
        */
    };
};
