var expect = require('chai').expect;
var server = require('./server/default');

describe('MiniProfiler Tests', function() {
  before(server.start);
  after(server.stop);

  it('Profiled routes should always return Profiler ID', function(done) {
    server.get('/', (err, response) => {
      expect(response.headers).to.include.keys('x-miniprofiler-ids');
      done();
    });
  });
  
});
