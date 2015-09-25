/*

Hearts Pebble App v4.0

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

src/js/src/generated/appinfo.js

*/


/* exported AppInfo */

module.exports = {
  "uuid": "bcdef00a-b309-485d-b82f-341307693c73",
  "shortName": "Hearts",
  "longName": "Hearts",
  "companyName": "Matthew Tole",
  "targetPlatforms": ["aplite", "basalt", "chalk"],
  "sdkVersion": "3",
  "versionCode": 2,
  "versionLabel": "4.0",
  "watchapp": {
    "watchface": false
  },
  "appKeys": {
    "group": 0,
    "operation": 1,
    "data": 2
  },
  "capabilities": ["configurable"],
  "resources": {
    "media": [
      {
        "type": "png",
        "name": "ICON_PHONE",
        "file": "images/phone.png"
      },
      {
        "type": "png",
        "name": "ICON_REFRESH",
        "file": "images/refresh.png"
      }
    ]
  },
  "settings": {
    "configUrl": "http://smallstoneapps.s3.amazonaws.com/hearts/config/index.html?version=%s",
    "apiUrl": "http://pblweb.com/api/v1/store/developers/%s.json"
  }
};