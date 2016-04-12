'use strict';

var superagent = require('superagent');
var AppInfo = require('../appinfo.json');
var sprintf = require('sprintf-js').sprintf;
var store = require('store');
require('./hacks');

Pebble.addEventListener('ready', function() {
  var msg = {
    group: 'BOOT',
    operation: 'BOOT',
    data: 'BOOT'
  };
  Pebble.sendAppMessage(msg, function() {
    boot();
  }, function() {
    console.log('Boot message failed!');
  });
});

Pebble.addEventListener('appmessage', function(event) {
  console.log(JSON.stringify(event.data));
});

Pebble.addEventListener('showConfiguration', function() {
  Pebble.openURL(sprintf(AppInfo.settings.configUrl, AppInfo.versionLabel));
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
  var url = sprintf(AppInfo.settings.apiUrl, developerId);
  superagent(url, function(err, res) {
    if (err) {
      return callback(err);
    }
    var dataArray = [res.body.length];
    res.body.sort(function(app1, app2) {
      if (app1.hearts > app2.hearts) {
        return -1;
      } else if (app1.hearts < app2.hearts) {
        return 1;
      }
      return (app1.title < app2.title ? -1 : 1);
    });
    res.body.forEach(function(app) {
      dataArray.push(app.title);
      dataArray.push(app.hearts);
    });
    callback(null, dataArray);
  });
}