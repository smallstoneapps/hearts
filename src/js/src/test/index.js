describe('Hearts', function () {

  var http = null;
  var _http = null;

  before(function () {
    FakePebble.inject();
  });

  beforeEach(function () {
    http = new MockHttp();
    _http = window.http;
    window.http = http;
    FakePebble.reset();
    Hearts();
  });

  afterEach(function () {
    window.http = _http;
  });

  describe('#ready', function () {

    it('should check local storage for a developer ID', function (done) {
      var storageSpy = sinon.spy(window.localStorage, 'getItem');
      FakePebble.emit('ready');
      expect(storageSpy.called).to.be.true
      storageSpy.restore();
      done();
    });

    it('should send configure message if no developer ID', function (done) {
      var storageStub = sinon.stub(window.localStorage, 'getItem');
      storageStub.onCall(0).returns(null);
      FakePebble.on('appmessage', function (data) {
        expect(data[0]).to.equal('CONFIGURE');
        storageStub.restore();
        done();
      });
      FakePebble.emit('ready');
    });

    it('should send update message if developer ID is set', function (done) {
      var storageStub = sinon.stub(window.localStorage, 'getItem');
      storageStub.onCall(0).returns('123');
      FakePebble.on('appmessage', function (data) {
        expect(data[0]).to.equal('UPDATING');
        storageStub.restore();
        done();
      });
      FakePebble.emit('ready');
    });

    it('should make request to API if developer ID is set', function (done) {
      var storageStub = sinon.stub(window.localStorage, 'getItem');
      storageStub.onCall(0).returns('abc');
      var httpSpy = sinon.spy(http, 'get');
      FakePebble.emit('ready');
      expect(httpSpy.called).to.be.true
      expect(httpSpy.calledWith('http://pblweb.com/api/v1/store/developers/abc.json'));
      storageStub.restore();
      httpSpy.restore();
      done();
    });

    it('should send the data to Pebble', function (done) {
      var storageStub = sinon.stub(window.localStorage, 'getItem');
      storageStub.onCall(0).returns('abc');
      http.addHandler(function (url, data, callback) {
        callback(null, [ { title: 'Hello', hearts: 5 } ]);
      });
      var callCount = 0;
      FakePebble.on('appmessage', function (data) {
        if (callCount === 0) {
          callCount += 1;
          return;
        }
        expect(data[0]).to.equal('DATA');
        expect(data[1]).to.equal('1\nHello\n5');
        storageStub.restore();
        done();
      });
      FakePebble.emit('ready');
    });

    it('should sort the apps by heart count', function (done) {
      var apps = [
        { title: 'BBB', hearts: 10 },
        { title: 'AAA', hearts: 58 },
        { title: 'DDD', hearts: 7 },
        { title: 'EEE', hearts: 7 },
        { title: 'CCC', hearts: 7 }
      ];
      var storageStub = sinon.stub(window.localStorage, 'getItem');
      storageStub.onCall(0).returns('abc');
      http.addHandler(function (url, data, callback) {
        callback(null, apps);
      });
      var callCount = 0;
      FakePebble.on('appmessage', function (data) {
        if (callCount === 0) {
          callCount += 1;
          return;
        }
        expect(data[0]).to.equal('DATA');
        expect(data[1]).to.equal('5\nAAA\n58\nBBB\n10\nCCC\n7\nDDD\n7\nEEE\n7');
        storageStub.restore();
        done();
      });
      FakePebble.emit('ready');
    });

    it('should work with the real API', function (done) {
      var storageStub = sinon.stub(window.localStorage, 'getItem');
      storageStub.onCall(0).returns('5283d2a9c0b0168bf6000001');
      http.addHandler(function (url, data, callback) {
        var req = new XMLHttpRequest();
        req.open('GET', url, true);
        req.onload = function (e) {
          if (req.readyState == 4 && req.status == 200) {
            if (req.status == 200) {
              var response = JSON.parse(req.responseText);
              return callback(null, response);
            }
          }
        }
        req.send(null);
      });
      var messageCount = 0;
      FakePebble.on('appmessage', function (data) {
        switch (messageCount) {
          case 0:
            expect(data[0]).to.equal('UPDATING');
          break;
          case 1:
            expect(data[0]).to.equal('DATA');
            expect(data[1].substr(0,1)).to.equal('5');
            storageStub.restore();
            done();
          break;
        }
        messageCount += 1;
      });
      FakePebble.emit('ready');
    });

    it.skip('should handle errors gracefully', function (done) {
      expect(false).to.be.true;
      done();
    });

  });

  describe('#showConfiguration', function () {

    it('should show configuration page when asked', function (done) {
      FakePebble.on('openURL', function (url) {
        expect(url).to.equal('http://pblweb.com/hearts/app/config/?version=' + AppInfo.versionLabel);
        done();
      });
      FakePebble.emit('showConfiguration');
    });

  });

  describe('#webviewclosed', function () {

    it('should update local storage', function (done) {
      var storageSpy = sinon.spy(window.localStorage, 'setItem');
      FakePebble.emit('webviewclosed', { response: '123' });
      expect(storageSpy.called).to.be.true
      expect(storageSpy.calledWith('developerId', '123'));
      storageSpy.restore();
      done();
    });

    it('should trigger an update', function (done) {
      http.addHandler(function (url, data, callback) {
        expect(url).to.equal('http://pblweb.com/api/v1/store/developers/123.json');
        done();
      });
      FakePebble.emit('webviewclosed', { response: '123' });
    });

  });

});