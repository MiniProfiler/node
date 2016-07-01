module.exports = (postData) => {
  var preffix = 'clientPerformance[timing][';

  var timings = { };
  for(var postDataKey in postData) {
    if (postDataKey.startsWith(preffix)) {
      var key = postDataKey.substring(preffix.length, postDataKey.length - 1);
      timings[key] = parseInt(postData[postDataKey]);
    }
  }
  console.log(timings)

  return {
    RedirectCount: parseInt(postData['clientPerformance[navigation][redirectCount]'])
  };
}
