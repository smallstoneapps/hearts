#pragma once


#include <pebble.h>


typedef struct AppInfo {
  char name[64];
  uint16_t hearts;
} AppInfo;

extern AppInfo** app_info_list;
extern uint8_t app_info_count;
