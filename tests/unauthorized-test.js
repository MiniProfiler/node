'use strict';

var expect = require('chai').expect;

module.exports = function(server) {
  describe('Unauthorized Tests', function() {
    before(server.setUp.bind(null, 'unauthorized'));
    after(server.tearDown);

    it('should return profile ID', function(done) {
      server.get('/', (err, response, body) => {
        expect(response.headers).to.include.keys('x-miniprofiler-ids');
        expect(body).to.be.equal('');
        done();
      });
    });

    it('should not allow user to get timing information from ID', function(done) {
      server.get('/', (err, response) => {
        var ids = JSON.parse(response.headers['x-miniprofiler-ids']);

        server.post('/mini-profiler-resources/results', { id: ids[0], popup: 1 }, (err, response, body) => {
          expect(response.statusCode).to.be.equal(401);
          expect(body).to.be.equal('');
          done();
        });
      });
    });

  });

};
