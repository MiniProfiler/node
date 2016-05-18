var expect = require('chai').expect;
var server = require('./server/unprofiled');

describe('MiniProfiler Unprofiled Tests', function() {
  before(server.start);
  after(server.stop);

  it('Unprofiled route should not return Profiler ID', function(done) {
    server.get('/', (err, response) => {
      expect(response.headers).to.not.include.keys('x-miniprofiler-ids');
      done();
    });
  });
});
