'use strict';

var xhr = require('xhr');
var AppInfo = require('../../package.json');
var sprintf = require('sprintf-js').sprintf;
var store = require('store');
require('./hacks');

Pebble.addEventListener('ready', () => {
  var msg = {
    group: 'BOOT',
    operation: 'BOOT',
    data: 'BOOT'
  };
  try {
    Pebble.sendAppMessage(msg, () => {
      boot();
    }, () => {
      console.log('Boot message failed!');
    });
  } catch (ex) {
    console.error(ex);
  }
});

Pebble.addEventListener('appmessage', function(event) {
  console.log(JSON.stringify(event.data));
});

Pebble.addEventListener('showConfiguration', function() {
  Pebble.openURL(sprintf(AppInfo.pebble.settings.configUrl, AppInfo.version));
});

Pebble.addEventListener('webviewclosed', function(event) {
  if (event.response === 'CANCELLED') {
    return;
  }
  store.set('developerId', event.response);
  sendIsConfigured();
  updateHearts(store.get('developerId'), sendHearts);
});

function boot() {
  store.set('developerId', '5283d2a9c0b0168bf6000001');
  console.log(store.get('developerId'));
  if (store.get('developerId')) {
    sendIsConfigured();
    updateHearts(store.get('developerId'), sendHearts);
    return;
  }
}

function sendIsConfigured() {
  var msg = {
    group: 'SETUP',
    operation: 'SETUP',
    data: 'SETUP'
  };
  Pebble.sendAppMessage(msg, function() {}, function() {});
}

function sendHearts(err, data) {
  if (err) {
    return console.log(err);
  }
  Pebble.sendAppMessage({
    group: 'HEARTS',
    operation: 'UPDATE',
    data: data.join('^')
  },
    function() {},
    function() {});
}

function updateHearts(developerId, callback) {
  var url = sprintf(AppInfo.pebble.settings.apiUrl, developerId);
  xhr({ uri: url }, function(err, data, xhr) {
    if (err) {
      return callback(err);
    }
    const hearts = JSON.parse(data.body);
    var dataArray = [hearts.length];
    hearts.sort(function(app1, app2) {
      if (app1.hearts > app2.hearts) {
        return -1;
      } else if (app1.hearts < app2.hearts) {
        return 1;
      }
      return (app1.title < app2.title ? -1 : 1);
    });
    hearts.forEach(function(app) {
      dataArray.push(app.title);
      dataArray.push(app.hearts);
    });
    callback(null, dataArray);
  });
}
