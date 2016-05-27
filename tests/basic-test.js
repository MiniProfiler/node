var expect = require('chai').expect;

module.exports = function(server) {
  describe('Basic Tests', function() {
    before(server.setUp.bind(null, 'default'));
    after(server.tearDown);

    it('Profiled routes should always return Profiler ID', function(done) {
      server.get('/', (err, response) => {
        expect(response.headers).to.include.keys('x-miniprofiler-ids');
        done();
      });
    });

    it('Index page should include MiniProfiler javascript', function(done) {
      server.get('/', (err, response, body) => {
        var ids = JSON.parse(response.headers['x-miniprofiler-ids']);
        expect(ids).to.have.lengthOf(1);

        expect(body).to.be.equal(`<script async type="text/javascript" id="mini-profiler" src="/mini-profiler-resources/includes.js?v=" data-version="" data-path="/mini-profiler-resources/" data-current-id="${ids[0]}" data-ids="${ids[0]}" data-position="left" data-trivial="true" data-children="false" data-max-traces="15" data-controls="true" data-authorized="true" data-toggle-shortcut="" data-start-hidden="false" data-trivial-milliseconds="2.5"></script>\r\n`);
        done();
      });
    });

    it('Custom timed query should be profiled', function(done) {
      server.get('/js-sleep', (err, response) => {
        var ids = JSON.parse(response.headers['x-miniprofiler-ids']);
        expect(ids).to.have.lengthOf(1);

        server.post('/mini-profiler-resources/results/', { id: ids[0], popup: 1 }, (err, response, body) => {
          var result = JSON.parse(body);
          expect(result.Id).to.equal(ids[0]);
          expect(result.Name).to.equal('/js-sleep');
          expect(result.DurationMilliseconds).to.be.above(40);
          expect(result.Root.Children).to.be.empty;
          expect(result.Root.CustomTimings).to.have.property('custom');
          expect(result.Root.CustomTimings.custom).to.have.lengthOf(1);

          expect(result.Root.CustomTimings.custom[0].ExecuteType).to.be.equal('custom');
          expect(result.Root.CustomTimings.custom[0].CommandString).to.be.equal('Sleeping...');
          expect(result.Root.CustomTimings.custom[0].DurationMilliseconds).to.be.below(result.DurationMilliseconds);
          done();
        });
      });

    });

  });
};
