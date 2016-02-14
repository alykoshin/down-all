'use strict';

var EventEmitter = require('events');
var util = require('util');

var request = require('request');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var url    = require('url');
var async  = require('async');
var spinner = require('text-spinner')();

//var spinner = require('../lib/spinner')();
var Progress = require('../lib/progress');


/**
 *
 * @param {object} options
 * @param {string} [options.dest='']
 * @param {boolean} [options.progress=false]
 * @constructor
 */
var Downloader = function(options) {
  var self = this;
  EventEmitter.call(self);

  options = options || {};
  options.dest = options.dest || '';
  options.progress = typeof options.progress !== 'undefined' ? options.progress : false;

  var totalProgress = new Progress();

  self.callback = null;


  /**
   *
   * @param {object} linkObj
   * @param {string} linkObj.url
   * @param {string} [linkObj.path='']
   * @param {string} linkObj.name
   * @private
   */
  self._downloadOne = function(linkObj, index, callback) {
    //console.log('self._downloadOne', linkObj, index, typeof callback);
    if (typeof callback !== 'function') { callback = function() {}; } // Sanitize callback

    var fileProgress = new Progress();
    var date, contentLength, contentDisposition, contentType;
    //var filepath;

    if (!linkObj) { self.emit('error', new Error('_downloadOne(): Parameter linkObj must be provided')); }

    linkObj.path = linkObj.path || '';

    var dir = path.join(options.dest, linkObj.path);

    //console.log('_downloadOne(): ' + linkObj.url + ' -> ' + filepath);

    mkdirp(dir);


    self.emit('file-add', linkObj, fileProgress);
    totalProgress.count++;
    self.emit('add', totalProgress);


    var req = request(linkObj.url);

    req
      .on('response', function (res) {
        date = res.headers.date;

        contentDisposition = res.headers[ 'content-disposition' ]; // Remote file name if set
        contentLength = parseInt(res.headers[ 'content-length' ]);
        contentType   = res.headers[ 'content-type' ]; // application/octet-stream text/plain

        var fname;
        if (linkObj.name) {
          fname = path.join(linkObj.name);

        } else if (contentDisposition) {
          fname = contentDisposition;

        } else { // Extract last part from url
          var parsed = url.parse(linkObj.url);
          fname = path.basename(parsed.pathname);
        }

        var filepath = path.join(options.dest, linkObj.path, fname);

        if (typeof contentLength === 'number') {
          totalProgress.size += contentLength;
          fileProgress.size = contentLength;
        }

        self.emit('file-start', linkObj, fileProgress);
        totalProgress.active++;
        if (totalProgress.active === 1) {
          self.emit('start', totalProgress);
        }
        //console.log('url: %s, contentDisposition: %s, contentLength: %s, contentType: %s',
        //  linkObj.url, contentDisposition, isNaN(contentLength) ? 'unknown' : contentLength, contentType);

        res.pipe(fs.createWriteStream(filepath));
      })

      .on('data', function (chunk) {
        fileProgress.add(chunk.length);
        totalProgress.add(chunk.length);

        self.emit('file-progress', linkObj, fileProgress);

        self.emit('progress', totalProgress);
        if (options.progress) {
          spinner.spin();
        }
      })

      .on('end', function () {
        //console.log('res.on(end): linkObj.url: ' + linkObj.url);
        self.emit('file-end', linkObj, fileProgress);

        totalProgress.count--;
        totalProgress.active--;

        if (totalProgress.count === 0) {
          self.emit('end', totalProgress);
        }
        callback(null);
      })

      .on('error', function (err) {
        //console.log('res.on(error): linkObj.url: ' + linkObj.url + ', err:', err);
        totalProgress.count--;
        totalProgress.active--;

        self.emit('file-error', err, linkObj);
        self.emit('error', err);
        callback(err);
      })
    ;

  };


  self.download = function(linkObjs, callback) {
    if (typeof callback !== 'function') { callback = function() {}; } // Sanitize callback

    if (!Array.isArray(linkObjs)) {
      linkObjs = [linkObjs];
    }

    async.eachOf(linkObjs, self._downloadOne,
      //function done() {
      //  self.callback(); // ...
      //}
      callback
    );
    //linkObjs.forEach(function(linkObj/*, idx, array*/) {
    //  self._downloadOne(linkObj);
    //});

  };

  self.load = self.download;

};
util.inherits(Downloader, EventEmitter);


module.exports = function(options) {
  return new Downloader(options);
};
