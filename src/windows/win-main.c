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
#define ANIMATION_DURATION 200
#define ANIMATION_DIRECTION_UP 0
#define ANIMATION_DIRECTION_DOWN 1


static void window_load(Window* window);
static void window_unload(Window* window);
static void layer_update_count(Layer* layer, GContext* ctx);
static void layer_update_name(Layer* layer, GContext* ctx);
static void layer_update_dots(Layer* layer, GContext* ctx);
static void click_config_provider(void *context);
static void up_click_handler(ClickRecognizerRef recognizer, void *context);
static void select_click_handler(ClickRecognizerRef recognizer, void *context);
static void down_click_handler(ClickRecognizerRef recognizer, void *context);
static void transition_animation_run(int duration, int delay, AnimationImplementation *implementation, bool handlers);
static void transition_animation_started(Animation *anim, void *context);
static void transition_animation_stopped(Animation *anim, bool stopped, void *context);
static void transition_animation_update(Animation *anim, AnimationProgress dist_normalized);


static Window* s_window;
static Layer* s_layer_count;
static Layer* s_layer_name;
static Layer* s_layer_dots;
static AppInfo* s_app_info;
static uint8_t s_app_position = 0;
static uint8_t s_app_position_new = 0;
static uint8_t s_app_position_old = 0;
static char s_count_string[8];
static uint16_t s_current_hearts = 0;
static bool s_is_animating = false;
static Animation* transition_animation;
static AnimationImplementation transition_animation_implementation;
static AppInfo* s_app_info_old = NULL;
static AppInfo* s_app_info_new = NULL;
static uint16_t s_name_offset = 0;
static uint8_t s_animation_direction;
static uint16_t s_dot_current_x = 0;
static GSize s_window_size;

#ifdef PBL_SDK_3
static Layer* s_indicator_up_layer;
static Layer* s_indicator_down_layer;
static ContentIndicator* s_indicator_up;
static ContentIndicator* s_indicator_down;
#endif

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
  if (app_info_count == 0) {
    return;
  }
  s_app_position = 0;
  s_app_info = s_app_info_old = app_info_list[s_app_position];
  s_current_hearts = s_app_info->hearts;
  if (win_main_visible()) {
    layer_mark_dirty(s_layer_count);
    layer_mark_dirty(s_layer_name);
    layer_mark_dirty(s_layer_dots);
  }
}

bool win_main_visible(void) {
  return window_stack_get_top_window() == s_window;
}


static void window_load(Window* window) {
  s_window_size = layer_get_bounds(window_get_root_layer(window)).size;

  s_layer_name = layer_create(GRect(0, 86, s_window_size.w, 20));
  layer_set_update_proc(s_layer_name, layer_update_name);
  layer_add_to_window(s_layer_name, window);

  s_layer_count = layer_create(GRect(0, 46, s_window_size.w, 44));
  layer_set_update_proc(s_layer_count, layer_update_count);
  layer_add_to_window(s_layer_count, window);

  s_layer_dots = layer_create(GRect(0, 130, s_window_size.w, 12));
  layer_set_update_proc(s_layer_dots, layer_update_dots);
  layer_add_to_window(s_layer_dots, window);

#ifdef PBL_SDK_3

  s_indicator_up_layer = layer_create(GRect(0, 0,
    s_window_size.w, STATUS_BAR_LAYER_HEIGHT));
  s_indicator_down_layer = layer_create(GRect(0, s_window_size.h - STATUS_BAR_LAYER_HEIGHT,
    s_window_size.w, STATUS_BAR_LAYER_HEIGHT));
  layer_add_child(window_get_root_layer(window), s_indicator_up_layer);
  layer_add_child(window_get_root_layer(window), s_indicator_down_layer);

  s_indicator_up = content_indicator_create();
  const ContentIndicatorConfig up_config = (ContentIndicatorConfig) {
    .layer = s_indicator_up_layer,
    .times_out = true,
    .alignment = GAlignCenter,
    .colors = {
      .foreground = GColorWhite,
      .background = COLOR_FALLBACK(GColorDarkCandyAppleRed, GColorBlack)
    }
  };
  content_indicator_configure_direction(s_indicator_up, ContentIndicatorDirectionUp,
                                        &up_config);

  s_indicator_down = content_indicator_create();
  const ContentIndicatorConfig down_config = (ContentIndicatorConfig) {
    .layer = s_indicator_down_layer,
    .times_out = true,
    .alignment = GAlignCenter,
    .colors = {
      .foreground = GColorWhite,
      .background = COLOR_FALLBACK(GColorDarkCandyAppleRed, GColorBlack)
    }
  };
  content_indicator_configure_direction(s_indicator_down, ContentIndicatorDirectionDown,
                                        &down_config);

  content_indicator_set_content_available(s_indicator_down, ContentIndicatorDirectionDown, true);
  content_indicator_set_content_available(s_indicator_up, ContentIndicatorDirectionUp, false);
#endif
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

static void do_transition(void) {
  s_app_info_old = s_app_info;
  s_app_info_new = app_info_list[s_app_position];
  s_app_info =  app_info_list[s_app_position];
  s_app_position_new = s_app_position;

  transition_animation_implementation.update = transition_animation_update;
  transition_animation_run(ANIMATION_DURATION, 0, &transition_animation_implementation, true);

#ifdef PBL_SDK_3
  content_indicator_set_content_available(s_indicator_down, ContentIndicatorDirectionDown, s_app_position < (app_info_count - 1));
  content_indicator_set_content_available(s_indicator_up, ContentIndicatorDirectionUp, s_app_position > 0);
#endif
}

static void up_click_handler(ClickRecognizerRef recognizer, void *context) {
  if (s_app_position <= 0) {
    return;
  }
  if (s_is_animating) {
    return;
  }
  s_app_position_old = s_app_position;
  s_app_position -= 1;
  s_animation_direction = ANIMATION_DIRECTION_UP;
  do_transition();
}

static void select_click_handler(ClickRecognizerRef recognizer, void *context) {
}

static void down_click_handler(ClickRecognizerRef recognizer, void *context) {
  if (s_app_position >= (app_info_count - 1)) {
    return;
  }
  if (s_is_animating) {
    return;
  }
  s_app_position_old = s_app_position;
  s_app_position += 1;
  s_animation_direction = ANIMATION_DIRECTION_DOWN;
  do_transition();
}

static void layer_update_count(Layer* layer, GContext* ctx) {
  snprintf(s_count_string, 8, "%d", s_current_hearts);
  graphics_context_set_text_color(ctx, GColorWhite);
  graphics_context_set_fill_color(ctx, COLOR_FALLBACK(GColorDarkCandyAppleRed, GColorBlack));
  graphics_fill_rect(ctx, layer_get_bounds(layer), 0, GCornerNone);
  graphics_draw_text(ctx, s_count_string,
    fonts_get_system_font(FONT_COUNT),
    layer_get_bounds(layer), GTextOverflowModeFill, GTextAlignmentCenter, NULL);
}

static void layer_update_name(Layer* layer, GContext* ctx) {
  graphics_context_set_text_color(ctx, GColorWhite);
  if (s_is_animating) {
    graphics_draw_text(ctx, s_animation_direction == ANIMATION_DIRECTION_UP ? s_app_info_new->name : s_app_info_old->name,
      fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD),
      GRect(0, 0 - s_name_offset, s_window_size.w, 20), GTextOverflowModeFill, GTextAlignmentCenter, NULL);
    graphics_draw_text(ctx, s_animation_direction == ANIMATION_DIRECTION_UP ? s_app_info_old->name : s_app_info_new->name,
      fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD),
      GRect(0, 20 - s_name_offset, s_window_size.w, 20), GTextOverflowModeFill, GTextAlignmentCenter, NULL);
  }
  else {
    graphics_draw_text(ctx, s_app_info->name,
      fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD),
      layer_get_bounds(layer), GTextOverflowModeFill, GTextAlignmentCenter, NULL);
  }
}

