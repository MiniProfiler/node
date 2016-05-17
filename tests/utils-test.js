var expect = require('chai').expect;
var utils = require('../lib/utils.js');

describe('Utils Tests', function() {
  [
    [ 'apple', 'ap' ],
    [ 'Apple', 'Ap' ]
  ].forEach((testCase) => {
    it(`${testCase[0]} should start with ${testCase[1]}`, function() {
      expect(testCase[0].startsWith(testCase[1])).to.be.true;
    });
  });

  [
    [ 'Apple', 'ap' ],
    [ 'apple', 'at' ]
  ].forEach((testCase) => {
    it(`${testCase[0]} should not start with ${testCase[1]}`, function() {
      expect(testCase[0].startsWith(testCase[1])).to.be.false;
    });
  });

  [
    [ 'a=1&b=2', 'a=1&amp;b=2' ],
    [ '"Hello"', '&quot;Hello&quot;' ],
    [ `'World'`, '&#39;World&#39;' ],
    [ '<title/>', '&lt;title/&gt;' ]
  ].forEach((testCase) => {
    it(`${testCase[0]} should escape to ${testCase[1]}`, function() {
      expect(utils.htmlEscape(testCase[0])).to.be.equal(testCase[1]);
    });
  });
});
