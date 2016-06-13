'use strict';

var expect = require('chai').expect;

module.exports = function(server) {
  describe('Custom Configuration Tests', function() {
    this.timeout(5000);

    before(server.setUp.bind(null, 'custom-config'));
    after(server.tearDown);

    it('should include MiniProfiler javascript with custom settings', function(done) {
      server.get('/', (err, response, body) => {
        var ids = JSON.parse(response.headers['x-miniprofiler-ids']);
        expect(ids).to.have.lengthOf(1);

        expect(body.trim()).to.be.equal(`<script async type="text/javascript" id="mini-profiler" src="/mini-profiler-resources/includes.js?v=" data-version="" data-path="/mini-profiler-resources/" data-current-id="${ids[0]}" data-ids="${ids[0]}" data-position="right" data-trivial="true" data-children="false" data-max-traces="15" data-controls="true" data-authorized="true" data-toggle-shortcut="" data-start-hidden="false" data-trivial-milliseconds="2.5"></script>`);
        done();
      });
    });

    it('should get/set timing from redis storage', function(done) {
      server.get('/?key=value', (err, response, body) => {
        var ids = JSON.parse(response.headers['x-miniprofiler-ids']);
        expect(ids).to.have.lengthOf(1);

        server.post('/mini-profiler-resources/results', { id: ids[0], popup: 1 }, (err, response, body) => {
          var result = JSON.parse(body);
          expect(result.Id).to.equal(ids[0]);
          expect(result.Name).to.equal('/?key=value');
          expect(result.Root.Children).to.be.empty;

          done();
        });
      });
    });

  });
};