static uint16_t dot_center_x(uint8_t pos) {
  uint16_t dots_width = (app_info_count * 11) + ((app_info_count - 1) * 5);
  uint16_t start_x = (s_window_size.w / 2) - (dots_width / 2);
  return start_x + 4 + (16 * pos);
}

static void layer_update_dots(Layer* layer, GContext* ctx){
  graphics_context_set_stroke_color(ctx, GColorWhite);
  graphics_context_set_fill_color(ctx, GColorWhite);
  #ifdef PBL_SDK_3
  graphics_context_set_stroke_width(ctx, 3);
  #endif

  if (s_is_animating) {
    graphics_fill_circle(ctx, GPoint(s_dot_current_x, 6), 4);
  }
  else {
    graphics_fill_circle(ctx, GPoint(dot_center_x(s_app_position), 6), 4);
  }
  for (uint8_t a = 0; a < app_info_count; a += 1) {
    graphics_draw_circle(ctx, GPoint(dot_center_x(a), 6), 4);
  }
}

static void transition_animation_run(int duration, int delay, AnimationImplementation *implementation, bool handlers) {
  transition_animation = animation_create();
  animation_set_duration(transition_animation, duration);
  animation_set_delay(transition_animation, delay);
  animation_set_curve(transition_animation, AnimationCurveEaseInOut);
  animation_set_implementation(transition_animation, implementation);
  if (handlers) {
    animation_set_handlers(transition_animation, (AnimationHandlers) {
      .started = transition_animation_started,
      .stopped = transition_animation_stopped
    }, NULL);
  }
  animation_schedule(transition_animation);
}

static void transition_animation_started(Animation *anim, void *context) {
  s_is_animating = true;
}

static void transition_animation_stopped(Animation *anim, bool stopped, void *context) {
  s_is_animating = false;
}

// static int anim_percentage(AnimationProgress dist_normalized, int max) {
//   return (int)(float)(((float)dist_normalized / (float)ANIMATION_NORMALIZED_MAX) * (float)max);
// }

static void transition_animation_update(Animation* anim, AnimationProgress dist_normalized) {
  float percent = (float)dist_normalized / (float)ANIMATION_NORMALIZED_MAX;

  s_current_hearts = s_app_info_old->hearts + (int16_t)(percent * (float)(s_app_info_new->hearts - s_app_info_old->hearts)) ;
  layer_mark_dirty(s_layer_count);

  s_dot_current_x = dot_center_x(s_app_position_old) + (int16_t)(percent * (float)(dot_center_x(s_app_position_new) - dot_center_x(s_app_position_old)));
  layer_mark_dirty(s_layer_dots);

  s_name_offset = s_animation_direction == ANIMATION_DIRECTION_UP ? (20 - (uint16_t)20.0f * percent) : (uint16_t)20.0f * percent;
  layer_mark_dirty(s_layer_name);
}
