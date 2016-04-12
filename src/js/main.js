/*

Hearts Pebble App v5.1

----------------------

The MIT License (MIT)

Copyright © 2015 Matthew Tole

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--------------------

src/js/src/main.js

*/

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
