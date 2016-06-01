'use strict';

var expect = require('chai').expect;

module.exports = function(server) {
  describe('Time Query Tests', function() {
    before(server.setUp.bind(null, 'default'));
    after(server.tearDown);

    for(var url of ['/js-sleep', '/js-sleep-start-stop']) {
      it(`Custom timed query should be profiled for url '${url}'`, function(done) {
        server.get(url, (err, response) => {
          var ids = JSON.parse(response.headers['x-miniprofiler-ids']);
          expect(ids).to.have.lengthOf(1);

          server.post('/mini-profiler-resources/results/', { id: ids[0], popup: 1 }, (err, response, body) => {
            var result = JSON.parse(body);
            expect(result.Id).to.equal(ids[0]);
            expect(result.Name).to.equal(url);
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
    }

  });
};
