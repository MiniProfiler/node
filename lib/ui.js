'use strict';

const fileStore = { };

const fs = require('fs');
const path = require('path');
const _ = require('./utils.js');
const includesDir = path.join(path.dirname(module.filename), '../ui');

const readFile = (name, callback) => {
  if (fileStore[name]) {
    callback(null, fileStore[name]);
  } else {
    fs.readFile(path.join(includesDir, name), 'utf-8', (err, text) => {
      fileStore[name] = text;
      callback(err, text);
    });
  }
};

const templates = {
  partial: _.template(fs.readFileSync(path.join(includesDir, 'include.partial.html')).toString()),
  share: _.template(fs.readFileSync(path.join(includesDir, 'share.html')).toString())
};

const partial = (options) => templates.partial(options);

const share = (options) => templates.share(options);

module.exports = { readFile, partial, share };
