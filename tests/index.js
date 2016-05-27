var servers = require('./servers');
var fs = require('fs');
var _ = require('underscore');

var testCases = _.filter(fs.readdirSync('./tests'), (file) => file.endsWith('-test.js'));

for (var server of servers) {
  describe(`[${server.framework}]`, function() {
    for (var testCase of testCases) {
      require(`./${testCase}`)(server);
    }
  });
}
