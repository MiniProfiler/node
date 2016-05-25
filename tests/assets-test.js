var expect = require('chai').expect;
var fs = require('fs');
var servers = require('./servers');

for (var server of servers) {
  describe(`[${server.framework}] MiniProfiler Assets Tests`, function() {
    before(server.start.bind(null, 'default'));
    after(server.stop);

    var files = [
      'includes.css',
      'includes.tmpl',
      'includes.js'
    ];

    files.forEach((file) => {
      it(`Should return ${file} file`, function(done) {
        server.get(`/mini-profiler-resources/${file}`, (err, response, body) => {
          fs.readFile(`./ui/${file}`, 'utf-8', (err, content) => {
            expect(body).to.be.equal(content);
            done();
          });
        });
      });
    });

    it('Unknown file should return 404', function(done) {
      server.get('/mini-profiler-resources/unknown.js', (err, response, body) => {
        expect(response.statusCode).to.be.equal(404);
        expect(body).to.be.equal('Resource unavailable.');
        expect(response.headers['content-type']).to.be.equal('text/plain; charset=utf-8');
        done();
      });
    });

  });
}
