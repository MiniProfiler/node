var expect = require('chai').expect;
var server = require('./server');

describe('MiniProfiler Tests', function() {
  before(server.start);
  after(server.stop);

  it('Unprofiled route should not return Profiler ID', function(done) {
    server.get('/unprofiled', (err, response) => {
      expect(response.headers).to.not.include.keys('x-miniprofiler-ids');
      done();
    });
  });
});
