var expect = require('chai').expect;

module.exports = function(server) {
  describe('Postgres Tests', function() {
    before(server.setUp.bind(null, 'default'));
    after(server.tearDown);

    for (let url of ['/pg-select', '/pg-select-event']) {

      it(`Should profile postgres SELECT command for url '${url}'`, function(done) {
        server.get(url, (err, response) => {
          var ids = JSON.parse(response.headers['x-miniprofiler-ids']);
          expect(ids).to.have.lengthOf(1);

          server.post('/mini-profiler-resources/results/', { id: ids[0], popup: 1 }, (err, response, body) => {
            var result = JSON.parse(body);

            expect(result.Id).to.equal(ids[0]);
            expect(result.Name).to.equal(url);
            expect(result.Root.Children).to.be.empty;
            expect(result.Root.CustomTimings).to.have.property('sql');
            expect(result.Root.CustomTimings.sql).to.have.lengthOf(1);

            expect(result.Root.CustomTimings.sql[0].ExecuteType).to.be.equal('sql');
            expect(result.Root.CustomTimings.sql[0].CommandString).to.be.equal('SELECT $1::int AS number');
            expect(result.Root.CustomTimings.sql[0].DurationMilliseconds).to.be.below(result.DurationMilliseconds);
            done();
          });
        });
      });

    }
  });
};
