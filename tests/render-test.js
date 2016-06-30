'use strict';

var expect = require('chai').expect;

module.exports = function(server) {

  describe('Render Tests', function() {
    before(server.setUp.bind(null, 'render'));
    after(server.tearDown);

    it('Should add render step', function(done) {
      server.get('/', (err, response) => {
        var ids = JSON.parse(response.headers['x-miniprofiler-ids']);
        expect(ids).to.have.lengthOf(1);

        server.post('/mini-profiler-resources/results', { id: ids[0], popup: 1 }, (err, response, body) => {
          var result = JSON.parse(body);
          expect(result.Id).to.equal(ids[0]);
          expect(result.Name).to.equal('/');
          expect(result.Root.Children).to.have.lengthOf(1);

          expect(result.Root.Children[0].Name).to.equal('Render: index');
          expect(result.Root.Children[0].Children).to.be.empty;

          done();
        });
      });
    });

    it('Should add render step inside another step', function(done) {
      server.get('/inside-step', (err, response) => {
        var ids = JSON.parse(response.headers['x-miniprofiler-ids']);
        expect(ids).to.have.lengthOf(1);

        server.post('/mini-profiler-resources/results', { id: ids[0], popup: 1 }, (err, response, body) => {
          var result = JSON.parse(body);
          
          expect(result.Id).to.equal(ids[0]);
          expect(result.Name).to.equal('/inside-step');
          expect(result.Root.Children).to.have.lengthOf(1);

          expect(result.Root.Children[0].Name).to.equal('Step 1');
          expect(result.Root.Children[0].Children).to.have.lengthOf(1);
          expect(result.Root.Children[0].CustomTimings).to.have.property('custom');
          expect(result.Root.Children[0].CustomTimings.custom).to.have.lengthOf(1);

          expect(result.Root.Children[0].Children[0].Name).to.be.equal('Render: index');
          expect(result.Root.Children[0].Children[0].Children).to.be.empty;

          done();
        });
      });
    });

  });

};
