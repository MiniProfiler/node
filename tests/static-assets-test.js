var expect = require('chai').expect;
var server = require('./server');
var fs = require('fs');

describe('MiniProfiler Static Assets Tests', function() {
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
    server.get('/mini-profiler-resources/unkown.js', (err, response, body) => {
      expect(response.statusCode).to.be.equal(404);
      expect(response.headers['content-type']).to.be.equal('text/html');
      expect(body).to.be.equal('Resource unavailable.');
      done();
    });
  });

});
