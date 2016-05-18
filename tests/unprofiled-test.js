var expect = require('chai').expect;
var server = require('./server/unprofiled');

describe('MiniProfiler Unprofiled Tests', function() {
  before(server.start);
  after(server.stop);

  it('Unprofiled server should not return Profiler ID', function(done) {
    server.get('/', (err, response) => {
      expect(response.headers).to.not.include.keys('x-miniprofiler-ids');
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
    it(`Unprofiled server should not find ${path} route`, function(done) {
      server.get(`/mini-profiler-resources${path}`, (err, response, body) => {
        expect(response.statusCode).to.be.equal(404);
        expect(response.headers['content-type']).to.be.equal('text/plain');
        expect(body).to.be.equal('MiniProfiler is disabled.');
        done();
      });
    });
  });
});
