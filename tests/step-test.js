'use strict';

var expect = require('chai').expect;

module.exports = function(server) {
  describe('Step Tests', function() {
    before(server.setUp.bind(null, 'default'));
    after(server.tearDown);

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

    it('/step route should profile one step', function(done) {
      server.get('/step', (err, response) => {
        var ids = JSON.parse(response.headers['x-miniprofiler-ids']);
        expect(ids).to.have.lengthOf(1);

        server.post('/mini-profiler-resources/results', { id: ids[0], popup: 1 }, (err, response, body) => {
          var result = JSON.parse(body);
          expect(result.Id).to.equal(ids[0]);
          expect(result.Name).to.equal('/step');
          expect(result.Root.Children).to.have.lengthOf(1);

          expect(result.Root.Children[0].Name).to.equal('Step');
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

    it('/step-parallel route should profile two nested step', function(done) {
      server.get('/step-parallel', (err, response) => {
        var ids = JSON.parse(response.headers['x-miniprofiler-ids']);
        expect(ids).to.have.lengthOf(1);

        server.post('/mini-profiler-resources/results', { id: ids[0], popup: 1 }, (err, response, body) => {
          var result = JSON.parse(body);
          expect(result.Id).to.equal(ids[0]);
          expect(result.Name).to.equal('/step-parallel');
          expect(result.Root.Children).to.have.lengthOf(2);

          expect(result.Root.Children[0].Name).to.equal('Step 1');
          expect(result.Root.Children[0].Children).to.be.empty;

          expect(result.Root.Children[1].Name).to.equal('Step 2');
          expect(result.Root.Children[1].Children).to.be.empty;
          done();
        });
      });
    });
  });
};
