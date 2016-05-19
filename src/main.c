#include <pebble.h>
#include "@smallstoneapps/utils/macros.h"
#include "@smallstoneapps/message-queue/message-queue.h"
#include "@smallstoneapps/data-processor/data-processor.h"
#include "@smallstoneapps/loading-screen/setup-screen.h"
#include "@smallstoneapps/loading-screen/loading-screen.h"
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
  setup_screen_init();
  loading_screen_init();
  win_main_init();

  mqueue_init_custom(true, 100, 1000);
  mqueue_register_handler("SETUP", message_handler_setup);
  mqueue_register_handler("HEARTS", message_handler_hearts);

  if (! persist_read_bool(PERSIST_KEY_CONFIGURED)) {
    setup_screen_show();
  }
  else {
    loading_screen_show();
  }
}

static void deinit(void) {
  win_main_deinit();
  loading_screen_deinit();
  setup_screen_deinit();
}

static void message_handler_setup(char* operation, char* data) {
  persist_write_bool(PERSIST_KEY_CONFIGURED, true);
  if (setup_screen_is_visible()) {
    loading_screen_show();
    setup_screen_hide();
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
    loading_screen_hide();
  }
}

static void app_info_cleanup(void) {
  for (uint8_t p = 0; p < app_info_count; p += 1) {
    free(app_info_list[p]);
  }
  free(app_info_list);
  app_info_count = 0;
}
