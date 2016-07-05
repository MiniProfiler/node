'use strict';

const isFunction = (obj) => {
  return typeof obj == 'function' || false;
};

const tagsToReplace = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;'
};

const escape = (str) => {
  return str.replace(/[&<>]/g, function(tag) {
    return tagsToReplace[tag] || tag;
  });
};

const compact = (arr) => {
  return arr.filter((v) => v);
};

const uuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
};

const toTitleCase = (str) => {
  return str.replace(/ /g,'').split(/(?=[A-Z])/).join(' ').replace(/^.| ./g, (m) => {
    return m.toUpperCase();
  });
};

const template = (content) => {
  return (options) => {
    return content.replace(/{(.+?)}/g, (match, key) => {
      return options[key];
    });
  };
};

module.exports = {
  isFunction, escape, compact, uuid, toTitleCase, template
};
