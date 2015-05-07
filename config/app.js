var returnTo = getQueryParam('return_to', 'pebblejs://close#');

$('#btn-search').on('click', function (event) {
  event.preventDefault();

  $('#developers').html('');
  var developerName = $('#developer').val();
  if (developerName.length <= 1) {
    return;
  }

  superagent.get('http://pblweb.com/hearts/app/developer-search?query=' + developerName, function (err, res) {
    if (err) {
      return console.log(err);
    }
    res.body.forEach(function (dev) {
      var $p = $('<h3/>');
      var $a = $('<a/>').text(dev.name).attr('href', returnTo + dev.id);
      var $small = $('<h5/>').addClass('small').text(dev.apps.join(', '));
      $p.append($a);
      $p.append($small);
      $('#developers').append($p);
    });
  });
});


// Something like this to get query variables.
function getQueryParam(variable, defaultValue) {
  // Find all URL parameters
  var query = location.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');

    // If the query variable parameter is found, decode it to use and return it for use
    if (pair[0] === variable) {
      return decodeURIComponent(pair[1]);
    }
  }
  return defaultValue || false;
}
