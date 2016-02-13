#!/usr/bin/env node

/**
 * Created by alykoshin on 11.02.16.
 */
'use strict';

var argv = require('minimist')(process.argv.slice(2));
var path = require('path');
//var spinner = require('text-spinner')();

var pkg = require('./package.json');


function help() {
  console.log([
    '',
    '  Package name: ' + pkg.name,
    '',
    '  Package description: ' + pkg.description,
    '',
    '  Options:',
    '    -p || --progress - show spinning indicator',
    '    -v || --verbose  - print logging info',
    '    -f || --file  - print logging info',
    '  Example:',
    '    node node_modules/' + pkg.name + '/cli.js files.json',
    ''
  ].join('\n'));
}

function version() {
  console.log([
    '* version info:',
    '* package.json version: ' + pkg.version,
    '* process.version: ' + process.version,
    ''
  ].join('\n'));
}

if (argv.h || argv.help) {
  help();
  process.exit(0);
}

if (argv.v || argv.version) {
  version();
  process.exit(1);
}

var verbose = argv.v || argv.verbose;
var progress = argv.p || argv.progress;
var jsonFileList = argv.f || argv.file;
if (!jsonFileList) {
  help();
  process.exit(1);
}


var down = require('./index.js')({ progress: progress });

down.on('file-start', function(linkObj/*, progressObj*/) {
  if (verbose) {
    console.log('* starting file ' + linkObj.url + ' -> ' + linkObj.path);
  }
});

down.on('end', function(/*progressObj*/) {
  if (verbose) {
    console.log('* All downloads finished.');
  }
});

down.on('progress', function(/*progressObj*/) {
  //spinner.spin();
});

var pathname = path.join(process.cwd(), jsonFileList);
var links = require(pathname);
down.load(links);





