/*

Hearts v0.1.2

http://matthewtole.com/pebble/hearts/

----------------------

The MIT License (MIT)

Copyright © 2013 - 2014 Matthew Tole

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

src/apps.c

*/

#include <pebble.h>
#include "libs/data-processor/data-processor.h"
#include "apps.h"

static uint8_t num_apps = 0;
static App** apps;

static void free_apps(void);

uint8_t apps_count(void) {
  return num_apps;
}

App* apps_get(uint8_t pos) {
  return pos < num_apps ? apps[pos] : NULL;
}

void apps_load(char* str) {
  if (num_apps) {
    free_apps();
  }
  data_processor_init(str, '\n');
  num_apps = data_processor_get_int(data_processor_get_global());
  apps = malloc(num_apps * sizeof(App*));
  for (uint8_t a = 0; a < num_apps; a += 1) {
    apps[a] = malloc(sizeof(App));
    apps[a]->title = data_processor_get_string(data_processor_get_global());
    apps[a]->hearts = data_processor_get_int(data_processor_get_global());
  }
}

static void free_apps(void) {
  for (uint8_t a = 0; a < num_apps; a += 1) {
    free(apps[a]->title);
    free(apps[a]);
  }
  free(apps);
  num_apps = 0;
}