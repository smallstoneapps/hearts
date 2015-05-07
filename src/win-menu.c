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

src/win-menu.c

*/

#include <pebble.h>
#include "libs/pebble-assist/pebble-assist.h"
#include "win-menu.h"
#include "win-app.h"
#include "apps.h"

static Window* window;
static MenuLayer* menu_layer;

static void window_load(Window* window);
static void window_unload(Window* window);

static uint16_t menu_get_num_sections_callback(MenuLayer *me, void *data);
static uint16_t menu_get_num_rows_callback(MenuLayer *me, uint16_t section_index, void *data);
static int16_t menu_get_header_height_callback(MenuLayer *me, uint16_t section_index, void *data);
static int16_t menu_get_cell_height_callback(MenuLayer* me, MenuIndex* cell_index, void* data);
static void menu_draw_row_callback(GContext* ctx, const Layer *cell_layer, MenuIndex *cell_index, void *data);
static void menu_select_click_callback(MenuLayer *menu_layer, MenuIndex *cell_index, void *callback_context);

void win_menu_init(void) {
  window = window_create();
  window_set_window_handlers(window, (WindowHandlers) {
    .load = window_load,
    .unload = window_unload
  });
}

void win_menu_show(void) {
  window_stack_push(window, true);
}

void win_menu_destroy(void) {
  window_destroy(window);
}

void win_menu_reload(void) {
  menu_layer_reload_data(menu_layer);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

static void window_load(Window* window) {
  menu_layer = menu_layer_create_fullscreen(window);
  menu_layer_set_callbacks(menu_layer, NULL, (MenuLayerCallbacks) {
    .get_num_sections = menu_get_num_sections_callback,
    .get_num_rows = menu_get_num_rows_callback,
    .get_header_height = menu_get_header_height_callback,
    .get_cell_height = menu_get_cell_height_callback,
    .draw_row = menu_draw_row_callback,
    .select_click = menu_select_click_callback,
  });
  menu_layer_add_to_window(menu_layer, window);
}

static void window_unload(Window* window) {
  menu_layer_destroy(menu_layer);
}

static uint16_t menu_get_num_sections_callback(MenuLayer *me, void *data) {
  return 1;
}

static uint16_t menu_get_num_rows_callback(MenuLayer *me, uint16_t section_index, void *data) {
  return apps_count();
}

static int16_t menu_get_header_height_callback(MenuLayer *me, uint16_t section_index, void *data) {
  return 0;
}

static int16_t menu_get_cell_height_callback(MenuLayer* me, MenuIndex* cell_index, void* data) {
  return MENU_CELL_BASIC_CELL_HEIGHT;
}

static void menu_draw_row_callback(GContext* ctx, const Layer *cell_layer, MenuIndex *cell_index, void *data) {
  graphics_context_set_text_color(ctx, GColorBlack);
  App* app = apps_get(cell_index->row);
  graphics_draw_text(ctx, app->title, fonts_get_system_font(FONT_KEY_GOTHIC_24_BOLD), GRect(4, 4, 100, 28), GTextOverflowModeTrailingEllipsis, GTextAlignmentLeft, NULL);
  char heart_str[8];
  snprintf(heart_str, 8, "%d", app->hearts);
  graphics_draw_text(ctx, heart_str, fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD), GRect(104, 9, 36, 22), GTextOverflowModeFill, GTextAlignmentRight, NULL);
}

static void menu_select_click_callback(MenuLayer *menu_layer, MenuIndex *cell_index, void *callback_context) {
  App* app = apps_get(cell_index->row);
  if (app != NULL) {
    win_app_show(app);
  }
}
