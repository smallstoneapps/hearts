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

src/app.c

*/

#include <pebble.h>
#include "libs/pebble-assist/pebble-assist.h"
#include "libs/alert/src/alert.h"
#include "win-app.h"
#include "win-menu.h"
#include "generated/appinfo.h"

static void received_callback(DictionaryIterator *iterator, void *context);
static void init(void);
static void deinit(void);

int main(void) {
  init();
  app_event_loop();
  deinit();
}

static void init(void) {
  app_message_register_inbox_received(received_callback);
  app_message_open_max();
  win_app_init();
  win_menu_init();
  win_menu_show();
  DEBUG("Starting Hearts %s", VERSION_LABEL);
  alert_show_sticky(window_stack_get_top_window(), "Updating!", "The app is updating.");
}

static void deinit(void) {
  win_app_destroy();
  win_menu_destroy();
}

static void received_callback(DictionaryIterator *iterator, void *context) {
  Tuple* tuple_op = dict_find(iterator, 0);
  Tuple* tuple_data = dict_find(iterator, 1);
  if (strcmp(tuple_op->value->cstring, "CONFIGURE") == 0) {
    alert_show_sticky(window_stack_get_top_window(), "Configure!", "To use this app, you need to configure it on your phone");
  }
  else if (strcmp(tuple_op->value->cstring, "UPDATING") == 0) {
    alert_show_sticky(window_stack_get_top_window(), "Updating!", "The app is updating.");
  }
  else if (strcmp(tuple_op->value->cstring, "DATA") == 0) {
    alert_cancel();
    apps_load(tuple_data->value->cstring);
    win_menu_reload();
  }
}