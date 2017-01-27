// Node modules.
var Photo = require('../models/Photo');
var fs = require('fs');
var inspect = require('util').inspect;
var path = require('path');
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

// Export a function to handle download of a photo by ID.
exports.download = function(dir) {
    return function(req, res, next) {
        var id = req.params.id;
        Photo.findById(id, function(err, photo) {
            if (err)
                return next(err);

            var path = join(dir, photo.path);
            res.sendfile(path);
        });
    };
};

// Export a function to handle the submit of an upload.
exports.submit = function(dir) {
    console.log('Building function for upload for ' + dir);
    return function(req, res, next) {
        // Now using busboy for the data transfer.
        console.dir(req.busboy);
        console.dir(req.body);

        // Set up default object to be added to the database.
        var dbObject = {
            name: '',
            path: ''
        };

        req.pipe(req.busboy);
        req.busboy.on('file', function(fieldname, file, filename) {
            console.log('Uploading: ' + filename);
            // Use the filename as the picture name if we don't have an explicit picture name.
            if (dbObject.name === '')
                dbObject.name = filename;

            // Start a stream to read the file.
            var fstream = fs.createWriteStream(dir + '/' + filename);
            file.pipe(fstream);
            fstream.on('close', function() {
                console.log('Upload complete.');

                // Write the new record to the database.
                dbObject.path = filename;
                console.log('Creating record for: ' + dbObject);
                Photo.create(dbObject, function(err) {
                    if (err) return next(err);
                    // Redirect to the default path.
                    res.redirect('/');
                });
            });
        });

        req.busboy.on('field', function(fieldname, val, nameTruncated, valTruncated) {
            if (nameTruncated || valTruncated) {
                throw new Error('name or value truncated');
            }

            console.log('Field: ' + fieldname + ' = ' + inspect(val));
            if (fieldname === 'photo-name') {
                dbObject.name = inspect(val);
            } else {
                console.log('Warning: unexpected fieldname: ' + fieldname);
            }
        });

        req.busboy.on('finish', function() {
            console.log('Finished.');
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
