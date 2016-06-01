'use strict';

var expect = require('chai').expect;

module.exports = function(server) {
  describe('Custom Configuration Tests', function() {
    before(server.setUp.bind(null, 'custom-config'));
    after(server.tearDown);

    it('Index page should include MiniProfiler javascript with custom settings', function(done) {
      server.get('/', (err, response, body) => {
        var ids = JSON.parse(response.headers['x-miniprofiler-ids']);
        expect(ids).to.have.lengthOf(1);

        expect(body.trim()).to.be.equal(`<script async type="text/javascript" id="mini-profiler" src="/mini-profiler-resources/includes.js?v=" data-version="" data-path="/mini-profiler-resources/" data-current-id="${ids[0]}" data-ids="${ids[0]}" data-position="right" data-trivial="true" data-children="false" data-max-traces="15" data-controls="true" data-authorized="true" data-toggle-shortcut="" data-start-hidden="false" data-trivial-milliseconds="2.5"></script>`);
        done();
      });
    });

  });
};
