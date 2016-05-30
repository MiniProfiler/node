var expect = require('chai').expect;

module.exports = function(server) {
  describe('Unprofiled Tests', function() {
    before(server.setUp.bind(null, 'unprofiled'));
    after(server.tearDown);

    ['/', '/pg', '/redis'].forEach((path) => {
      it(`should not return profiler ID for '${path}'`, function(done) {
        server.get(path, (err, response) => {
          expect(response.headers).to.not.include.keys('x-miniprofiler-ids');
          done();
        });
      });

      it(`should not include assets for '${path}'`, function(done) {
        server.get('/', (err, response, body) => {
          expect(body).to.be.equal('');
          done();
        });
      });
    });

    var paths = [
      '/',
      '/includes.css',
      '/results',
      '/results?id=2'
    ];

    paths.forEach((path) => {
      it(`should not respond for '${path}'`, function(done) {
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
