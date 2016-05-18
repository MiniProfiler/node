var expect = require('chai').expect;
var server = require('./server');

describe('MiniProfiler Share Tests', function() {
  before(server.start);
  after(server.stop);

  it('Valid profiled id should render share page', function(done) {
    server.get('/', (err, response) => {
      var ids = JSON.parse(response.headers['x-miniprofiler-ids']);

      server.get(`/mini-profiler-resources/results?id=${ids[0]}`, (err, response, body) => {
        expect(response.statusCode).to.be.equal(200);
        expect(response.headers['content-type']).to.be.equal('text/html');
        done();
      });

    });
  });

  it('Invalid profiled id should render 404', function(done) {
    server.get(`/mini-profiler-resources/results?id=123`, (err, response, body) => {
      expect(response.statusCode).to.be.equal(404);
      expect(response.headers['content-type']).to.be.equal('text/html');
      done();
    });
  });

  it('Invalid profiled id should render 404', function(done) {
    server.post(`/mini-profiler-resources/results`, { id: 123 }, (err, response, body) => {
      expect(response.statusCode).to.be.equal(404);
      expect(response.headers['content-type']).to.be.equal('text/html');
      done();
    });
  });

});
