'use strict';
var fs = require('fs');
var path = require('path');
var _ = require('underscore');

_.templateSettings = {
	interpolate: /\{(.+?)\}/g
};

var fileStore = { };
var includesDir = path.join(path.dirname(module.filename), '../ui');

var readFile = function(name, callback) {
  if (fileStore[name]) {
    callback(null, fileStore[name]);
  } else {
    fs.readFile(path.join(includesDir, name), 'utf-8', (err, text) => {
      fileStore[name] = text;
      callback(err, text);
    });
  }
};

var templates = {
	partial: _.template(fs.readFileSync(path.join(includesDir, 'include.partial.html')).toString()),
	share: _.template(fs.readFileSync(path.join(includesDir, 'share.html')).toString())
};

var partial = function(options) {
  return templates.partial(options);
};

var share = function(options) {
  return templates.share(options);
};

module.exports = { readFile, partial, share };