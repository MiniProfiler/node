'use strict';

var expect = require('chai').expect;

module.exports = function(server) {
  describe.only('Client Timing Tests', function() {
    before(server.setUp.bind(null, 'default'));
    after(server.tearDown);

    it('should return client timing data that is sent on POST', function(done) {
      server.get('/', (err, response) => {
        var ids = JSON.parse(response.headers['x-miniprofiler-ids']);

        server.post('/mini-profiler-resources/results', {
          id: ids[0],
          popup: 1,
          clientPerformance: {
            navigation: {
              redirectCount: 0
            },
            timing: {
              navigationStart: 1000,
              responseEnd: 1014,
              responseStart: 1002
            }
          }
        }, (err, response, body) => {
          var data = JSON.parse(body);
          expect(data.ClientTimings).to.be.equal({
            RedirectCount: 0,
            Timings: [{
              Name: 'Response',
              Start: 2,
              Duration: 12
            }]
          });
          done();
        });
      });
    });

  });

};
