// TypeScript bindings for emscripten-generated code.  Automatically generated at compile time.
declare namespace RuntimeExports {
    let HEAPU8: any;
    let HEAPF32: any;
    /** @param {string=} sig */
    function addFunction(func: any, sig?: string | undefined): any;
    function removeFunction(index: any): void;
    function FS_createPath(...args: any[]): any;
    function FS_createDataFile(...args: any[]): any;
    function FS_preloadFile(parent: any, name: any, url: any, canRead: any, canWrite: any, dontCreateFile: any, canOwn: any, preFinish: any): Promise<void>;
    function FS_unlink(...args: any[]): any;
    function FS_createLazyFile(...args: any[]): any;
    function FS_createDevice(...args: any[]): any;
    function addRunDependency(id: any): void;
    function removeRunDependency(id: any): void;
}
interface WasmModule {
  _free(_0: number): void;
  _malloc(_0: number): number;
  _tvg_engine_init(_0: number): number;
  _tvg_engine_term(): number;
  _tvg_swcanvas_create(_0: number): number;
  _tvg_glcanvas_create(_0: number): number;
  _tvg_wgcanvas_create(_0: number): number;
  _tvg_canvas_destroy(_0: number): number;
  _tvg_swcanvas_set_target(_0: number, _1: number, _2: number, _3: number, _4: number, _5: number): number;
  _tvg_canvas_add(_0: number, _1: number): number;
  _tvg_canvas_insert(_0: number, _1: number, _2: number): number;
  _tvg_canvas_remove(_0: number, _1: number): number;
  _tvg_canvas_update(_0: number): number;
  _tvg_canvas_draw(_0: number, _1: number): number;
  _tvg_canvas_sync(_0: number): number;
  _tvg_canvas_set_viewport(_0: number, _1: number, _2: number, _3: number, _4: number): number;
  _tvg_paint_rel(_0: number): number;
  _tvg_paint_set_visible(_0: number, _1: number): number;
  _tvg_paint_get_visible(_0: number): number;
  _tvg_paint_ref(_0: number): number;
  _tvg_paint_unref(_0: number, _1: number): number;
  _tvg_paint_get_ref(_0: number): number;
  _tvg_paint_scale(_0: number, _1: number): number;
  _tvg_paint_rotate(_0: number, _1: number): number;
  _tvg_paint_translate(_0: number, _1: number, _2: number): number;
  _tvg_paint_set_transform(_0: number, _1: number): number;
  _tvg_paint_get_transform(_0: number, _1: number): number;
  _tvg_paint_duplicate(_0: number): number;
  _tvg_paint_intersects(_0: number, _1: number, _2: number, _3: number, _4: number): number;
  _tvg_paint_set_opacity(_0: number, _1: number): number;
  _tvg_paint_get_opacity(_0: number, _1: number): number;
  _tvg_paint_get_aabb(_0: number, _1: number, _2: number, _3: number, _4: number): number;
  _tvg_paint_get_obb(_0: number, _1: number): number;
  _tvg_paint_set_mask_method(_0: number, _1: number, _2: number): number;
  _tvg_paint_set_blend_method(_0: number, _1: number): number;
  _tvg_paint_get_type(_0: number, _1: number): number;
  _tvg_paint_set_clip(_0: number, _1: number): number;
  _tvg_paint_get_clip(_0: number): number;
  _tvg_shape_new(): number;
  _tvg_shape_reset(_0: number): number;
  _tvg_shape_move_to(_0: number, _1: number, _2: number): number;
  _tvg_shape_line_to(_0: number, _1: number, _2: number): number;
  _tvg_shape_cubic_to(_0: number, _1: number, _2: number, _3: number, _4: number, _5: number, _6: number): number;
  _tvg_shape_close(_0: number): number;
  _tvg_shape_append_rect(_0: number, _1: number, _2: number, _3: number, _4: number, _5: number, _6: number, _7: number): number;
  _tvg_shape_append_circle(_0: number, _1: number, _2: number, _3: number, _4: number, _5: number): number;
  _tvg_shape_append_path(_0: number, _1: number, _2: number, _3: number, _4: number): number;
  _tvg_shape_get_path(_0: number, _1: number, _2: number, _3: number, _4: number): number;
  _tvg_shape_set_stroke_width(_0: number, _1: number): number;
  _tvg_shape_get_stroke_width(_0: number, _1: number): number;
  _tvg_shape_set_stroke_color(_0: number, _1: number, _2: number, _3: number, _4: number): number;
  _tvg_shape_get_stroke_color(_0: number, _1: number, _2: number, _3: number, _4: number): number;
  _tvg_shape_set_stroke_gradient(_0: number, _1: number): number;
  _tvg_shape_get_stroke_gradient(_0: number, _1: number): number;
  _tvg_shape_set_stroke_dash(_0: number, _1: number, _2: number, _3: number): number;
  _tvg_shape_get_stroke_dash(_0: number, _1: number, _2: number, _3: number): number;
  _tvg_shape_set_stroke_cap(_0: number, _1: number): number;
  _tvg_shape_get_stroke_cap(_0: number, _1: number): number;
  _tvg_shape_set_stroke_join(_0: number, _1: number): number;
  _tvg_shape_get_stroke_join(_0: number, _1: number): number;
  _tvg_shape_set_stroke_miterlimit(_0: number, _1: number): number;
  _tvg_shape_set_trimpath(_0: number, _1: number, _2: number, _3: number): number;
  _tvg_shape_set_fill_color(_0: number, _1: number, _2: number, _3: number, _4: number): number;
  _tvg_shape_get_fill_color(_0: number, _1: number, _2: number, _3: number, _4: number): number;
  _tvg_shape_set_fill_rule(_0: number, _1: number): number;
  _tvg_shape_get_fill_rule(_0: number, _1: number): number;
  _tvg_shape_set_gradient(_0: number, _1: number): number;
  _tvg_shape_get_gradient(_0: number, _1: number): number;
  _tvg_picture_new(): number;
  _tvg_picture_load(_0: number, _1: number): number;
  _tvg_picture_load_raw(_0: number, _1: number, _2: number, _3: number, _4: number, _5: number): number;
  _tvg_picture_load_data(_0: number, _1: number, _2: number, _3: number, _4: number, _5: number): number;
  _tvg_picture_set_size(_0: number, _1: number, _2: number): number;
  _tvg_picture_get_size(_0: number, _1: number, _2: number): number;
  _tvg_picture_set_origin(_0: number, _1: number, _2: number): number;
  _tvg_picture_get_origin(_0: number, _1: number, _2: number): number;
  _tvg_linear_gradient_new(): number;
  _tvg_radial_gradient_new(): number;
  _tvg_gradient_del(_0: number): number;
  _tvg_linear_gradient_set(_0: number, _1: number, _2: number, _3: number, _4: number): number;
  _tvg_linear_gradient_get(_0: number, _1: number, _2: number, _3: number, _4: number): number;
  _tvg_radial_gradient_set(_0: number, _1: number, _2: number, _3: number, _4: number, _5: number, _6: number): number;
  _tvg_radial_gradient_get(_0: number, _1: number, _2: number, _3: number, _4: number, _5: number, _6: number): number;
  _tvg_gradient_set_color_stops(_0: number, _1: number, _2: number): number;
  _tvg_gradient_get_color_stops(_0: number, _1: number, _2: number): number;
  _tvg_gradient_set_spread(_0: number, _1: number): number;
  _tvg_gradient_get_spread(_0: number, _1: number): number;
  _tvg_scene_new(): number;
  _tvg_scene_add(_0: number, _1: number): number;
  _tvg_scene_insert(_0: number, _1: number, _2: number): number;
  _tvg_scene_remove(_0: number, _1: number): number;
  _tvg_scene_clear_effects(_0: number): number;
  _tvg_scene_add_effect_drop_shadow(_0: number, _1: number, _2: number, _3: number, _4: number, _5: number, _6: number, _7: number, _8: number): number;
  _tvg_scene_add_effect_gaussian_blur(_0: number, _1: number, _2: number, _3: number, _4: number): number;
  _tvg_scene_add_effect_fill(_0: number, _1: number, _2: number, _3: number, _4: number): number;
  _tvg_scene_add_effect_tint(_0: number, _1: number, _2: number, _3: number, _4: number, _5: number, _6: number, _7: number): number;
  _tvg_scene_add_effect_tritone(_0: number, _1: number, _2: number, _3: number, _4: number, _5: number, _6: number, _7: number, _8: number, _9: number, _10: number): number;
  _tvg_text_new(): number;
  _tvg_text_set_font(_0: number, _1: number): number;
  _tvg_text_set_size(_0: number, _1: number): number;
  _tvg_text_set_text(_0: number, _1: number): number;
  _tvg_text_align(_0: number, _1: number, _2: number): number;
  _tvg_text_layout(_0: number, _1: number, _2: number): number;
  _tvg_text_set_outline(_0: number, _1: number, _2: number, _3: number, _4: number): number;
  _tvg_text_set_color(_0: number, _1: number, _2: number, _3: number): number;
  _tvg_text_set_italic(_0: number, _1: number): number;
  _tvg_text_set_gradient(_0: number, _1: number): number;
  _tvg_text_wrap_mode(_0: number, _1: number): number;
  _tvg_text_spacing(_0: number, _1: number, _2: number): number;
  _tvg_font_load(_0: number): number;
  _tvg_font_load_data(_0: number, _1: number, _2: number, _3: number, _4: number): number;
  _tvg_font_unload(_0: number): number;
  _tvg_animation_new(): number;
  _tvg_animation_set_frame(_0: number, _1: number): number;
  _tvg_animation_get_frame(_0: number, _1: number): number;
  _tvg_animation_get_total_frame(_0: number, _1: number): number;
  _tvg_animation_get_picture(_0: number): number;
  _tvg_animation_get_duration(_0: number, _1: number): number;
  _tvg_animation_set_segment(_0: number, _1: number, _2: number): number;
  _tvg_animation_get_segment(_0: number, _1: number, _2: number): number;
  _tvg_animation_del(_0: number): number;
  _tvg_accessor_new(): number;
  _tvg_accessor_del(_0: number): number;
  _tvg_accessor_set(_0: number, _1: number, _2: number, _3: number): number;
}

type EmbindString = ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string;
export interface ClassHandle {
  isAliasOf(other: ClassHandle): boolean;
  delete(): void;
  deleteLater(): this;
  isDeleted(): boolean;
  // @ts-ignore - If targeting lower than ESNext, this symbol might not exist.
  [Symbol.dispose](): void;
  clone(): this;
}
export interface TvgCanvas extends ClassHandle {
  render(): ArrayBuffer;
  clear(): boolean;
  resize(_0: number, _1: number): boolean;
  ptr(): number;
  error(): string;
  size(): any;
}

interface EmbindModule {
  TvgCanvas: {
    new(_0: EmbindString, _1: EmbindString, _2: number, _3: number): TvgCanvas;
  };
  term(): void;
  init(): number;
}

export type MainModule = WasmModule & typeof RuntimeExports & EmbindModule;
export default function MainModuleFactory (options?: unknown): Promise<MainModule>;
