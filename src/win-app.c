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

src/win-app.c

*/

#include <pebble.h>

#include "libs/pebble-assist/pebble-assist.h"
#include "libs/bitmap-loader/bitmap-loader.h"
// #include "libs/chart/src/pebble_chart.h"
#include "apps.h"

static void window_load(Window* window);
static void window_unload(Window* window);

static Window* window;
static BitmapLayer* bitmap_layer_heart;
static TextLayer* text_layer_title;
static TextLayer* text_layer_hearts;

static char heart_str[8];

void win_app_init(void) {
  window = window_create();
  window_set_window_handlers(window, (WindowHandlers) {
    .load = window_load,
    .unload = window_unload
  });
}

void win_app_show(App* app) {
  if (app == NULL) {
    return;
  }
  window_stack_push(window, true);
  text_layer_set_text(text_layer_title, app->title);
  snprintf(heart_str, 6, "%d", app->hearts);
  text_layer_set_text(text_layer_hearts, heart_str);
}

void win_app_destroy(void) {
  window_destroy(window);
}

static void window_load(Window* window) {
  text_layer_title = text_layer_create(GRect(4, 0, 128, 50));
  text_layer_set_system_font(text_layer_title, FONT_KEY_GOTHIC_24_BOLD);
  text_layer_set_colors(text_layer_title, GColorBlack, GColorClear);
  text_layer_set_overflow_mode(text_layer_title, GTextOverflowModeWordWrap);
  text_layer_set_text_alignment(text_layer_title, GTextAlignmentCenter);
  text_layer_add_to_window(text_layer_title, window);

  bitmap_layer_heart = bitmap_layer_create(GRect(22, 53, 100, 91));
  bitmap_layer_set_bitmap(bitmap_layer_heart, bitmaps_get_bitmap(RESOURCE_ID_BIG_HEART));
  bitmap_layer_add_to_window(bitmap_layer_heart, window);

  text_layer_hearts = text_layer_create(GRect(8, 74, 128, 32));
  text_layer_set_system_font(text_layer_hearts, FONT_KEY_GOTHIC_28_BOLD);
  text_layer_set_colors(text_layer_hearts, GColorWhite, GColorClear);
  text_layer_set_text_alignment(text_layer_hearts, GTextAlignmentCenter);
  text_layer_add_to_window(text_layer_hearts, window);
}

static void window_unload(Window* window) {
  text_layer_destroy(text_layer_title);
  text_layer_destroy(text_layer_hearts);
  bitmap_layer_destroy(bitmap_layer_heart);
}
