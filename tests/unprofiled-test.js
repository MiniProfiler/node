var expect = require('chai').expect;

module.exports = function(server) {
  describe('Unprofiled Tests', function() {
    before(server.setUp.bind(null, 'unprofiled'));
    after(server.tearDown);

    it('Unprofiled server should not return Profiler ID', function(done) {
      server.get('/', (err, response) => {
        expect(response.headers).to.not.include.keys('x-miniprofiler-ids');
        done();
      });
    });

    it('Unprofiled server should not include assets', function(done) {
      server.get('/', (err, response, body) => {
        expect(body).to.be.equal('');
        done();
      });
    });

    var paths = [
      '/',
      '/includes.css',
      '/results',
      '/results?id=2'
    ];

    paths.forEach((path) => {
      it(`Unprofiled server should not find ${path}`, function(done) {
        server.get(`/mini-profiler-resources${path}`, (err, response, body) => {
          expect(response.statusCode).to.be.equal(404);
          expect(response.headers['content-type']).to.be.equal('text/plain; charset=utf-8');
          expect(body).to.be.equal('MiniProfiler is disabled');
          done();
        });
      });
    });
  });

};
