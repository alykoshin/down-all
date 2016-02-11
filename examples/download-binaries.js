/**
 * Created by alykoshin on 09.02.16.
 */

'use strict';

var spinner = require('text-spinner')();


var down = require('../')({ dest: 'downloads' }); // Base download directory


var links = [
  //{ url: 'https://nodejs.org/dist/v4.2.6/win-x64/node.exe', path: 'v4.2.6/win-x64', name: 'node.exe' },
  { url: 'https://nodejs.org/dist/v4.2.6/win-x64/node.lib', path: 'v4.2.6/win-x64' },
  //{ url: 'https://nodejs.org/dist/v4.2.6/win-x86/node.exe', path: 'v4.2.6/win-x86' },
  //{ url: 'https://nodejs.org/dist/v4.2.6/win-x86/node.lib', path: 'v4.2.6/win-x86' },
  //{ url: 'https://nodejs.org/dist/npm/npm-1.4.9.zip',       path: 'npm',            name: 'npm-1.4.9.zip' },
  { url: 'https://nodejs.org/dist/npm/npm-1.4.9.zip',       path: 'npm' },
  //{ url: 'https://dist.nuget.org/win-x86-commandline/v3.3.0/nuget.exe', path: 'nuget', name: 'nuget.exe' }
];


// Downloader object level events

down.on('add', function(progressObj) {
  console.log('down.on(\'add\') progressObj:', progressObj);
});

down.on('start', function(progressObj) {
  console.log('down.on(\'start\') progressObj:', progressObj);
});

down.on('progress', function(progressObj) {
  spinner.spin();
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

down.on('error', function(err, linkObj) {
  console.log('down.on(\'error\'): err: ', err, '; linkObj:', linkObj);
});


// Pass the array of links and start download

down.load(links);

