/*

Hearts Pebble App v5.0

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

src/windows/win-loading.c

*/


#include <pebble.h>
#include <pebble-assist.h>
#include "win-setup.h"


static void window_load(Window* window);
static void window_unload(Window* window);


static Window* s_window;
static TextLayer* s_layer_text;
static BitmapLayer* s_layer_bitmap;
static GBitmap* s_bitmap_refresh;


void win_loading_init(void) {
  s_window = window_create();
  window_set_background_color(s_window, COLOR_FALLBACK(GColorDarkCandyAppleRed, GColorBlack));
  window_set_window_handlers(s_window, (WindowHandlers){
    .load = window_load,
    .unload = window_unload
  });
  #ifdef PBL_SDK_2
  window_set_fullscreen(s_window, true);
  #endif
}

void win_loading_deinit(void) {
  window_destroy(s_window);
}

void win_loading_show(void) {
  window_stack_push(s_window, false);
}

void win_loading_hide(void) {
  window_stack_remove(s_window, false);
}

static void window_load(Window* window) {
  GSize window_size = layer_get_bounds(window_get_root_layer(window)).size;
  GSize icon_size;

  s_layer_text = text_layer_create(GRect(0, 134, window_size.w, 20));
  text_layer_set_font(s_layer_text, fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD));
  text_layer_set_text(s_layer_text, "REFRESHING DATA");
  text_layer_set_text_color(s_layer_text, GColorWhite);
  text_layer_set_text_alignment(s_layer_text, GTextAlignmentCenter);
  text_layer_set_background_color(s_layer_text, GColorClear);
  text_layer_add_to_window(s_layer_text, s_window);

  s_bitmap_refresh = gbitmap_create_with_resource(RESOURCE_ID_ICON_REFRESH);
  icon_size = gbitmap_get_bounds(s_bitmap_refresh).size;

  s_layer_bitmap = bitmap_layer_create(GRect(window_size.w / 2 - icon_size.w / 2, window_size.h / 2 - icon_size.h / 2, icon_size.w, icon_size.h));
  bitmap_layer_set_bitmap(s_layer_bitmap, s_bitmap_refresh);
  #ifdef PBL_COLOR
  bitmap_layer_set_compositing_mode(s_layer_bitmap, GCompOpSet);
  #endif
  bitmap_layer_add_to_window(s_layer_bitmap, s_window);
}

static void window_unload(Window* window) {
  bitmap_layer_destroy(s_layer_bitmap);
  gbitmap_destroy(s_bitmap_refresh);
  text_layer_destroy(s_layer_text);
}
