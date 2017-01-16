/**
 *  random_story.js - Example of serializing operations in Node.js.
 */

/**
 *  Node modules.
 */
var fs = require('fs');
var request = require('request');
var htmlparser = require('htmlparser');

/**
 *  configFilename - where to read list of potention feeds.
 */
var configFilename = "./rss_feeds.txt";

/**
 *  checkForRSSFile - Step 1 - verify feed list file exists.
 */
function checkForRSSFile() {
    console.log('checkForRSSFile');
    fs.exists(configFilename, function(exists) {
        if (!exists)
            return next(new Error('Missing RSS file: ' + configFilename));

        next(null, configFilename);
    });
}

/**
 *  readRSSFile - Step 2 - read feed list file.
 */
function readRSSFile(configFilename) {
    console.log('readRSSFile: ' + configFilename);
    fs.readFile(configFilename, function(err, feedList) {
        if (err) return next(err);

        feedList = feedList.toString().replace(/^\s|\s+$/g, '').split("\n");
        var randomIndex = Math.floor(Math.random() * feedList.length);
        next(null, feedList[randomIndex]);
    });
}

/**
 *  downloadRSSFeed - Step 3 - do HTTP request to get feed.
 */
function downloadRSSFeed(feedUrl) {
    console.log('downloadRSSFeed: ' + feedUrl);
    request({uri: feedUrl}, function(err, response, body) {
        if (err) return next(err);

        if (response.statusCode != 200) {
            return next(new Error('Abnormal response status code: ' + response.statusCode));
        }

        next(null, body);
    });
}

/**
 *  parseRSSFeed - Step 4 - parse RSS data.
 */
function parseRSSFeed(rss) {
    console.log('parseRSSFeed:');
    var handler = new htmlparser.RssHandler();
    var parser = new htmlparser.Parser(handler);
    parser.parseComplete(rss);

    if (!handler.dom.items.length)
        return next(new Error('No RSS items found.'));

    // Display title and uRL of first feed item, if it exists.
    var item = handler.dom.items.shift();
    console.log(item.title);
    console.log(item.link);
}

/**
 *  tasks - list of serial tasks in order.
 */
var tasks = [
    checkForRSSFile,
    readRSSFile,
    downloadRSSFeed,
    parseRSSFeed
];

/**
 *  next - Walk through serial tasks in order.
 */
function next(err, result) {
    if (err)
        throw err;

    var currentTask = tasks.shift();

    if (currentTask)
        currentTask(result);
}

// Kick off the serial set of tasks.
next();
