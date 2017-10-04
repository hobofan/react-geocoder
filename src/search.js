var xhr = require('xhr');

function search(endpoint, source, accessToken, proximity, bbox, types, country, language, query, callback) {
  var searchTime = new Date();
  var uri = endpoint + '/geocoding/v5/' +
    source + '/' + encodeURIComponent(query) + '.json' +
    '?access_token=' + accessToken +
    (proximity ? '&proximity=' + proximity : '') +
    (bbox ? '&bbox=' + bbox : '') +
    (types ? '&types=' + encodeURIComponent(types) : '') +
    (country ? '&country=' + encodeURIComponent(country) : '') +
    (language ? '&language=' + encodeURIComponent(language) : '');
  xhr({
    uri: uri,
    json: true
  }, function(err, res, body) {
    callback(err, res, body, searchTime);
  });
}

module.exports = search;
