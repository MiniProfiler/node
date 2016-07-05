'use strict';

 var _ = require('./utils.js');

let insertInOrder = (array, timing) => {
  if (timing.Start <= 0)
    return;

  for(let key in array) {
    if (timing.Start <= array[key].Start) {
      return array.splice(key, 0, timing);
    }
  }

  return array.push(timing);
};

module.exports = (postData) => {
  let preffix = 'clientPerformance[timing][';

  let postDataTimings = { };
  let clientTimings = [ ];
  let navigationStart = 0;

  for(let postDataKey in postData) {
    if (postDataKey.startsWith(preffix)) {
      let key = postDataKey.substring(preffix.length, postDataKey.length - 1);
      if (key == 'navigationStart')
        navigationStart = parseInt(postData[postDataKey]);
      else
        postDataTimings[key] = parseInt(postData[postDataKey]);
    }
  }

  if (!navigationStart)
    return null;

  for(let key in postDataTimings) {
    if (key.endsWith('Start')) {

      let eventName = key.slice(0, -5);
      let eventStartTime = postDataTimings[`${eventName}Start`];
      let eventEndTime = postDataTimings[`${eventName}End`];

      let timing = {
        Name: _.toTitleCase(eventName),
        Start: eventStartTime - navigationStart,
        Duration: eventEndTime - eventStartTime
      };

      if (!timing.Duration) {
        timing.Name = _.toTitleCase(`${eventName}Start`);
        timing.Duration = -1;
      }

      insertInOrder(clientTimings, timing);

    } else if (!key.endsWith('End')) {
      insertInOrder(clientTimings, {
        Name: _.toTitleCase(key),
        Start: postDataTimings[key] - navigationStart,
        Duration: -1
      });
    }
  }

  return {
    RedirectCount: parseInt(postData['clientPerformance[navigation][redirectCount]']),
    Timings: clientTimings
  };
};
