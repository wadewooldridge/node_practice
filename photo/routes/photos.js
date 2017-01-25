/* Dummy database of photos stored in an array for now. */
var photos = [];

photos.push({
    name:   'Node.js Logo',
    path:   'http://nodejs.org/images/logos/nodejs-green.png'
});

photos.push({
    name:   'Ryan speaking',
    path:   'http://nodejs.org/images/ryan-speaker.jpg'
});
/*
var express = require('express');
var router = express.Router();

/* GET home page. */
/*
router.get('/photos', function(req, res, next) {
    res.render('photos', { title: 'Directory', photos: photos });
});
module.exports = router;
*/

// Export a function render the list of photos.
exports.list = function(req, res) {
    res.render('photos', {
        title:  'Photos',
        photos: photos
    });
};

