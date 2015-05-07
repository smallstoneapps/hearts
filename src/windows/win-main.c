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

src/windows/win-main.c

*/


#include <pebble.h>
#include <pebble-assist.h>
#include "win-main.h"
#include "../app-info.h"


#ifdef PBL_SDK_3
#define FONT_COUNT FONT_KEY_LECO_42_NUMBERS
#else
#define FONT_COUNT FONT_KEY_BITHAM_42_MEDIUM_NUMBERS
#endif


static void window_load(Window* window);
static void window_unload(Window* window);
static void layer_update_count(Layer* layer, GContext* ctx);
static void layer_update_name(Layer* layer, GContext* ctx);
static void layer_update_dots(Layer* layer, GContext* ctx);
static void click_config_provider(void *context);
static void up_click_handler(ClickRecognizerRef recognizer, void *context);
static void select_click_handler(ClickRecognizerRef recognizer, void *context);
static void down_click_handler(ClickRecognizerRef recognizer, void *context);


static Window* s_window;
static Layer* s_layer_count;
static Layer* s_layer_name;
static Layer* s_layer_dots;
static AppInfo* s_app_info;
static uint8_t s_app_position = 0;
static char s_count_string[8];


void win_main_init(void) {
  s_window = window_create();
  window_set_background_color(s_window, COLOR_FALLBACK(GColorDarkCandyAppleRed, GColorBlack));
  window_set_window_handlers(s_window, (WindowHandlers){
    .load = window_load,
    .unload = window_unload
  });
  window_set_click_config_provider(s_window, click_config_provider);
  #ifdef PBL_SDK_2
  window_set_fullscreen(s_window, true);
  #endif
}

void win_main_deinit(void) {
  window_destroy(s_window);
}

void win_main_show(void) {
  window_stack_push(s_window, false);
}

void win_main_reload(void) {
  s_app_info = app_info_list[s_app_position];
  layer_mark_dirty(s_layer_count);
  layer_mark_dirty(s_layer_name);
  layer_mark_dirty(s_layer_dots);
}

bool win_main_visible(void) {
  return window_stack_get_top_window() == s_window;
}


static void window_load(Window* window) {
  s_layer_count = layer_create(GRect(0, 46, 144, 44));
  layer_set_update_proc(s_layer_count, layer_update_count);
  layer_add_to_window(s_layer_count, window);

  s_layer_name = layer_create(GRect(0, 86, 144, 20));
  layer_set_update_proc(s_layer_name, layer_update_name);
  layer_add_to_window(s_layer_name, window);

  s_layer_dots = layer_create(GRect(0, 140, 144, 12));
  layer_set_update_proc(s_layer_dots, layer_update_dots);
  layer_add_to_window(s_layer_dots, window);
}

static void window_unload(Window* window) {
  layer_destroy(s_layer_dots);
  layer_destroy(s_layer_name);
  layer_destroy(s_layer_count);
}

static void click_config_provider(void *context) {
  window_single_click_subscribe(BUTTON_ID_UP, up_click_handler);
  window_single_click_subscribe(BUTTON_ID_SELECT, select_click_handler);
  window_single_click_subscribe(BUTTON_ID_DOWN, down_click_handler);
}

static void up_click_handler(ClickRecognizerRef recognizer, void *context) {
  if (s_app_position <= 0) {
    return;
  }
  s_app_position -= 1;
  win_main_reload();
}

static void select_click_handler(ClickRecognizerRef recognizer, void *context) {
}

static void down_click_handler(ClickRecognizerRef recognizer, void *context) {
  if (s_app_position >= (app_info_count - 1)) {
    return;
  }
  s_app_position += 1;
  win_main_reload();
}

static void layer_update_count(Layer* layer, GContext* ctx) {
  snprintf(s_count_string, 8, "%d", s_app_info->hearts);
  graphics_context_set_text_color(ctx, GColorWhite);
  graphics_draw_text(ctx, s_count_string,
    fonts_get_system_font(FONT_COUNT),
    layer_get_bounds(layer), GTextOverflowModeFill, GTextAlignmentCenter, NULL);
}

static void layer_update_name(Layer* layer, GContext* ctx) {
  graphics_context_set_text_color(ctx, GColorWhite);
  graphics_draw_text(ctx, s_app_info->name,
    fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD),
    layer_get_bounds(layer), GTextOverflowModeFill, GTextAlignmentCenter, NULL);
}

static void layer_update_dots(Layer* layer, GContext* ctx){
  graphics_context_set_stroke_color(ctx, GColorWhite);
  graphics_context_set_fill_color(ctx, GColorWhite);
  #ifdef PBL_SDK_3
  graphics_context_set_stroke_width(ctx, 3);
  #endif

  uint16_t dots_width = (app_info_count * 11) + ((app_info_count - 1) * 5);
  uint16_t start_x = (PEBBLE_WIDTH/2) - (dots_width/2);

  for (uint8_t a = 0; a < app_info_count; a += 1) {
    if (a == s_app_position) {
      graphics_fill_circle(ctx, GPoint(start_x + 4 + (16 * a), 6), 4);
    }
    graphics_draw_circle(ctx, GPoint(start_x + 4 + (16 * a), 6), 4);
  }
}
