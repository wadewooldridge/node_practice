/**
 *  word_count.js - Exercise in parallel flow control.
 */

/**
 *  Node modules.
 */
var fs = require('fs');

// List of tasks, and number of completed tasks.
var tasks = [];
var completedTasks = 0;

// Input directory.
var filesDir = './text';

// Object to collect word counts.
var wordCounts = {};

/**
 *  checkIfComplete - finish one task, and print results if all finished.
 */
function checkIfComplete() {
    console.log('checkIfComplete');
    completedTasks++;
    if (completedTasks == tasks.length) {
        var keys = Object.keys(wordCounts).sort();
        for (var index = 0; index < keys.length; index++) {
            var word = keys[index];
            console.log(word + ': ' + wordCounts[word]);
        }
        console.timeEnd();
    }
}

/**
 *  countWordsInText - update wordCounts from text.
 */
function countWordsInText(text) {
    console.log('countWordsInText');
    var words = text.toString().toLowerCase().split(/\W+/);

    for (var index in words) {
        var word = words[index];
        if (word) {
            wordCounts[word] = (wordCounts[word] ? wordCounts[word] + 1 : 1);
        }
    }
}

/**
 *  main - start application, get list of files and start them processing.
 */
console.time();
console.log('Reading ' + filesDir);
fs.readdir(filesDir, function(err, files) {
    if (err)
        throw err;

    console.log('Total ' + files.length + ' files.');
    //console.dir(files);
    for (var index in files) {
        var task = (function(file) {
            return function() {
                fs.readFile(file, function(err, text) {
                    if (err)
                        throw err;

                    countWordsInText(text);
                    checkIfComplete();
                });
            }
        })(filesDir + '/' + files[index]);
        tasks.push(task);
    }
    console.log('Starting');
    for (var task in tasks) {
        tasks[task]();
    }
});

