var expect = require('chai').expect;

module.exports = function(server) {
  describe('Redis Tests', function() {
    before(server.setUp.bind(null, 'default'));
    after(server.tearDown);

    it('Should profile redis SET command', function(done) {
      server.get('/redis-set-key', (err, response) => {
        var ids = JSON.parse(response.headers['x-miniprofiler-ids']);
        expect(ids).to.have.lengthOf(1);

        server.post('/mini-profiler-resources/results/', { id: ids[0], popup: 1 }, (err, response, body) => {
          var result = JSON.parse(body);

          expect(result.Id).to.equal(ids[0]);
          expect(result.Name).to.equal('/redis-set-key');
          expect(result.Root.Children).to.be.empty;
          expect(result.Root.CustomTimings).to.have.property('redis');
          expect(result.Root.CustomTimings.redis).to.have.lengthOf(1);

          expect(result.Root.CustomTimings.redis[0].ExecuteType).to.be.equal('redis');
          expect(result.Root.CustomTimings.redis[0].CommandString).to.be.equal('set key, Awesome!');
          expect(result.Root.CustomTimings.redis[0].DurationMilliseconds).to.be.below(result.DurationMilliseconds);
          done();
        });
      });

    });

    it('Should profile redis SET and GET command', function(done) {
      server.get('/redis-set-get-key', (err, response) => {
        var ids = JSON.parse(response.headers['x-miniprofiler-ids']);
        expect(ids).to.have.lengthOf(1);

        server.post('/mini-profiler-resources/results/', { id: ids[0], popup: 1 }, (err, response, body) => {
          var result = JSON.parse(body);

          expect(result.Id).to.equal(ids[0]);
          expect(result.Name).to.equal('/redis-set-get-key');
          expect(result.Root.Children).to.be.empty;
          expect(result.Root.CustomTimings).to.have.property('redis');
          expect(result.Root.CustomTimings.redis).to.have.lengthOf(2);

          expect(result.Root.CustomTimings.redis[0].ExecuteType).to.be.equal('redis');
          expect(result.Root.CustomTimings.redis[0].CommandString).to.be.equal('set key, Awesome!');
          expect(result.Root.CustomTimings.redis[0].DurationMilliseconds).to.be.below(result.DurationMilliseconds);

          expect(result.Root.CustomTimings.redis[1].ExecuteType).to.be.equal('redis');
          expect(result.Root.CustomTimings.redis[1].CommandString).to.be.equal('get key');
          expect(result.Root.CustomTimings.redis[1].DurationMilliseconds).to.be.below(result.DurationMilliseconds);
          done();
        });
      });

    });

  });
};
