/**
 * Created by alykoshin on 02.08.16.
 */

'use strict';


var down = require('../')({
  dest: 'tmp',
  progress: true,
  overwrite: false,
  strictSSL: false
});


var links = [
  { url: 'https://tv.eurosport.com/', path: '' }
];


// Downloader object level events

down.on('add', function(progressObj) {
  console.log('down.on(\'add\') progressObj:', progressObj);
});

down.on('start', function(progressObj) {
  console.log('down.on(\'start\') progressObj:', progressObj);
});

down.on('progress', function(/*progressObj*/) {
  //spinner.spin();
});

down.on('end', function(progressObj) {
  console.log('down.on(\'end\') progressObj:', progressObj);
});

down.on('error', function(err) {
  console.log('down.on(\'error\'): err: ', err);
});


// File level events

down.on('file-add', function(linkObj) {
  console.log('down.on(\'file-add\'): linkObj:', linkObj);
});

down.on('file-start', function(linkObj, progressObj) {
  console.log('down.on(\'file-start\'): linkObj:', linkObj, '; progressObj:', progressObj);
});

//down.on('file-progress', function(progressObj) {
//  spinner.spin();
//});

down.on('file-end', function(linkObj, progressObj) {
  console.log('down.on(\'file-end\'): linkObj:', linkObj, '; progressObj:', progressObj);
});

down.on('file-error', function(err, linkObj) {
  console.log('down.on(\'file-error\'): err: ', err, '; linkObj:', linkObj);
});


// Pass the array of links and start download

down.load(links, function(err) {
  console.log('down.load(links, callback): callback() called');
  if (err) {
    console.log('err:', err);
  }
});

