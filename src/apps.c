#include <pebble.h>
#include "lib/data-processor/data-processor.h"
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
  data_processor_get_uint8(&num_apps);
  apps = malloc(num_apps * sizeof(App*));
  for (uint8_t a = 0; a < num_apps; a += 1) {
    apps[a] = malloc(sizeof(App));
    data_processor_get_string(&apps[a]->title);
    data_processor_get_uint16(&apps[a]->hearts);
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