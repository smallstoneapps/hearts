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

src/windows/win-setup.c

*/


#include <pebble.h>
#include <pebble-assist.h>
#include "win-setup.h"


static void window_load(Window* window);
static void window_unload(Window* window);


static Window* s_window;
static TextLayer* s_layer_text;
static BitmapLayer* s_layer_bitmap;
static GBitmap* s_bitmap_phone;


void win_setup_init(void) {
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

void win_setup_deinit(void) {
  window_destroy(s_window);
}

void win_setup_show(void) {
  window_stack_push(s_window, false);
}

void win_setup_hide(void) {
  window_stack_remove(s_window, false);
}

bool win_setup_visible(void) {
  return window_stack_get_top_window() == s_window;
}

static void window_load(Window* window) {
  s_layer_text = text_layer_create(GRect(0, 134, 144, 20));
  text_layer_set_font(s_layer_text, fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD));
  text_layer_set_text(s_layer_text, "SETUP REQUIRED");
  text_layer_set_text_color(s_layer_text, GColorWhite);
  text_layer_set_text_alignment(s_layer_text, GTextAlignmentCenter);
  text_layer_set_background_color(s_layer_text, GColorClear);
  text_layer_add_to_window(s_layer_text, s_window);

  s_bitmap_phone = gbitmap_create_with_resource(RESOURCE_ID_ICON_PHONE);

  s_layer_bitmap = bitmap_layer_create(GRect(56, 50, 32, 51));
  bitmap_layer_set_bitmap(s_layer_bitmap, s_bitmap_phone);
  bitmap_layer_add_to_window(s_layer_bitmap, s_window);
}

static void window_unload(Window* window) {
  bitmap_layer_destroy(s_layer_bitmap);
  gbitmap_destroy(s_bitmap_phone);
  text_layer_destroy(s_layer_text);
}
