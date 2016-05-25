var expect = require('chai').expect;
var servers = require('./servers');

for (var server of servers) {

  describe(`[${server.framework}] MiniProfiler Step Tests`, function() {
    before(server.start.bind(null, 'default'));
    after(server.stop);

    it('Index route should not profile any step', function(done) {
      server.get('/', (err, response) => {
        var ids = JSON.parse(response.headers['x-miniprofiler-ids']);
        expect(ids).to.have.lengthOf(1);

        server.post('/mini-profiler-resources/results', { id: ids[0], popup: 1 }, (err, response, body) => {
          var result = JSON.parse(body);
          expect(result.Id).to.equal(ids[0]);
          expect(result.Name).to.equal('/');
          expect(result.Root.Children).to.be.empty;

          done();
        });
      });
    });

    it('step route should profile one step', function(done) {
      server.get('/step', (err, response) => {
        var ids = JSON.parse(response.headers['x-miniprofiler-ids']);
        expect(ids).to.have.lengthOf(1);

        server.post('/mini-profiler-resources/results', { id: ids[0], popup: 1 }, (err, response, body) => {
          var result = JSON.parse(body);
          expect(result.Id).to.equal(ids[0]);
          expect(result.Name).to.equal('/step');
          expect(result.Root.Children).to.have.lengthOf(1);

          expect(result.Root.Children[0].Name).to.equal('Step 1');
          expect(result.Root.Children[0].Children).to.be.empty;

          done();
        });
      });
    });

    it('step-two route should profile two nested step', function(done) {
      server.get('/step-two', (err, response) => {
        var ids = JSON.parse(response.headers['x-miniprofiler-ids']);
        expect(ids).to.have.lengthOf(1);

        server.post('/mini-profiler-resources/results', { id: ids[0], popup: 1 }, (err, response, body) => {
          var result = JSON.parse(body);
          expect(result.Id).to.equal(ids[0]);
          expect(result.Name).to.equal('/step-two');
          expect(result.Root.Children).to.have.lengthOf(1);

          expect(result.Root.Children[0].Name).to.equal('Step 1');
          expect(result.Root.Children[0].Children).to.have.lengthOf(1);

          expect(result.Root.Children[0].Children[0].Name).to.equal('Step 2');
          expect(result.Root.Children[0].Children[0].Children).to.be.empty;
          done();
        });
      });
    });
  });
}
