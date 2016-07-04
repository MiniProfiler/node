'use strict';

var expect = require('chai').expect;
var pkg = require('../package.json');

module.exports = function(server) {
  describe('Basic Tests', function() {
    before(server.setUp.bind(null, 'default'));
    after(server.tearDown);

    it('Profiled routes should always return Profiler ID', function(done) {
      server.get('/', (err, response) => {
        expect(response.headers).to.include.keys('x-miniprofiler-ids');
        done();
      });
    });

    it('Index page should include MiniProfiler javascript', function(done) {
      server.get('/', (err, response, body) => {
        var ids = JSON.parse(response.headers['x-miniprofiler-ids']);
        expect(ids).to.have.lengthOf(1);

        expect(body.trim()).to.be.equal(`<script async type="text/javascript" id="mini-profiler" src="/mini-profiler-resources/includes.js?v=${pkg.version}" data-version="${pkg.version}" data-path="/mini-profiler-resources/" data-current-id="${ids[0]}" data-ids="${ids[0]}" data-position="left" data-trivial="true" data-children="false" data-max-traces="15" data-controls="true" data-authorized="true" data-toggle-shortcut="" data-start-hidden="false" data-trivial-milliseconds="2.5"></script>`);
        done();
      });
    });

    it('Should return url parameters on results response', function(done) {
      server.get('/?key1=value1&key2=value2', (err, response, body) => {
        var ids = JSON.parse(response.headers['x-miniprofiler-ids']);
        expect(ids).to.have.lengthOf(1);

        server.get(`/mini-profiler-resources/results?id=${ids[0]}&popup=1`, (err, response, body) => {
          var result = JSON.parse(body);
          expect(result.Id).to.equal(ids[0]);
          expect(result.Name).to.equal('/?key1=value1&key2=value2');
          expect(result.Root.Children).to.be.empty;

          done();
        });
      });
    });

  });
};
