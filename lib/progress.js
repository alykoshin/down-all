/**
 * Created by alykoshin on 11.02.16.
 */

'use strict';


var Progress = function() {
  this.size = 0;
  this.count = 0;
  this.active = 0;
  this.progress = 0;
  this.percent = -1; // Unknown
};

Progress.prototype.add = function(size) {
  this.progress = this.progress + size;

  this.percent = Math.ceil(100 * this.progress / this.size);

  if (this.percent === Infinity || isNaN(this.percent)) {
    this.percent = -1;
  }
};


module.exports = Progress;
