'use strict';

var expect = require('chai').expect;

module.exports = function(server) {
  describe('Client Timing Tests', function() {
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
              loadEventStart: 1080,
              requestStart: 1001,
              secureConnectionStart: 0,
              loadEventEnd: 1112,
              responseStart: 1002,
              'First Paint Time':1200
            }
          }
        }, (err, response, body) => {
          var data = JSON.parse(body);
          expect(data.ClientTimings).to.be.deep.equal({
            RedirectCount: 0,
            Timings: [{
              Name: 'Request Start',
              Start: 1,
              Duration: -1
            },{
              Name: 'Response',
              Start: 2,
              Duration: 12
            },{
              Name: 'Load Event',
              Start: 80,
              Duration: 32
            },{
              Name: 'First Paint Time',
              Start: 200,
              Duration: -1
            }]
          });
          done();
        });
      });
    });

    it('should not return client timing when data is not sent via POST', function(done) {
      server.get('/', (err, response) => {
        var ids = JSON.parse(response.headers['x-miniprofiler-ids']);

        server.post('/mini-profiler-resources/results', {
          id: ids[0],
          popup: 1
        }, (err, response, body) => {
          var data = JSON.parse(body);
          expect(data.ClientTimings).to.be.null;
          done();
        });
      });
    });

  });

};
