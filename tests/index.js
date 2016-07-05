'use strict';

var fs = require('fs');
var servers = require('./servers');

var testCases = fs.readdirSync('./tests').filter((file) => file.endsWith('-test.js'));

for (var server of servers) {
  describe(`[${server.framework}]`, function() {
    for (var testCase of testCases) {
      require(`./${testCase}`)(server);
    }
  });
}
