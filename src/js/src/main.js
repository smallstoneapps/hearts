/* globals Pebble */
/* globals http */
/* globals AppInfo */

var Hearts = function () {

  var developerId = null;

  Pebble.addEventListener('ready', function () {
    developerId = window.localStorage.getItem('developerId', null);
    if (! developerId) {
      Pebble.sendAppMessage({ 0: 'CONFIGURE' });
    }
    else {
      Pebble.sendAppMessage({ 0: 'UPDATING' });
      updateApps();
    }
  });

  Pebble.addEventListener('showConfiguration', function () {
    Pebble.openURL('http://pblweb.com/hearts/app/config/?version=' + AppInfo.versionLabel);
  });

  Pebble.addEventListener('webviewclosed', function (event) {
    if (event.response !== 'CANCELLED') {
      developerId = event.response;
      window.localStorage.setItem('developerId', developerId);
      updateApps();
    }
  });

  function updateApps() {
    http.get('http://pblweb.com/api/v1/store/developers/' + developerId + '.json', {}, function (err, data) {
      var dataArray = [ data.length ];
      data.sort(function (app1, app2) {
        return app1.hearts > app2.hearts ? -1 : (app1.hearts < app2.hearts ? 1 : (app1.title < app2.title ? -1 : 1));
      });
      data.forEach(function (app) {
        dataArray.push(app.title);
        dataArray.push(app.hearts);
      });
      Pebble.sendAppMessage({ 0: 'DATA', 1: dataArray.join('\n') });
    });
  }

};

if (window.Pebble) {
  Hearts();
}