'use strict';

const xhr = require('xhr');
const AppInfo = require('../../package.json');
const sprintf = require('sprintf-js').sprintf;
const store = require('store');
const MessageQueue = require('message-queue-pebble');

Pebble.addEventListener('ready', () => {
  const msg = {
    group: 'BOOT',
    operation: 'BOOT',
    data: 'BOOT'
  };
  MessageQueue.sendAppMessage(msg, () => {
    boot();
  }, nack);
});

Pebble.addEventListener('appmessage', (event) => {
  console.log(JSON.stringify(event.data));
});

Pebble.addEventListener('showConfiguration', () => {
  Pebble.openURL(sprintf(AppInfo.pebble.settings.configUrl, AppInfo.version));
});

Pebble.addEventListener('webviewclosed', (event) => {
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
  const msg = {
    group: 'SETUP',
    operation: 'SETUP',
    data: 'SETUP'
  };
  MessageQueue.sendAppMessage(msg, ack, nack);
}

function sendHearts(err, data) {
  if (err) {
    return console.log(err);
  }
  MessageQueue.sendAppMessage({
    group: 'HEARTS',
    operation: 'UPDATE',
    data: data.join('^')
  }, ack, nack);
}

function updateHearts(developerId, callback) {
  const url = sprintf(AppInfo.pebble.settings.apiUrl, developerId);
  xhr({ uri: url }, (err, data, xhr) => {
    if (err) {
      return callback(err);
    }
    const hearts = JSON.parse(data.body);
    const dataArray = [hearts.length];
    hearts.sort((app1, app2) => {
      if (app1.hearts > app2.hearts) {
        return -1;
      } else if (app1.hearts < app2.hearts) {
        return 1;
      }
      return (app1.title < app2.title ? -1 : 1);
    });
    hearts.forEach((app) => {
      dataArray.push(app.title);
      dataArray.push(app.hearts);
    });
    callback(null, dataArray);
  });
}

function ack() {
  console.log('ACK');
}

function nack() {
  console.error('NACK!');
}
