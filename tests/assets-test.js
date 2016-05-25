var expect = require('chai').expect;
var fs = require('fs');

for (var fw of ['express', 'koa']) {
  var server = require(`./server/${fw}/default`);

  describe(`[${fw}] MiniProfiler Assets Tests`, function() {
    before(server.start);
    after(server.stop);

    var files = [
      'includes.css',
      'includes.tmpl',
      'includes.js'
    ];

    files.forEach((file) => {
      it(`Should return ${file} file`, function(done) {
        server.get(`/mini-profiler-resources/${file}`, (err, response, body) => {
          expect(body).to.be.equal(fs.readFileSync(`./ui/${file}`, 'utf-8'));
          done();
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
