var expect = require('chai').expect;
var servers = require('./servers');

for (var server of servers) {

  describe(`[${server.framework}] MiniProfiler Share Tests`, function() {
    before(server.start.bind(null, 'default'));
    after(server.stop);

    var expectOkResponse = (done) => (err, response, body) => {
      expect(response.statusCode).to.be.equal(200);
      expect(response.headers['content-type']).to.be.equal('text/html; charset=utf-8');
      done();
    };

    var expectNotFoundResponse = (done) => (err, response, body) => {
      expect(response.statusCode).to.be.equal(404);
      expect(response.headers['content-type']).to.be.equal('text/plain; charset=utf-8');
      done();
    };

    it('[GET] Valid profiled id should render share page', function(done) {
      server.get('/', (err, response) => {
        var ids = JSON.parse(response.headers['x-miniprofiler-ids']);

        server.get(`/mini-profiler-resources/results?id=${ids[0]}`, expectOkResponse(done));

      });
    });

    it('[POST] Valid profiled id should render share page', function(done) {
      server.get('/', (err, response) => {
        var ids = JSON.parse(response.headers['x-miniprofiler-ids']);

        server.post('/mini-profiler-resources/results', { id: ids[0] }, expectOkResponse(done));

      });
    });

    it('[GET] Invalid profiled id should render 404', function(done) {
      server.get('/mini-profiler-resources/results?id=123', expectNotFoundResponse(done));
    });

    it('[POST] Invalid profiled id should render 404', function(done) {
      server.post('/mini-profiler-resources/results', { id: 123 }, expectNotFoundResponse(done));
    });

  });
}
