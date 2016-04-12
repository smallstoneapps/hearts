#include <pebble.h>
#include "pebble-assist/pebble-assist.h"
#include "pebble-message-queue/message-queue.h"
#include "pebble-data-processor/data-processor.h"
#include "pebble-loading-screen/setup-screen.h"
#include "pebble-loading-screen/loading-screen.h"
#include "windows/win-main.h"
#include "app-info.h"


#define PERSIST_KEY_CONFIGURED 10


static void init(void);
static void deinit(void);
static void message_handler_setup(char* operation, char* data);
static void message_handler_hearts(char* operation, char* data);
static void app_info_cleanup(void);


AppInfo** app_info_list = NULL;
uint8_t app_info_count = 0;


int main(void) {
  init();
  app_event_loop();
  deinit();
}


static void init(void) {
  win_setup_init();
  win_loading_init();
  win_main_init();

  mqueue_init(true);
  mqueue_register_handler("SETUP", message_handler_setup);
  mqueue_register_handler("HEARTS", message_handler_hearts);

  if (! persist_read_bool(PERSIST_KEY_CONFIGURED)) {
    win_setup_show();
  }
  else {
    win_loading_show();
  }
}

static void deinit(void) {
  win_main_deinit();
  win_loading_deinit();
  win_setup_deinit();
}

static void message_handler_setup(char* operation, char* data) {
  persist_write_bool(PERSIST_KEY_CONFIGURED, true);
  if (win_setup_is_visible()) {
    win_loading_show();
    win_setup_hide();
  }
}

static void message_handler_hearts(char* operation, char* data) {
  if (app_info_count > 0) {
    app_info_cleanup();
  }

  ProcessingState* ps = data_processor_create(data, '^');
  app_info_count = data_processor_get_int(ps);

  app_info_list = malloc(sizeof(AppInfo*) * app_info_count);
  for (uint8_t p = 0; p < app_info_count; p += 1) {
    AppInfo* app_info = malloc(sizeof(AppInfo));
    strcpy(app_info->name, data_processor_get_string(ps));
    app_info->hearts = data_processor_get_int(ps);
    app_info_list[p] = app_info;
  }

  win_main_reload();
  if (! win_main_visible()) {
    win_main_show();
    win_loading_hide();
  }
}

static void app_info_cleanup(void) {
  for (uint8_t p = 0; p < app_info_count; p += 1) {
    free(app_info_list[p]);
  }
  free(app_info_list);
  app_info_count = 0;
}
