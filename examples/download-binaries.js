/**
 * Created by alykoshin on 09.02.16.
 */

'use strict';

var chalk = require('chalk');

//var spinner = require('text-spinner')();
var down = require('../')({ dest: 'tmp', progress: true, overwrite: false });


var links = [
  //{ url: 'https://nodejs.org/dist/v4.2.6/win-x64/node.exe', path: 'v4.2.6/win-x64', name: 'node.exe' },
  //{ url: 'https://nodejs.org/dist/v4.2.6/win-x64/node.lib', path: 'v4.2.6/win-x64' },
  //{ url: 'https://nodejs.org/dist/v4.2.6/win-x86/node.exe', path: 'v4.2.6/win-x86' },
  //{ url: 'https://nodejs.org/dist/v4.2.6/win-x86/node.lib', path: 'v4.2.6/win-x86' },
  //{ url: 'https://nodejs.org/dist/npm/npm-1.4.9.zip',       path: 'npm',            name: 'npm-1.4.9.zip' },
  //{ url: 'https://nodejs.org/dist/npm/npm-1.4.9.zip',       path: 'npm' },
  //{ url: 'https://dist.nuget.org/win-x86-commandline/v3.3.0/nuget.exe', path: 'nuget', name: 'nuget.exe' }
  //{ url: 'https://dist.nuget.org/win-x86-commandline/v3.3.0/nuget.exe', path: 'nuget' }
  //{ url: 'https://repo.jenkins-ci.org/releases/com/sun/winsw/winsw/1.18/winsw-1.18-bin.exe', path: 'winsw', name: 'winsw-1.18-bin.exe' }
  {
    path: 'winsw',
    url: 'https://repo.jenkins-ci.org/releases/com/sun/winsw/winsw/1.18/winsw-1.18-bin.exe'
  },
  {
    path: 'npm',
    urls: [
      'https://nodejs.org/dist/npm/npm-1.4.9-.zip',
      'https://nodejs.org/dist/npm/npm-1.4.8-.zip',
      'https://nodejs.org/dist/npm/npm-1.4.7.zip',
    ]
  },
];


// Downloader object level events

down.on('add', function(progressObj) {
  console.log(chalk.green('# down.on(\'add\') progressObj:' + JSON.stringify(progressObj)));
});

down.on('start', function(progressObj) {
  console.log(chalk.green('# own.on(\'start\') progressObj:' + JSON.stringify(progressObj)));
});

down.on('progress', function(/*progressObj*/) {
  //spinner.spin();
});

down.on('end', function(progressObj) {
  console.log(chalk.green('## down.on(\'end\') progressObj:' + JSON.stringify(progressObj)));
});

down.on('error', function(err, linkObj) {
  console.log(chalk.green('# down.on(\'error\'): err: ', err, '; linkObj: ' + JSON.stringify(linkObj)));
});


// File level events

down.on('file-add', function(linkObj) {
  console.log(chalk.blue('* down.on(\'file-add\'): linkObj:' + JSON.stringify(linkObj)));
});

down.on('file-start', function(linkObj, progressObj) {
  console.log(chalk.blue('* down.on(\'file-start\'): linkObj:' + JSON.stringify(linkObj) + '; progressObj:' + JSON.stringify(progressObj)));
});

//down.on('file-progress', function(progressObj) {
//  spinner.spin();
//});

down.on('file-end', function(linkObj, progressObj) {
  console.log(chalk.blue('* down.on(\'file-end\'): linkObj:' + JSON.stringify(linkObj) + '; progressObj:' + JSON.stringify(progressObj)));
});

down.on('file-error', function(err, linkObj) {
  console.log(chalk.blue('* down.on(\'error\'): err: ', err, '; linkObj: ' + JSON.stringify(linkObj)));
});


// Pass the object with file links and start download

down.load(links, function(err) {
  console.log('down.load(links, callback): callback() called');
  if (err) {
    console.log(chalk.red('down.load() returned err:', err));
  }
});

