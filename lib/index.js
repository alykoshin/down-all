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

function fileExistsSync(path) {
  try {
    return fs.statSync(path).isFile();
  }
  catch (e) {

    if (e.code == 'ENOENT') { // no such file or directory. File really does not exist
      return false;
    }

    console.log('Exception fs.statSync (' + path + '): ' + e);
    throw e; // something else went wrong, we don't have rights, ...
  }
}

/**
 *
 * @param {object} options
 * @param {string} [options.dest='']
 * @param {boolean} [options.progress=false]
 * @param {boolean} [options.overwrite=true]
 //* @param {boolean} [options.verbose=false]
 * @constructor
 */
var Downloader = function(options) {
  var self = this;
  EventEmitter.call(self);

  options = options || {};
  options.dest = options.dest || '';
  options.progress  = typeof options.progress  !== 'undefined' ? options.progress  : false;
  options.overwrite = typeof options.overwrite !== 'undefined' ? options.overwrite : false;
  options.strictSSL = typeof options.strictSSL !== 'undefined' ? options.strictSSL : true;
  //options.verbose   = typeof options.verbose   !== 'undefined' ? options.verbose   : false;

  var totalProgress = new Progress();

  self.callback = null;


  /**
   *
   * @param {object} linkObj
   * @param {string} linkObj.url
   * @param {string} [linkObj.path='']
   * @param {string} linkObj.name
   * @param {number} index
   * @param {function} callback
   * @private
   */
  self._downloadOne = function(linkObj, index, callback) {
    var date, contentLength, contentDisposition, contentType;
    var success;
    console.log('success:', success);
    var fileProgress = new Progress();

    //

    var onResponse = function(res) {
      success = true; //

      if (res.statusCode !== 200) {
        success = false;
        console.log('success:', success);
        var err = new Error('Invalid statusCode received: '+ res.statusCode + ' while downloading URL \''+linkObj.url+'\'');
        _onError(err);
        req.abort();
        return;
      }

      date = res.headers.date;

      contentDisposition = res.headers[ 'content-disposition' ]; // Remote file name if set
      contentLength = parseInt(res.headers[ 'content-length' ]);
      contentType   = res.headers[ 'content-type' ]; // application/octet-stream text/plain

      // Attempting to determine file name
      var fname;
      if (linkObj.name) {                 // if name is explicitly set
        fname = path.join(linkObj.name);

      } else if (contentDisposition) {    // get it from content-disposition header if set
        var regexp = /filename=\"(.*)\"/gi;
        fname = regexp.exec( res.headers['content-disposition'] )[1];

      } else {                           // Try to extract last part from url
        var parsed = url.parse(linkObj.url);
        fname = path.basename(parsed.pathname);
      }

      fname = fname || 'noname';

      // File path
      var filepath = path.join(options.dest, linkObj.path, fname);

      // Check if file already exists
      // This check must be done only after emitting 'start' to ensure correct
      if (fileExistsSync(filepath) && !options.overwrite) {
        console.log('* File already exists, skipping: ' + filepath);
        success = true;
        console.log('success:', success);
        totalProgress.count--;
        req.abort();
        return;
      }

      // Attempt to determine file size
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

      // Pipe to local file
      res.pipe(fs.createWriteStream(filepath));
    };

    var onData = function (chunk) {
      fileProgress.add(chunk.length);
      totalProgress.add(chunk.length);

      self.emit('file-progress', linkObj, fileProgress);

      self.emit('progress', totalProgress);
      if (options.progress) {
        spinner.spin();
      }
    };

    var _onEnd = function() {
      //console.log('res.on(end): linkObj.url: ' + linkObj.url);
      self.emit('file-end', linkObj, fileProgress);

      totalProgress.count--;
      totalProgress.active--;

      if (totalProgress.count === 0) {
        self.emit('end', totalProgress);
      }
    };

    var onEnd = function() {
      _onEnd();
      console.log('success:', success);
      callback(null, success); // callback to async.someSeries(), true means to finish it
    };

    var _onError = function(err) {
      //console.log('res.on(error): linkObj.url: ' + linkObj.url + ', err:', err);
      totalProgress.count--;
      totalProgress.active--;

      self.emit('file-error', err, linkObj);
      self.emit('error', err, linkObj);
    };

    var onError = function (err) {
      success = false;
      console.log('success:', success);
      _onError(err);
      callback(err, success); // callback to async.someSeries(), false means to continue to next item
    };

    var onAbort = function () {
      console.log('onAbort()');
    };

    var onAborted = function () {
      console.log('onAborted()');
    };

    //

    //console.log('self._downloadOne', linkObj, index, typeof callback);
    if (typeof callback !== 'function') { callback = function() {}; } // Sanitize callback

    if (!linkObj) { self.emit('error', new Error('_downloadOne(): Parameter linkObj must be provided')); }

    linkObj.path = linkObj.path || '';

    var dir = path.join(options.dest, linkObj.path);
    mkdirp(dir);
    //console.log('_downloadOne(): ' + linkObj.url + ' -> ' + filepath);

    self.emit('file-add', linkObj, fileProgress);
    totalProgress.count++;
    self.emit('add', totalProgress);

    // var urlObject = url.parse(linkObj.url);
    // urlObject.rejectUnauthorized = options.rejectUnauthorized;

    var req = request({
      url: linkObj.url,
      strictSSL: options.strictSSL
    });

    req
      .on('response', onResponse)
      .on('data',     onData)
      .on('end',      onEnd)
      .on('error',    onError)
      .on('abort',    onAbort)
      .on('aborted',  onAborted)
    ;

  };


  self._downloadOneOf = function(linksObj, index, callback) {
    console.log('_downloadOneOf(): linksObj:', linksObj);

    var urls = linksObj.url || linksObj.urls;         // any parameter applicable
    urls = typeof urls === 'string' ? [urls] : urls; // convert to array

    console.log('_downloadOneOf(): urls:', urls);

    async.someSeries(
      urls,
      function(url, cb) {
        var linkObj = {
          url:  url,
          name: linksObj.name,
          path: linksObj.path,
        };
        self._downloadOne(linkObj, index, cb);
      },
      function done(err, result) {
        console.log('async.someSeries() callback returned: err:', err, ', result: ', result);
        if (!err && !result) {
          err = new Error('Not all files were downloaded');
        }
        callback(err);
      }
      // callback
    );
  };


  self.download = function(linkObjs, callback) {
    if (typeof callback !== 'function') { callback = function() {}; } // Sanitize callback

    if (!Array.isArray(linkObjs)) {
      linkObjs = [linkObjs];
    }

    async.eachOf(linkObjs, self._downloadOneOf,
      // function done(err, result) {
      //   console.log('async.eachOf() callback returned: err:', err, ', result: ', result);
      //   if (!err && !result) {
      //     err = new Error('Not all files were downloaded');
      //   }
      //   callback(err);
      // }
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
