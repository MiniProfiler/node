var expect = require('chai').expect;
var miniprofiler = require('../miniprofiler.js');
var server = require('./demo-server.js');

describe('MiniProfiler Tests', function() {
  before(server.start);
  after(server.stop);

  it('Unprofiled route should not return Profiler ID', function(done) {
    server.get('/unprofiled', (err, response, body) => {
      expect(response.headers).to.not.include.keys('x-miniprofiler-ids');
      done()
    })
  });
});
