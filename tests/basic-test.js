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

  it('Custom timed query should be profiled', function(done) {
    server.get('/js-sleep', (err, response) => {
      var ids = JSON.parse(response.headers['x-miniprofiler-ids']);
      expect(ids).to.have.lengthOf(1);

      server.post('/mini-profiler-resources/results', { id: ids[0], popup: 1 }, (err, response, body) => {
        var result = JSON.parse(body);
        expect(result.Id).to.equal(ids[0]);
        expect(result.Name).to.equal('/js-sleep');
        expect(result.DurationMilliseconds).to.be.above(200);
        expect(result.Root.Children).to.be.empty;
        expect(result.Root.CustomTimings).to.have.property('custom');
        expect(result.Root.CustomTimings.custom).to.have.lengthOf(1);
        expect(result.Root.CustomTimings.custom[0].ExecuteType).to.be.equal('custom')
        expect(result.Root.CustomTimings.custom[0].CommandString).to.be.equal('Sleeping...')
        expect(result.Root.CustomTimings.custom[0].DurationMilliseconds).to.be.above(result.DurationMilliseconds);
        done();
      });
    });

  });

});
