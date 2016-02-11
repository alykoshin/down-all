#!/usr/bin/env node

/**
 * Created by alykoshin on 11.02.16.
 */
'use strict';

var argv = require('minimist')(process.argv.slice(2));
var path = require('path');
var spinner = require('text-spinner')();

var pkg = require('./package.json');


function help() {
  console.log([
    '',
    '  Package name: ' + pkg.name,
    '',
    '  Package description: ' + pkg.description,
    '',
    '  Example:',
    '    node node_modules/' + pkg.name + '/cli.js',
    ''
  ].join('\n'));
}

function version() {
  console.log('package version:', pkg.version);
  console.log('process.version:', process.version);
}

if (argv.h || argv.help) {
  help();
  return;
}

if (argv.v || argv.version) {
  version();
  return;
}


var down = require('./index.js')();


down.on('file-start', function(linkObj/*, progressObj*/) {
  console.log('* starting file ' + linkObj.url + ' -> ' + linkObj.path);
});

down.on('end', function(/*progressObj*/) {
  console.log('* All downloads finished.');
});

down.on('progress', function(/*progressObj*/) {
  spinner.spin();
});


var inputFile = argv.f || argv.fil;
if (inputFile) {
  var pathname = path.join(process.cwd(), inputFile);
  var links = require(pathname);
  down.load(links);
}





