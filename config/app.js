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
      var $a = $('<a/>').text(dev.name).attr('href', 'pebblejs://close#' + dev.id);
      var $small = $('<h5/>').addClass('small').text(dev.apps.join(', '));
      $p.append($a);
      $p.append($small);
      $('#developers').append($p);
    });
  });
});
