/* globals Pebble */
/* globals http */
/* globals AppInfo */
/* globals VersionChecker */
/* globals Analytics */

var Hearts = function () {

  var developerId = null;
  var ga = null;

  Pebble.addEventListener('ready', function () {
    ga = new Analytics('UA-48246810-2', AppInfo.shortName, AppInfo.versionLabel);
    developerId = window.localStorage.getItem('developerId', null);
    if (! developerId) {
      Pebble.sendAppMessage({ 0: 'CONFIGURE' });
    }
    else {
      Pebble.sendAppMessage({ 0: 'UPDATING' });
      updateApps();
    }
    VersionChecker.check(AppInfo);
  });

  Pebble.addEventListener('showConfiguration', function () {
    trackEvent('config', 'shown');
    Pebble.openURL('http://pblweb.com/hearts/app/config/?version=' + AppInfo.versionLabel);
  });


  Pebble.addEventListener('webviewclosed', function (event) {
    trackEvent('config', (event.response === 'CANCELLED') ? 'cancelled' : 'updated');
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
      trackEvent('api', 'update');
      Pebble.sendAppMessage({ 0: 'DATA', 1: dataArray.join('\n') });
    });
  }

  function trackEvent(name, data) {
    if (ga) {
      ga.trackEvent(name, data);
    }
  }

};

if (window.Pebble) {
  Hearts();
}