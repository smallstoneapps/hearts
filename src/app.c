#include <pebble.h>
#include "lib/pebble-assist/pebble-assist.h"
#include "lib/alert/src/alert.h"
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

  LOG("Starting Hearts %s", VERSION_LABEL);

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
    apps_load(tuple_data->value->cstring);
    win_menu_reload();
  }
  alert_cancel();
}