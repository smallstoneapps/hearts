#pragma once

#include <pebble.h>

typedef struct App {
  char* title;
  uint16_t hearts;
} App;

uint8_t apps_count(void);
App* apps_get(uint8_t pos);
void apps_load(char* str);
