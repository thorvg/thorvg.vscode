/**
 * FinalizationRegistry instances for automatic memory management
 */
interface RegistryToken {
    ptr: number;
    cleanup: (ptr: number) => void;
}

/**
 * Base class for all WASM-backed objects
 */

declare abstract class WasmObject {
    #private;
    constructor(ptr: number, registry?: FinalizationRegistry<RegistryToken>);
    /**
     * Gets the WASM pointer for this object
     * Returns 0 if object has been disposed (error handled by global handler)
     */
    get ptr(): number;
    set ptr(ptr: number);
    /**
     * Manually dispose of this object and free its WASM memory
     */
    dispose(): void;
    /**
     * Check if this object has been disposed
     */
    get isDisposed(): boolean;
    /**
     * Cleanup function to be implemented by subclasses
     * @param ptr - The WASM pointer to clean up
     */
    protected abstract _cleanup(ptr: number): void;
}

/**
 * ThorVG constants and enums
 * @category Constants
 */
/**
 * Blend method for compositing paint layers.
 *
 * Defines various blending modes for combining a source paint (top layer) with a destination (bottom layer).
 * Notation: S = source paint, D = destination, Sa = source alpha, Da = destination alpha.
 * @category Constants
 */
declare enum BlendMethod {
    /** Perform alpha blending (default). S if (Sa == 255), otherwise (Sa * S) + (255 - Sa) * D */
    Normal = 0,
    /** Multiply the RGB values of each pixel. (S * D) */
    Multiply = 1,
    /** Invert, multiply, and invert again. (S + D) - (S * D) */
    Screen = 2,
    /** Combines Multiply and Screen modes. (2 * S * D) if (D < 128), otherwise 255 - 2 * (255 - S) * (255 - D) */
    Overlay = 3,
    /** Retains the smallest components. min(S, D) */
    Darken = 4,
    /** Retains the largest components. max(S, D) */
    Lighten = 5,
    /** Divides the bottom layer by the inverted top layer. D / (255 - S) */
    ColorDodge = 6,
    /** Divides the inverted bottom layer by the top layer, then inverts. 255 - (255 - D) / S */
    ColorBurn = 7,
    /** Same as Overlay but with color roles reversed. (2 * S * D) if (S < 128), otherwise 255 - 2 * (255 - S) * (255 - D) */
    HardLight = 8,
    /** Similar to Overlay but softer. (255 - 2 * S) * (D * D) + (2 * S * D) */
    SoftLight = 9,
    /** Absolute difference between layers. (S - D) if (S > D), otherwise (D - S) */
    Difference = 10,
    /** Twice the product subtracted from the sum. S + D - (2 * S * D) */
    Exclusion = 11,
    /** Combine with HSL(Sh + Ds + Dl) then convert to RGB */
    Hue = 12,
    /** Combine with HSL(Dh + Ss + Dl) then convert to RGB */
    Saturation = 13,
    /** Combine with HSL(Sh + Ss + Dl) then convert to RGB */
    Color = 14,
    /** Combine with HSL(Dh + Ds + Sl) then convert to RGB */
    Luminosity = 15,
    /** Simply adds pixel values. (S + D) */
    Add = 16,
    /** For intermediate composition layers; suitable for use with Scene or Picture */
    Composition = 255
}
/**
 * Stroke cap style for line endings.
 *
 * Determines the shape of the endpoints of open paths when stroked.
 * @category Shape
 */
declare enum StrokeCap {
    /** Flat cap at the exact endpoint (no extension) */
    Butt = 0,
    /** Rounded cap extending beyond the endpoint by half the stroke width */
    Round = 1,
    /** Square cap extending beyond the endpoint by half the stroke width */
    Square = 2
}
/**
 * Stroke join style for line corners.
 *
 * Determines the shape of corners where two path segments meet when stroked.
 * @category Shape
 */
declare enum StrokeJoin {
    /** Sharp corner with pointed edge (subject to miter limit) */
    Miter = 0,
    /** Rounded corner with circular arc */
    Round = 1,
    /** Flat corner with angled edge (beveled) */
    Bevel = 2
}
/**
 * Fill rule for determining whether a point is inside a shape.
 *
 * Used to determine which regions should be filled when rendering complex paths
 * with self-intersections or multiple contours.
 * @category Shape
 */
declare enum FillRule {
    /** Non-zero winding rule (default) - counts the number of times a path winds around a point */
    Winding = 0,
    /** Even-odd rule - alternates between filled and unfilled regions, useful for complex shapes with holes */
    EvenOdd = 1
}
/**
 * Gradient spread method for areas outside the gradient bounds.
 *
 * Determines how the gradient behaves in regions outside the defined gradient vector.
 * @category Gradients
 */
declare enum GradientSpread {
    /** Extend the edge colors to infinity (default) */
    Pad = 0,
    /** Mirror the gradient pattern */
    Reflect = 1,
    /** Repeat the gradient pattern */
    Repeat = 2
}
/**
 * Composite method for combining paint objects.
 *
 * Defines methods for compositing operations such as clipping and masking.
 * @category Constants
 */
declare enum CompositeMethod {
    /** No compositing is applied */
    None = 0,
    /** Use the paint as a clipping path */
    ClipPath = 1,
    /** Alpha masking using the mask's alpha values */
    AlphaMask = 2,
    /** Inverse alpha masking using the complement of the mask's alpha values */
    InvAlphaMask = 3,
    /** Luma masking using the grayscale of the mask */
    LumaMask = 4,
    /** Inverse luma masking using the complement of the mask's grayscale */
    InvLumaMask = 5
}
/**
 * Mask method for masking operations.
 *
 * Defines various methods for applying masks to paint objects.
 * @category Constants
 */
declare enum MaskMethod {
    /** No masking is applied */
    None = 0,
    /** Alpha masking using the masking target's pixels as an alpha value */
    Alpha = 1,
    /** Alpha masking using the complement to the masking target's pixels */
    InvAlpha = 2,
    /** Alpha masking using the grayscale (0.2126R + 0.7152G + 0.0722B) of the masking target */
    Luma = 3,
    /** Alpha masking using the grayscale of the complement to the masking target */
    InvLuma = 4,
    /** Combines target and source using target alpha. (T * TA) + (S * (255 - TA)) */
    Add = 5,
    /** Subtracts source from target considering alpha. (T * TA) - (S * (255 - TA)) */
    Subtract = 6,
    /** Takes minimum alpha and multiplies with target. (T * min(TA, SA)) */
    Intersect = 7,
    /** Absolute difference between colors. abs(T - S * (255 - TA)) */
    Difference = 8,
    /** Where masks intersect, uses the highest transparency value */
    Lighten = 9,
    /** Where masks intersect, uses the lowest transparency value */
    Darken = 10
}
/**
 * Scene effect for post-processing effects.
 *
 * Defines various visual effects that can be applied to a Scene to modify its final appearance.
 * @category Scene
 */
declare enum SceneEffect {
    /** Reset all previously applied scene effects, restoring the scene to its original state */
    ClearAll = 0,
    /** Apply a blur effect with a Gaussian filter. Params: sigma (>0), direction (both/horizontal/vertical), border (duplicate/wrap), quality (0-100) */
    GaussianBlur = 1,
    /** Apply a drop shadow effect with Gaussian blur. Params: color RGB (0-255), opacity (0-255), angle (0-360), distance, blur sigma (>0), quality (0-100) */
    DropShadow = 2,
    /** Override the scene content color with given fill. Params: color RGB (0-255), opacity (0-255) */
    Fill = 3,
    /** Tint the scene color with black and white parameters. Params: black RGB (0-255), white RGB (0-255), intensity (0-100) */
    Tint = 4,
    /** Apply tritone color effect using shadows, midtones, and highlights. Params: shadow RGB, midtone RGB, highlight RGB (all 0-255), blend (0-255) */
    Tritone = 5
}
/**
 * Text wrapping mode for multi-line text layout.
 *
 * Controls how text breaks across multiple lines when it exceeds the layout width.
 * @category Text
 */
declare enum TextWrapMode {
    /** No wrapping - text remains on a single line */
    None = 0,
    /** Wrap at any character boundary */
    Character = 1,
    /** Wrap at word boundaries (default) */
    Word = 2,
    /** Intelligent wrapping with hyphenation support */
    Smart = 3,
    /** Truncate with ellipsis (...) when text exceeds bounds */
    Ellipsis = 4
}
/**
 * Color space enum for raw image data.
 * Specifies the channel order and alpha premultiplication.
 * @category Picture
 */
declare enum ColorSpace {
    /** Alpha, Blue, Green, Red - alpha-premultiplied */
    ABGR8888 = 0,
    /** Alpha, Red, Green, Blue - alpha-premultiplied */
    ARGB8888 = 1,
    /** Alpha, Blue, Green, Red - un-alpha-premultiplied */
    ABGR8888S = 2,
    /** Alpha, Red, Green, Blue - un-alpha-premultiplied */
    ARGB8888S = 3,
    /** Single channel grayscale data */
    Grayscale8 = 4,
    /** Unknown channel data (reserved for initial value) */
    Unknown = 255
}
/**
 * MIME type or format hint for loading picture data.
 *
 * Supported image and vector file formats for Picture class.
 * @category Picture
 */
type MimeType = 'svg' | 'png' | 'jpg' | 'jpeg' | 'webp' | 'raw' | 'lot' | 'lottie+json';
/**
 * Rendering backend type for Canvas.
 *
 * ThorVG supports three rendering backends, each with different performance
 * characteristics and browser compatibility:
 *
 * ## Available Renderers
 *
 * ### `'sw'` - Software Renderer
 * - **Rendering**: CPU-based software rendering
 * - **Performance**: Slower, but works everywhere
 * - **Compatibility**: All browsers and devices
 * - **Best for**: Maximum compatibility, simple graphics, server-side rendering
 *
 * ### `'gl'` - WebGL Renderer (Recommended)
 * - **Rendering**: GPU-accelerated using WebGL 2.0
 * - **Performance**: Excellent performance with wide browser support
 * - **Compatibility**: Chrome 56+, Firefox 51+, Safari 15+, Edge 79+
 * - **Best for**: Production applications, interactive graphics, animations
 * - **Recommended for most use cases**
 *
 * ### `'wg'` - WebGPU Renderer
 * - **Rendering**: Next-generation GPU API
 * - **Performance**: Best performance for complex scenes
 * - **Compatibility**: Chrome 113+, Edge 113+ (limited support)
 * - **Best for**: Maximum performance, modern browsers only
 *
 * @example
 * ```typescript
 * // Recommended setup with WebGL
 * const TVG = await ThorVG.init({ renderer: 'gl' });
 * const canvas = new TVG.Canvas('#canvas', { width: 800, height: 600 });
 * ```
 *
 * @example
 * ```typescript
 * // Maximum performance with WebGPU (modern browsers only)
 * const TVG = await ThorVG.init({ renderer: 'wg' });
 * ```
 *
 * @example
 * ```typescript
 * // Maximum compatibility with Software renderer
 * const TVG = await ThorVG.init({ renderer: 'sw' });
 * ```
 *
 * @category Canvas
 */
type RendererType = 'sw' | 'gl' | 'wg';

type constants_BlendMethod = BlendMethod;
declare const constants_BlendMethod: typeof BlendMethod;
type constants_ColorSpace = ColorSpace;
declare const constants_ColorSpace: typeof ColorSpace;
type constants_CompositeMethod = CompositeMethod;
declare const constants_CompositeMethod: typeof CompositeMethod;
type constants_FillRule = FillRule;
declare const constants_FillRule: typeof FillRule;
type constants_GradientSpread = GradientSpread;
declare const constants_GradientSpread: typeof GradientSpread;
type constants_MaskMethod = MaskMethod;
declare const constants_MaskMethod: typeof MaskMethod;
type constants_MimeType = MimeType;
type constants_RendererType = RendererType;
type constants_SceneEffect = SceneEffect;
declare const constants_SceneEffect: typeof SceneEffect;
type constants_StrokeCap = StrokeCap;
declare const constants_StrokeCap: typeof StrokeCap;
type constants_StrokeJoin = StrokeJoin;
declare const constants_StrokeJoin: typeof StrokeJoin;
type constants_TextWrapMode = TextWrapMode;
declare const constants_TextWrapMode: typeof TextWrapMode;
declare namespace constants {
  export { constants_BlendMethod as BlendMethod, constants_ColorSpace as ColorSpace, constants_CompositeMethod as CompositeMethod, constants_FillRule as FillRule, constants_GradientSpread as GradientSpread, constants_MaskMethod as MaskMethod, constants_SceneEffect as SceneEffect, constants_StrokeCap as StrokeCap, constants_StrokeJoin as StrokeJoin, constants_TextWrapMode as TextWrapMode };
  export type { constants_MimeType as MimeType, constants_RendererType as RendererType };
}

/**
 * Base class for all drawable objects
 * @category Paint
 */

/**
 * @category Shapes
 */
interface Bounds {
    x: number;
    y: number;
    width: number;
    height: number;
}
/**
 * @category Shapes
 */
interface Point {
    x: number;
    y: number;
}
/**
 * A 3x3 transformation matrix for 2D transformations.
 *
 * The matrix elements represent:
 * - e11, e12: Rotation/scale in X
 * - e21, e22: Rotation/scale in Y
 * - e13, e23: Translation in X and Y
 * - e31, e32: Always 0 (reserved for 3D)
 * - e33: Always 1 (homogeneous coordinate)
 *
 * Matrix layout:
 * ```
 * | e11  e12  e13 |
 * | e21  e22  e23 |
 * | e31  e32  e33 |
 * ```
 *
 * @category Shapes
 */
interface Matrix {
    e11: number;
    e12: number;
    e13: number;
    e21: number;
    e22: number;
    e23: number;
    e31: number;
    e32: number;
    e33: number;
}
declare abstract class Paint extends WasmObject {
    protected _cleanup(ptr: number): void;
    /**
     * Translate the paint by (x, y)
     */
    translate(x: number, y: number): this;
    /**
     * Rotate the paint by angle (in degrees)
     */
    rotate(angle: number): this;
    /**
     * Scale the paint by (sx, sy). If sy is not provided, use sx for both
     */
    scale(sx: number, sy?: number): this;
    /**
     * Set the origin point for transformations (rotation, scale).
     * The origin is specified as normalized coordinates (0.0 to 1.0).
     * - (0, 0) = top-left corner
     * - (0.5, 0.5) = center (default)
     * - (1, 1) = bottom-right corner
     *
     * @param x - Normalized X coordinate (0.0 to 1.0)
     * @param y - Normalized Y coordinate (0.0 to 1.0)
     * @returns The Paint instance for method chaining
     *
     * @example
     * ```typescript
     * const picture = new TVG.Picture();
     * picture.load(svgData, { type: 'svg' });
     *
     * // Set origin to center for rotation around center
     * picture.origin(0.5, 0.5);
     * picture.translate(300, 300);
     * picture.rotate(45);
     * ```
     */
    origin(x: number, y: number): this;
    /**
     * Set the blending method for this paint.
     * Blending determines how this paint is combined with the content below it.
     *
     * @param method - The blending method to use
     * @returns The Paint instance for method chaining
     *
     * @example
     * ```typescript
     * const scene = new TVG.Scene();
     * scene.blend(BlendMethod.Add);
     *
     * const shape = new TVG.Shape();
     * shape.appendCircle(100, 100, 50, 50);
     * shape.fill(255, 0, 0, 255);
     * shape.blend(BlendMethod.Multiply);
     * ```
     */
    blend(method: BlendMethod): this;
    /**
     * Get or set the opacity (0 to 255)
     * @param value - The opacity value in the range [0 ~ 255], where 0 is completely transparent and 255 is opaque.
     * @returns When setting, returns the Paint instance for method chaining. When getting, returns the opacity value (0-255).
     *
     * @example
     * ```typescript
     * // Set opacity to 50% (half transparent)
     * shape.opacity(128);
     *
     * // Set to fully opaque
     * shape.opacity(255);
     *
     * // Get current opacity value
     * const currentOpacity = shape.opacity(); // returns 0-255
     * ```
     */
    opacity(): number;
    opacity(value: number): this;
    /**
     * Get or set the visibility
     */
    visible(): boolean;
    visible(value: boolean): this;
    /**
     * Get the axis-aligned bounding box (AABB) of this paint
     */
    bounds(): Bounds;
    /**
     * Get the oriented bounding box (OBB) of this paint as 4 corner points
     * @param options - Options object with oriented flag
     */
    bounds(options: {
        oriented: true;
    }): Point[];
    /**
     * Duplicate this paint object
     */
    duplicate<T extends Paint>(): T;
    /**
     * Applies a custom transformation matrix to the paint.
     *
     * This method allows you to apply complex transformations that combine
     * translation, rotation, scaling, and skewing in a single operation.
     * The matrix is multiplied with any existing transformations.
     *
     * @param matrix - A 3x3 transformation matrix
     * @returns The Paint instance for method chaining
     *
     * @example
     * ```typescript
     * // Apply a combined transformation
     * const shape = new TVG.Shape();
     * shape.appendRect(0, 0, 100, 100);
     *
     * // Create a matrix for: scale(2, 1.5) + rotate(45deg) + translate(100, 50)
     * const rad = (45 * Math.PI) / 180;
     * const cos = Math.cos(rad);
     * const sin = Math.sin(rad);
     *
     * shape.transform({
     *   e11: 2 * cos,   e12: -2 * sin,  e13: 100,
     *   e21: 1.5 * sin, e22: 1.5 * cos, e23: 50,
     *   e31: 0,         e32: 0,         e33: 1
     * });
     * ```
     *
     * @example
     * ```typescript
     * // Create a skew transformation
     * const shape = new TVG.Shape();
     * shape.appendRect(0, 0, 100, 100);
     *
     * // Skew in X direction
     * shape.transform({
     *   e11: 1,   e12: 0.5, e13: 0,
     *   e21: 0,   e22: 1,   e23: 0,
     *   e31: 0,   e32: 0,   e33: 1
     * });
     * ```
     */
    transform(matrix: Matrix): this;
    /**
     * Sets a clipping path for this paint object.
     *
     * The clipping path restricts the area where the paint will be rendered.
     * Only the parts of the paint that overlap with the clipper shape will be visible.
     *
     * @param clipper - A Paint object (typically a Shape) to use as the clipping path
     * @returns The Paint instance for method chaining
     *
     * @example
     * ```typescript
     * const circle = new TVG.Shape();
     * circle.appendCircle(150, 150, 100);
     *
     * const rect = new TVG.Shape();
     * rect.appendRect(0, 0, 300, 300)
     *     .fill(255, 0, 0, 255)
     *     .clip(circle);
     *
     * canvas.add(rect);
     * ```
     */
    clip(clipper: Paint): this;
    /**
     * Sets a masking target object and the masking method.
     *
     * The masking restricts the transparency of the source paint using the target paint.
     *
     * @param target - A Paint object to use as the masking target
     * @param method - The method used to mask the source object with the target
     * @returns The Paint instance for method chaining
     *
     * @example
     * ```typescript
     * const mask = new TVG.Shape();
     * mask.appendCircle(200, 200, 125);
     * mask.fill(255, 255, 255);
     *
     * const shape = new TVG.Shape();
     * shape.appendRect(0, 0, 400, 400)
     *     .fill(255, 0, 0, 255)
     *     .mask(mask, MaskMethod.Alpha);
     *
     * canvas.add(shape);
     * ```
     */
    mask(target: Paint, method: MaskMethod): this;
    /**
     * Checks if the paint intersects with the given rectangular region.
     *
     * @param x - The x-coordinate of the region's top-left corner
     * @param y - The y-coordinate of the region's top-left corner
     * @param width - The width of the region
     * @param height - The height of the region
     * @returns true if the paint intersects with the region, false otherwise
     *
     * @example
     * ```typescript
     * const shape = new TVG.Shape();
     * shape.appendRect(100, 100, 200, 200);
     *
     * // Check if shape intersects with a region
     * if (shape.intersects(150, 150, 100, 100)) {
     *   console.log('Shape intersects with region');
     * }
     * ```
     */
    intersects(x: number, y: number, width: number, height: number): boolean;
    /**
     * Create a new instance of this paint type with the given pointer
     * Must be implemented by subclasses
     */
    protected abstract _createInstance(ptr: number): Paint;
}

/**
 * Canvas Rendering context for ThorVG
 *
 * The Canvas class manages the rendering context and provides methods for drawing
 * vector graphics to an HTML canvas element. It supports multiple rendering backends
 * (Software, WebGL, WebGPU) and handles the render loop.
 *
 * @category Canvas
 *
 * @example
 * Basic usage
 * ```typescript
 * const TVG = await ThorVG.init({ renderer: 'gl' });
 * const canvas = new TVG.Canvas('#canvas', {
 *   width: 800,
 *   height: 600
 * });
 *
 * const shape = new TVG.Shape();
 * shape.appendCircle(400, 300, 100)
 *      .fill(255, 0, 0, 255);
 *
 * canvas.add(shape).render();
 * ```
 *
 * @example
 * Rendering with animation loop
 * ```typescript
 * const canvas = new TVG.Canvas('#canvas');
 * const animation = new TVG.Animation();
 * await animation.load(lottieData);
 *
 * canvas.add(animation.picture);
 *
 * function animate() {
 *   animation.frame(currentFrame++);
 *   canvas.update().render();
 *   requestAnimationFrame(animate);
 * }
 * animate();
 * ```
 */

/**
 * Configuration options for Canvas initialization.
 *
 * @category Canvas
 */
interface CanvasOptions {
    /** Canvas width in pixels. Default: 800 */
    width?: number;
    /** Canvas height in pixels. Default: 600 */
    height?: number;
    /** Enable device pixel ratio for high-DPI displays. Default: true */
    enableDevicePixelRatio?: boolean;
}
/**
 * Canvas rendering context for ThorVG vector graphics.
 *
 * Manages the rendering pipeline and provides methods for adding/removing Paint objects
 * and controlling the render loop.
 *
 * @category Canvas
 *
 * @example
 * ```typescript
 * // Initialize with renderer
 * const TVG = await ThorVG.init({ renderer: 'gl' });
 *
 * // Basic canvas setup with shapes
 * const canvas = new TVG.Canvas('#canvas', { width: 800, height: 600 });
 *
 * const shape = new TVG.Shape();
 * shape.appendRect(100, 100, 200, 150, 10)
 *      .fill(255, 100, 50, 255);
 *
 * canvas.add(shape).render();
 * ```
 *
 * @example
 * ```typescript
 * // Animation loop
 * const canvas = new TVG.Canvas('#canvas');
 * const shape = new TVG.Shape();
 *
 * let rotation = 0;
 * function animate() {
 *   shape.reset()
 *        .appendRect(0, 0, 100, 100)
 *        .fill(100, 150, 255, 255)
 *        .rotate(rotation++)
 *        .translate(400, 300);
 *
 *   canvas.update().render();
 *   requestAnimationFrame(animate);
 * }
 * animate();
 * ```
 */
declare class Canvas {
    #private;
    /**
     * Creates a new Canvas rendering context.
     *
     * The renderer is determined by the global setting from ThorVG.init().
     *
     * @param selector - CSS selector for the target HTML canvas element (e.g., '#canvas', '.my-canvas')
     * @param options - Configuration options for the canvas
     *
     * @throws {Error} If the canvas element is not found or renderer initialization fails
     *
     * @example
     * ```typescript
     * // Initialize with renderer
     * const TVG = await ThorVG.init({ renderer: 'gl' });
     *
     * // Basic canvas with default options (DPR enabled by default)
     * const canvas = new TVG.Canvas('#canvas');
     * ```
     *
     * @example
     * ```typescript
     * // Canvas with custom size
     * const TVG = await ThorVG.init({ renderer: 'wg' });
     * const canvas = new TVG.Canvas('#myCanvas', {
     *   width: 1920,
     *   height: 1080
     * });
     * ```
     *
     * @example
     * ```typescript
     * // Canvas with DPR disabled for consistent rendering across devices
     * const canvas = new TVG.Canvas('#canvas', {
     *   width: 800,
     *   height: 600,
     *   enableDevicePixelRatio: false
     * });
     * ```
     */
    constructor(selector: string, options?: CanvasOptions);
    /**
     * Adds a Paint object to the canvas for rendering.
     *
     * Paint objects include Shape, Scene, Picture, Text, and Animation.picture.
     * Objects are rendered in the order they are added (painter's algorithm).
     *
     * @param paint - A Paint object to add to the canvas
     * @returns The canvas instance for method chaining
     *
     * @example
     * ```typescript
     * const shape = new TVG.Shape();
     * const text = new TVG.Text();
     * canvas.add(shape);
     * canvas.add(text);
     * ```
     *
     * @example
     * ```typescript
     * // Method chaining
     * canvas.add(shape1)
     *       .add(shape2)
     *       .render();
     * ```
     */
    add(paint: Paint): this;
    /**
     * Removes one or all Paint objects from the canvas.
     *
     * @param paint - Optional Paint object to remove. If omitted, removes all Paint objects.
     * @returns The canvas instance for method chaining
     *
     * @example
     * ```typescript
     * // Remove a specific paint
     * canvas.remove(shape);
     * ```
     *
     * @example
     * ```typescript
     * // Remove all paints
     * canvas.remove();
     * ```
     */
    remove(paint?: Paint): this;
    /**
     * Clears all Paint objects from the canvas and renders an empty frame.
     *
     * This is equivalent to {@link remove | remove()} without arguments,
     * but also immediately renders the cleared canvas.
     *
     * @returns The canvas instance for method chaining
     *
     * @example
     * ```typescript
     * canvas.clear(); // Clears and renders empty canvas
     * ```
     */
    clear(): this;
    /**
     * Updates the canvas state before rendering.
     *
     * This method should be called before {@link render} when working with animations
     * or when Paint objects have been modified. It ensures all transformations and
     * changes are processed.
     *
     * @returns The canvas instance for method chaining
     *
     * @example
     * ```typescript
     * // Animation loop pattern
     * function animate() {
     *   animation.frame(currentFrame++);
     *   canvas.update().render();
     *   requestAnimationFrame(animate);
     * }
     * ```
     *
     * @remarks
     * For static scenes, calling {@link render} alone is sufficient.
     * For animated content, always call update() before render().
     */
    update(): this;
    /**
     * Renders all Paint objects to the canvas.
     *
     * This method draws all added Paint objects to the canvas using the configured
     * rendering backend (Software, WebGL, or WebGPU).
     *
     * @returns The canvas instance for method chaining
     *
     * @example
     * ```typescript
     * // Static rendering
     * canvas.add(shape).add(text).render();
     * ```
     *
     * @example
     * ```typescript
     * // Animation loop
     * function animate() {
     *   canvas.update().render();
     *   requestAnimationFrame(animate);
     * }
     * ```
     *
     * @remarks
     * For animated content, call {@link update} before render().
     * For static scenes, render() can be called directly.
     */
    render(): this;
    private _calculateDPR;
    private _updateHTMLCanvas;
    /**
     * Resizes the canvas to new dimensions.
     *
     * @param width - New width in pixels
     * @param height - New height in pixels
     * @returns The canvas instance for method chaining
     *
     * @example
     * ```typescript
     * canvas.resize(1920, 1080).render();
     * ```
     *
     * @example
     * ```typescript
     * // Responsive canvas
     * window.addEventListener('resize', () => {
     *   canvas.resize(window.innerWidth, window.innerHeight).render();
     * });
     * ```
     */
    resize(width: number, height: number): this;
    /**
     * Sets the viewport for rendering a specific region of the canvas.
     *
     * The viewport defines the rectangular region where rendering occurs.
     * Useful for rendering to a portion of the canvas or implementing split-screen views.
     *
     * @param x - X coordinate of the viewport origin
     * @param y - Y coordinate of the viewport origin
     * @param w - Viewport width
     * @param h - Viewport height
     * @returns The canvas instance for method chaining
     *
     * @example
     * ```typescript
     * // Render to top-left quarter of canvas
     * canvas.viewport(0, 0, canvas.width / 2, canvas.height / 2);
     * ```
     */
    viewport(x: number, y: number, w: number, h: number): this;
    /**
     * Destroys the canvas and frees its WASM memory.
     *
     * After calling destroy(), this canvas instance cannot be used.
     * The ThorVG module remains loaded and new canvases can be created.
     *
     * @example
     * ```typescript
     * canvas.destroy();
     * // Create a new canvas
     * const newCanvas = new TVG.Canvas('#canvas');
     * ```
     *
     * @remarks
     * This method should be called when you're done with a canvas to free memory.
     * It's particularly important in single-page applications where canvases
     * may be created and destroyed frequently.
     */
    destroy(): void;
    /**
     * Gets the rendering backend type currently in use.
     *
     * @returns The renderer type: 'sw' (Software), 'gl' (WebGL), or 'wg' (WebGPU)
     *
     * @example
     * ```typescript
     * const canvas = new TVG.Canvas('#canvas', { renderer: 'wg' });
     * console.log(canvas.renderer); // 'wg'
     * ```
     */
    get renderer(): string;
    /**
     * Gets the current device pixel ratio applied to this canvas.
     *
     * ThorVG uses an optimized DPR formula for best performance:
     * `1 + ((window.devicePixelRatio - 1) * 0.75)`
     *
     * This provides a balance between visual quality and rendering performance,
     * especially on high-DPI displays.
     *
     * @category Canvas
     * @returns The current effective DPR value, or 1.0 if DPR scaling is disabled
     *
     * @example
     * ```typescript
     * // Getting the current DPR
     * const canvas = new TVG.Canvas('#canvas', {
     *   enableDevicePixelRatio: true
     * });
     *
     * console.log(canvas.dpr); // e.g., 1.75 on a 2x display
     * console.log(window.devicePixelRatio); // e.g., 2.0
     * ```
     *
     * @example
     * ```typescript
     * // Using DPR for responsive calculations
     * const canvas = new TVG.Canvas('#canvas');
     * const shape = new TVG.Shape();
     *
     * // Adjust stroke width based on DPR for consistent appearance
     * const strokeWidth = 2 / canvas.dpr;
     * shape.appendCircle(100, 100, 50)
     *      .stroke(255, 0, 0, 255)
     *      .strokeWidth(strokeWidth);
     * ```
     *
     * @see {@link CanvasOptions.enableDevicePixelRatio} for controlling DPR scaling
     */
    get dpr(): number;
}

/**
 * Base class for gradient fills
 * @category Gradients
 */

/**
 * @category Gradients
 */
type ColorStop = readonly [number, number, number, number];
interface ColorStopEntry {
    offset: number;
    color: ColorStop;
}
declare abstract class Fill extends WasmObject {
    protected _stops: ColorStopEntry[];
    protected _cleanup(ptr: number): void;
    /**
     * Add a color stop to the gradient
     * @param offset - Position of the stop (0.0 to 1.0)
     * @param color - RGBA color [r, g, b, a] where each value is 0-255
     */
    addStop(offset: number, color: ColorStop): this;
    /**
     * Clear all pending color stops
     * Use this to reset stops before adding new ones
     *
     * @returns The Fill instance for method chaining
     *
     * @example
     * ```typescript
     * const gradient = new TVG.LinearGradient(0, 0, 200, 0);
     * gradient.addStop(0, [255, 0, 0, 255])
     *         .addStop(1, [0, 0, 255, 255]);
     *
     * // Change stops
     * gradient.clearStops()
     *         .addStop(0, [0, 255, 0, 255])
     *         .addStop(1, [255, 255, 0, 255]);
     *
     * shape.fill(gradient);
     * ```
     */
    clearStops(): this;
    /**
     * Replace all color stops with new ones
     * This is a convenience method that clears existing stops and adds new ones in one call
     *
     * @param stops - Variable number of [offset, color] tuples
     * @returns The Fill instance for method chaining
     *
     * @example
     * ```typescript
     * const gradient = new TVG.LinearGradient(0, 0, 200, 0);
     * gradient.setStops(
     *   [0, [255, 0, 0, 255]],      // Red at start
     *   [0.5, [255, 255, 0, 255]],  // Yellow at middle
     *   [1, [0, 255, 0, 255]]       // Green at end
     * );
     *
     * shape.fill(gradient);
     *
     * // Later, completely replace stops
     * gradient.setStops(
     *   [0, [0, 0, 255, 255]],   // Blue at start
     *   [1, [255, 0, 255, 255]]  // Magenta at end
     * );
     *
     * shape.fill(gradient);  // Re-apply with new stops
     * ```
     */
    setStops(...stops: Array<[number, ColorStop]>): this;
    /**
     * Apply collected color stops to the gradient
     * ColorStop struct: {float offset, uint8_t r, g, b, a} = 8 bytes per stop
     */
    protected _applyStops(): void;
    /**
     * Set the gradient spread method
     */
    spread(type: GradientSpread): this;
}

/**
 * Vector path drawing and manipulation
 *
 * Shape is the fundamental drawing primitive in ThorVG WebCanvas. It provides methods for
 * creating paths using moveTo/lineTo/cubicTo commands, as well as convenience methods for
 * common shapes like rectangles and circles. Shapes can be filled with solid colors or
 * gradients, and stroked with customizable line styles.
 *
 * @category Shapes
 *
 * @example
 * ```typescript
 * // Basic triangle
 * const shape = new TVG.Shape();
 * shape.moveTo(100, 50)
 *      .lineTo(150, 150)
 *      .lineTo(50, 150)
 *      .close()
 *      .fill(255, 0, 0, 255);
 * canvas.add(shape).render();
 * ```
 *
 * @example
 * ```typescript
 * // Rectangle with rounded corners
 * const rect = new TVG.Shape();
 * rect.appendRect(50, 50, 200, 100, { rx: 10, ry: 10 })
 *     .fill(0, 120, 255, 255)
 *     .stroke({ width: 3, color: [0, 0, 0, 255] });
 * ```
 *
 * @example
 * ```typescript
 * // Circle with gradient fill
 * const circle = new TVG.Shape();
 * const gradient = new TVG.RadialGradient(150, 150, 50);
 * gradient.addStop(0, [255, 255, 255, 255])
 *         .addStop(1, [0, 100, 255, 255]);
 *
 * circle.appendCircle(150, 150, 50)
 *       .fill(gradient);
 * ```
 *
 * @example
 * ```typescript
 * // Complex path with bezier curves
 * const shape = new TVG.Shape();
 * shape.moveTo(50, 100)
 *      .cubicTo(50, 50, 150, 50, 150, 100)
 *      .cubicTo(150, 150, 50, 150, 50, 100)
 *      .close()
 *      .fill(255, 100, 0, 255);
 * ```
 */

/**
 * Options for creating rectangles with rounded corners.
 *
 * @category Shapes
 */
interface RectOptions {
    /** Horizontal corner radius. Default: 0 */
    rx?: number;
    /** Vertical corner radius. Default: 0 */
    ry?: number;
    /** Path direction. true = clockwise, false = counter-clockwise. Default: true */
    clockwise?: boolean;
}
/**
 * Comprehensive stroke styling options.
 *
 * @category Shapes
 */
interface StrokeOptions {
    /** Stroke width in pixels */
    width?: number;
    /** Stroke color as [r, g, b, a] with values 0-255. Alpha is optional, defaults to 255. */
    color?: readonly [number, number, number, number?];
    /** Gradient fill for the stroke */
    gradient?: Fill;
    /** Line cap style: StrokeCap.Butt, StrokeCap.Round, or StrokeCap.Square. Default: StrokeCap.Butt */
    cap?: StrokeCap;
    /** Line join style: StrokeJoin.Miter, StrokeJoin.Round, or StrokeJoin.Bevel. Default: StrokeJoin.Miter */
    join?: StrokeJoin;
    /** Miter limit for 'miter' joins. Default: 4 */
    miterLimit?: number;
    /** Dash pattern as array of dash/gap lengths. Empty array [] resets to solid line. */
    dash?: number[];
    /** Dash pattern offset. Use with dash to shift pattern start position. */
    dashOffset?: number;
}
/**
 * Shape class for creating and manipulating vector graphics paths.
 *
 * Extends {@link Paint} to inherit transformation and opacity methods.
 *
 * @category Shapes
 *
 * @example
 * ```typescript
 * // Drawing basic shapes
 * const shape = new TVG.Shape();
 *
 * // Rectangle with rounded corners
 * shape.appendRect(50, 50, 200, 100, 10)
 *      .fill(255, 100, 100, 255)
 *      .stroke(50, 50, 50, 255, 2);
 *
 * canvas.add(shape);
 * ```
 *
 * @example
 * ```typescript
 * // Drawing paths with gradients
 * const shape = new TVG.Shape();
 * shape.moveTo(100, 100)
 *      .lineTo(200, 150)
 *      .lineTo(150, 250)
 *      .close();
 *
 * const gradient = new TVG.LinearGradient(100, 100, 200, 250);
 * gradient.addStop(0, [255, 0, 0, 255])
 *         .addStop(1, [0, 0, 255, 255]);
 *
 * shape.fillGradient(gradient);
 * canvas.add(shape);
 * ```
 *
 * @example
 * ```typescript
 * // Complex path with transformations
 * const shape = new TVG.Shape();
 * shape.appendCircle(0, 0, 50)
 *      .fill(100, 200, 255, 255)
 *      .translate(400, 300)
 *      .scale(1.5)
 *      .rotate(45);
 *
 * canvas.add(shape);
 * ```
 */
declare class Shape extends Paint {
    constructor(ptr?: number);
    protected _createInstance(ptr: number): Shape;
    /**
     * Moves the path cursor to a new point without drawing.
     *
     * This starts a new subpath at the specified coordinates. Subsequent drawing commands
     * will start from this point.
     *
     * @param x - X coordinate
     * @param y - Y coordinate
     * @returns The Shape instance for method chaining
     *
     * @example
     * ```typescript
     * shape.moveTo(100, 100)
     *      .lineTo(200, 200);
     * ```
     */
    moveTo(x: number, y: number): this;
    /**
     * Draws a straight line from the current point to the specified coordinates.
     *
     * @param x - End X coordinate
     * @param y - End Y coordinate
     * @returns The Shape instance for method chaining
     *
     * @example
     * ```typescript
     * // Draw a triangle
     * shape.moveTo(100, 50)
     *      .lineTo(150, 150)
     *      .lineTo(50, 150)
     *      .close();
     * ```
     */
    lineTo(x: number, y: number): this;
    /**
     * Draws a cubic Bézier curve from the current point to (x, y).
     *
     * @param cx1 - X coordinate of first control point
     * @param cy1 - Y coordinate of first control point
     * @param cx2 - X coordinate of second control point
     * @param cy2 - Y coordinate of second control point
     * @param x - End X coordinate
     * @param y - End Y coordinate
     * @returns The Shape instance for method chaining
     *
     * @example
     * ```typescript
     * // Draw a smooth curve
     * shape.moveTo(50, 100)
     *      .cubicTo(50, 50, 150, 50, 150, 100);
     * ```
     */
    cubicTo(cx1: number, cy1: number, cx2: number, cy2: number, x: number, y: number): this;
    /**
     * Closes the current subpath by drawing a straight line back to the starting point.
     *
     * @returns The Shape instance for method chaining
     *
     * @example
     * ```typescript
     * shape.moveTo(100, 50)
     *      .lineTo(150, 150)
     *      .lineTo(50, 150)
     *      .close(); // Completes the triangle
     * ```
     */
    close(): this;
    /**
     * Appends a rectangle path to the shape.
     *
     * Creates a rectangular path with optional rounded corners. Multiple rectangles
     * can be added to the same shape.
     *
     * @param x - X coordinate of the top-left corner
     * @param y - Y coordinate of the top-left corner
     * @param w - Width of the rectangle
     * @param h - Height of the rectangle
     * @param options - Optional corner rounding and path direction
     * @returns The Shape instance for method chaining
     *
     * @example
     * ```typescript
     * // Simple rectangle
     * shape.appendRect(50, 50, 200, 100);
     * ```
     *
     * @example
     * ```typescript
     * // Rounded rectangle
     * shape.appendRect(50, 50, 200, 100, { rx: 10, ry: 10 });
     * ```
     */
    appendRect(x: number, y: number, w: number, h: number, options?: RectOptions): this;
    /**
     * Appends a circle or ellipse path to the shape.
     *
     * Creates a circular or elliptical path. If only one radius is provided,
     * creates a perfect circle. If two radii are provided, creates an ellipse.
     *
     * @param cx - X coordinate of the center
     * @param cy - Y coordinate of the center
     * @param rx - Horizontal radius
     * @param ry - Vertical radius (defaults to rx for perfect circle)
     * @param clockwise - Path direction. Default: true
     * @returns The Shape instance for method chaining
     *
     * @example
     * ```typescript
     * // Perfect circle
     * shape.appendCircle(150, 150, 50)
     *      .fill(255, 0, 0, 255);
     * ```
     *
     * @example
     * ```typescript
     * // Ellipse
     * shape.appendCircle(150, 150, 80, 50)
     *      .fill(0, 100, 255, 255);
     * ```
     */
    appendCircle(cx: number, cy: number, rx: number, ry?: number, clockwise?: boolean): this;
    /**
     * Sets the fill rule for the shape.
     *
     * The fill rule determines how the interior of a shape is calculated when the path
     * intersects itself or when multiple subpaths overlap.
     *
     * @param rule - Fill rule: 'winding' (non-zero) or 'evenodd'
     * @returns The Shape instance for method chaining
     *
     * @example
     * ```typescript
     * const star = new TVG.Shape();
     * // Draw a self-intersecting star
     * star.moveTo(100, 10)
     *     .lineTo(40, 180)
     *     .lineTo(190, 60)
     *     .lineTo(10, 60)
     *     .lineTo(160, 180)
     *     .close()
     *     .fillRule(FillRule.EvenOdd)  // Use even-odd rule for star shape
     *     .fill(255, 200, 0, 255);
     * ```
     */
    fillRule(rule: FillRule): this;
    /**
     * Sets the trim of the shape along the defined path segment, controlling which part is visible.
     *
     * This method allows you to trim/cut paths, showing only a portion from the begin to end point.
     * This is particularly useful for animations (e.g., drawing a line progressively) or creating
     * partial shapes like arcs from circles.
     *
     * If the values exceed the 0-1 range, they wrap around (similar to angle wrapping).
     *
     * @param begin - Start of the segment to display (0.0 to 1.0, where 0 is the path start)
     * @param end - End of the segment to display (0.0 to 1.0, where 1 is the path end)
     * @param simultaneous - How to handle multiple paths within the shape:
     *   - `true` (default): Trimming applied simultaneously to all paths
     *   - `false`: All paths treated as one entity with combined length
     * @returns The Shape instance for method chaining
     *
     * @example
     * ```typescript
     * // Draw half a circle (arc)
     * const arc = new TVG.Shape();
     * arc.appendCircle(150, 150, 100)
     *    .trimPath(0, 0.5)  // Show only first half
     *    .stroke({ width: 5, color: [255, 0, 0, 255] });
     * ```
     *
     * @example
     * ```typescript
     * // Animated line drawing effect
     * const line = new TVG.Shape();
     * line.moveTo(50, 100)
     *     .lineTo(250, 100)
     *     .trimPath(0, progress)  // progress from 0 to 1
     *     .stroke({ width: 3, color: [0, 100, 255, 255] });
     * ```
     *
     * @example
     * ```typescript
     * // Trim multiple paths separately
     * const shape = new TVG.Shape();
     * shape.appendRect(50, 50, 100, 100)
     *      .appendCircle(200, 100, 50)
     *      .trimPath(0.25, 0.75, true)  // Trim each path separately
     *      .stroke({ width: 2, color: [0, 0, 0, 255] });
     * ```
     */
    trimPath(begin: number, end: number, simultaneous?: boolean): this;
    /**
     * Sets the fill for the shape with a gradient.
     *
     * @param gradient - LinearGradient or RadialGradient to use as fill
     * @returns The Shape instance for method chaining
     */
    fill(gradient: Fill): this;
    /**
     * Sets the fill for the shape with a solid color.
     *
     * @param r - Red component (0-255)
     * @param g - Green component (0-255)
     * @param b - Blue component (0-255)
     * @param a - Alpha component (0-255). Default: 255 (opaque)
     * @returns The Shape instance for method chaining
     */
    fill(r: number, g: number, b: number, a?: number): this;
    /**
     * Sets the stroke width for the shape.
     *
     * @param width - Stroke width in pixels
     * @returns The Shape instance for method chaining
     */
    stroke(width: number): this;
    /**
     * Sets comprehensive stroke styling options for the shape.
     *
     * @param options - Stroke configuration including width, color, gradient, caps, joins, and miter limit
     * @returns The Shape instance for method chaining
     */
    stroke(options: StrokeOptions): this;
    /**
     * Resets the shape's path data while retaining fill and stroke properties.
     *
     * This method clears all path commands (moveTo, lineTo, cubicTo, appendRect, etc.)
     * but preserves the shape's fill color, gradient, stroke settings, and transformations.
     * This is useful for animations where you want to redraw the path while keeping
     * the same styling.
     *
     * @returns The Shape instance for method chaining
     *
     * @example
     * ```typescript
     * // Animating shape changes while keeping styles
     * const shape = new TVG.Shape();
     * shape.appendRect(0, 0, 100, 100);
     * shape.fill(255, 0, 0, 255);
     * shape.stroke({ width: 5, color: [0, 0, 255, 255] });
     *
     * // Later, change the shape but keep the fill/stroke
     * shape.reset();
     * shape.appendCircle(50, 50, 40);
     * // Still has red fill and blue stroke!
     * ```
     */
    reset(): this;
}

/**
 * Group and manage multiple paint objects
 * @category Scene
 */

/**
 * Scene class for hierarchical grouping of Paint objects
 * @category Scene
 *
 * @example
 * ```typescript
 * // Grouping shapes in a scene
 * const scene = new TVG.Scene();
 *
 * const background = new TVG.Shape();
 * background.appendRect(0, 0, 800, 600).fill(240, 240, 240, 255);
 *
 * const circle = new TVG.Shape();
 * circle.appendCircle(100, 100, 50).fill(255, 100, 100, 255);
 *
 * scene.add(background);
 * scene.add(circle);
 * canvas.add(scene);
 * ```
 *
 * @example
 * ```typescript
 * // Scene transformations affect all children
 * const scene = new TVG.Scene();
 *
 * for (let i = 0; i < 5; i++) {
 *   const shape = new TVG.Shape();
 *   shape.appendRect(i * 60, 100, 50, 50)
 *        .fill(100 + i * 30, 150, 255 - i * 30, 255);
 *   scene.add(shape);
 * }
 *
 * // Transform entire group
 * scene.translate(200, 200).rotate(30);
 * canvas.add(scene);
 * ```
 */
declare class Scene extends Paint {
    constructor(ptr?: number);
    protected _createInstance(ptr: number): Scene;
    /**
     * Add a paint to the scene
     */
    add(paint: Paint): this;
    /**
     * Remove paint(s) from the scene
     * If no paint is provided, removes all paints
     */
    remove(paint?: Paint): this;
    /**
     * Clear all paints from the scene (alias for remove())
     */
    clear(): this;
    /**
     * Reset all previously applied scene effects, restoring the scene to its original state.
     *
     * @returns The Scene instance for method chaining
     *
     * @example
     * ```typescript
     * const scene = new TVG.Scene();
     * scene.dropShadow(128, 128, 128, 200, 45, 5, 2, 60);
     * scene.resetEffects(); // Remove all effects
     * ```
     */
    resetEffects(): this;
    /**
     * Apply a Gaussian blur effect to the scene.
     *
     * @param sigma - Blur intensity (> 0)
     * @param direction - Blur direction: 0 (both), 1 (horizontal), 2 (vertical)
     * @param border - Border mode: 0 (duplicate), 1 (wrap)
     * @param quality - Blur quality (0-100)
     * @returns The Scene instance for method chaining
     *
     * @example
     * ```typescript
     * const scene = new TVG.Scene();
     * scene.add(shape1);
     * scene.add(shape2);
     * scene.gaussianBlur(1.5, 0, 0, 75); // Apply blur to entire scene
     * ```
     */
    gaussianBlur(sigma: number, direction?: number, border?: number, quality?: number): this;
    /**
     * Apply a drop shadow effect with Gaussian blur filter to the scene.
     *
     * @param r - Red component (0-255)
     * @param g - Green component (0-255)
     * @param b - Blue component (0-255)
     * @param a - Alpha/opacity (0-255)
     * @param angle - Shadow angle in degrees (0-360)
     * @param distance - Shadow distance/offset
     * @param sigma - Blur intensity for the shadow (> 0)
     * @param quality - Blur quality (0-100)
     * @returns The Scene instance for method chaining
     *
     * @example
     * ```typescript
     * const scene = new TVG.Scene();
     * scene.add(shape);
     * // Add gray drop shadow at 45° angle, 5px distance, 2px blur
     * scene.dropShadow(128, 128, 128, 200, 45, 5, 2, 60);
     * ```
     */
    dropShadow(r: number, g: number, b: number, a: number, angle: number, distance: number, sigma: number, quality?: number): this;
    /**
     * Override the scene content color with a given fill color.
     *
     * @param r - Red component (0-255)
     * @param g - Green component (0-255)
     * @param b - Blue component (0-255)
     * @param a - Alpha/opacity (0-255)
     * @returns The Scene instance for method chaining
     *
     * @example
     * ```typescript
     * const scene = new TVG.Scene();
     * scene.add(shape1);
     * scene.add(shape2);
     * scene.fillEffect(255, 0, 0, 128); // Fill entire scene with semi-transparent red
     * ```
     */
    fillEffect(r: number, g: number, b: number, a: number): this;
    /**
     * Apply a tint effect to the scene using black and white color parameters.
     *
     * @param blackR - Black tint red component (0-255)
     * @param blackG - Black tint green component (0-255)
     * @param blackB - Black tint blue component (0-255)
     * @param whiteR - White tint red component (0-255)
     * @param whiteG - White tint green component (0-255)
     * @param whiteB - White tint blue component (0-255)
     * @param intensity - Tint intensity (0-100)
     * @returns The Scene instance for method chaining
     *
     * @example
     * ```typescript
     * const scene = new TVG.Scene();
     * scene.add(picture);
     * // Apply sepia-like tint
     * scene.tint(112, 66, 20, 255, 236, 184, 50);
     * ```
     */
    tint(blackR: number, blackG: number, blackB: number, whiteR: number, whiteG: number, whiteB: number, intensity: number): this;
    /**
     * Apply a tritone color effect to the scene using three color parameters for shadows, midtones, and highlights.
     * A blending factor determines the mix between the original color and the tritone colors.
     *
     * @param shadowR - Shadow red component (0-255)
     * @param shadowG - Shadow green component (0-255)
     * @param shadowB - Shadow blue component (0-255)
     * @param midtoneR - Midtone red component (0-255)
     * @param midtoneG - Midtone green component (0-255)
     * @param midtoneB - Midtone blue component (0-255)
     * @param highlightR - Highlight red component (0-255)
     * @param highlightG - Highlight green component (0-255)
     * @param highlightB - Highlight blue component (0-255)
     * @param blend - Blend factor (0-255)
     * @returns The Scene instance for method chaining
     *
     * @example
     * ```typescript
     * const scene = new TVG.Scene();
     * scene.add(picture);
     * // Apply tritone: dark blue shadows, gray midtones, yellow highlights
     * scene.tritone(0, 0, 128, 128, 128, 128, 255, 255, 0, 128);
     * ```
     */
    tritone(shadowR: number, shadowG: number, shadowB: number, midtoneR: number, midtoneG: number, midtoneB: number, highlightR: number, highlightG: number, highlightB: number, blend: number): this;
}

/**
 * Load and render images and vector files
 * @category Picture
 */

/**
 * @category Picture
 */
interface LoadDataOptions {
    /** MIME type or format hint (e.g., 'svg', 'png', 'jpg', 'raw') */
    type?: MimeType;
    /** Width of raw image (required for type='raw') */
    width?: number;
    /** Height of raw image (required for type='raw') */
    height?: number;
    /** Color space of raw image (required for type='raw', default: ColorSpace.ARGB8888) */
    colorSpace?: ColorSpace;
}
/**
 * @category Picture
 */
interface PictureSize {
    width: number;
    height: number;
}
/**
 * Picture class for loading and displaying images and vector graphics
 * @category Picture
 *
 * @example
 * ```typescript
 * // Loading an SVG image
 * const picture = new TVG.Picture();
 *
 * fetch('/images/logo.svg')
 *   .then(res => res.text())
 *   .then(svgData => {
 *     picture.load(svgData, { type: 'svg' });
 *     const size = picture.size();
 *     picture.size(200, 200 * size.height / size.width); // Scale
 *     canvas.add(picture).render();
 *   });
 * ```
 *
 * @example
 * ```typescript
 * // Loading a Lottie animation as static image
 * const picture = new TVG.Picture();
 *
 * fetch('/animations/loading.json')
 *   .then(res => res.text())
 *   .then(lottieData => {
 *     picture.load(lottieData, { type: 'lottie' });
 *     picture.translate(400, 300);
 *     canvas.add(picture);
 *   });
 * ```
 */
declare class Picture extends Paint {
    constructor(ptr?: number, skipRegistry?: boolean);
    protected _createInstance(ptr: number): Picture;
    /**
     * Load picture from raw data (Uint8Array or string for SVG)
     * @param data - Raw image data as Uint8Array or SVG string
     * @param options - Load options including type hint
     */
    load(data: Uint8Array | string, options?: LoadDataOptions): this;
    /**
     * Set the size of the picture (scales it)
     * @param width - Target width
     * @param height - Target height
     */
    size(width: number, height: number): this;
    /**
     * Get the current size of the picture
     */
    size(): PictureSize;
}

/**
 * Render text with fonts and styling
 * @category Text
 */

/**
 * @category Text
 */
interface TextLayout {
    width: number;
    height?: number;
}
/**
 * @category Text
 */
interface TextOutline {
    width: number;
    color: readonly [number, number, number];
}
/**
 * Text rendering class with font support
 * @category Text
 *
 * @example
 * ```typescript
 * // Basic text rendering
 * const text = new TVG.Text();
 * text.font('Arial', 48)
 *     .text('Hello ThorVG!')
 *     .fill(50, 50, 50, 255)
 *     .translate(100, 200);
 *
 * canvas.add(text);
 * ```
 *
 * @example
 * ```typescript
 * // Text with custom font and styling
 * // Load custom font first
 * const fontData = await fetch('/fonts/custom.ttf').then(r => r.arrayBuffer());
 * TVG.Font.load('CustomFont', new Uint8Array(fontData));
 *
 * const text = new TVG.Text();
 * text.font('CustomFont', 64)
 *     .text('Custom Font')
 *     .fill(100, 150, 255, 255)
 *     .stroke(50, 50, 50, 255, 2);
 *
 * canvas.add(text);
 * ```
 *
 * @example
 * ```typescript
 * // Multi-line text with wrapping
 * const text = new TVG.Text();
 * text.font('Arial')
 *     .fontSize(24)
 *     .text('This is a long text that will wrap across multiple lines')
 *     .fill(50, 50, 50)
 *     .layout(300, 200)
 *     .wrap(TextWrapMode.Word);
 *
 * canvas.add(text);
 * ```
 */
declare class Text extends Paint {
    constructor(ptr?: number);
    protected _createInstance(ptr: number): Text;
    /**
     * Set the font to use for this text
     * @param name - Font name (previously loaded via Font.load()) or "default"
     */
    font(name: string): this;
    /**
     * Set the text content (UTF-8 supported)
     * @param content - Text content to display
     */
    text(content: string): this;
    /**
     * Set the font size
     * @param size - Font size in pixels
     */
    fontSize(size: number): this;
    /**
     * Set text color (RGB) or fill with gradient
     */
    fill(gradient: Fill): this;
    fill(r: number, g: number, b: number): this;
    /**
     * Set text alignment/anchor point
     * @param x - Horizontal alignment/anchor in [0..1]: 0=left/start, 0.5=center, 1=right/end (Default: 0)
     * @param y - Vertical alignment/anchor in [0..1]: 0=top, 0.5=middle, 1=bottom (Default: 0)
     */
    align(x: number, y: number): this;
    /**
     * Set text layout constraints (for wrapping)
     * @param width - Maximum width (0 = no constraint)
     * @param height - Maximum height (0 = no constraint)
     */
    layout(width: number, height?: number): this;
    /**
     * Set text wrap mode
     * @param mode - Wrap mode: TextWrapMode.None, TextWrapMode.Character, TextWrapMode.Word, TextWrapMode.Smart, or TextWrapMode.Ellipsis
     */
    wrap(mode: TextWrapMode): this;
    /**
     * Set text spacing (letter and line spacing)
     * @param letter - Letter spacing scale factor (1.0 = default, >1.0 = wider, <1.0 = narrower)
     * @param line - Line spacing scale factor (1.0 = default, >1.0 = wider, <1.0 = narrower)
     */
    spacing(letter: number, line: number): this;
    /**
     * Set italic style with shear factor
     * @param shear - Shear factor (0.0 = no italic, default: 0.18, typical range: 0.1-0.3)
     */
    italic(shear?: number): this;
    /**
     * Set text outline (stroke)
     * @param width - Outline width
     * @param r - Red (0-255)
     * @param g - Green (0-255)
     * @param b - Blue (0-255)
     */
    outline(width: number, r: number, g: number, b: number): this;
}

/**
 * Load and control Lottie animations
 * @category Animation
 */

/**
 * @category Animation
 */
interface AnimationInfo {
    totalFrames: number;
    duration: number;
    fps: number;
}
/**
 * @category Animation
 */
interface AnimationSegment {
    start: number;
    end: number;
}
/**
 * Animation controller for Lottie animations
 * The Animation owns a Picture internally and manages frame updates
 * @category Animation
 *
 * @example
 * ```typescript
 * // Loading and playing a Lottie animation
 * const animation = new TVG.Animation();
 *
 * fetch('/animations/loader.json')
 *   .then(res => res.text())
 *   .then(lottieData => {
 *     animation.load(lottieData);
 *     const picture = animation.picture();
 *
 *     // Center and scale animation
 *     const size = picture.size();
 *     picture.translate(400 - size.width / 2, 300 - size.height / 2);
 *
 *     canvas.add(picture);
 *     animation.play();
 *   });
 * ```
 *
 * @example
 * ```typescript
 * // Controlling animation playback
 * const animation = new TVG.Animation();
 * animation.load(lottieData);
 *
 * const info = animation.getInfo();
 * console.log(`Duration: ${info.duration}s, FPS: ${info.fps}`);
 *
 * // Play with custom loop and speed
 * animation.loop(true).play();
 *
 * // Pause after 2 seconds
 * setTimeout(() => animation.pause(), 2000);
 *
 * // Jump to specific frame
 * animation.frame(30).render();
 * ```
 *
 * @example
 * ```typescript
 * // Animation segments and callbacks
 * const animation = new TVG.Animation();
 * animation.load(lottieData);
 *
 * // Play specific segment
 * animation.segment({ start: 0, end: 60 });
 *
 * // Listen to frame updates
 * animation.onFrame((frame) => {
 *   console.log(`Current frame: ${frame}`);
 * });
 *
 * animation.play();
 * ```
 */
declare class Animation {
    #private;
    constructor();
    /**
     * Get the pointer (internal use)
     */
    get ptr(): number;
    /**
     * Get the Picture object that contains the animation content
     * The Picture is owned by the Animation and should not be manually disposed
     */
    get picture(): Picture | null;
    /**
     * Load Lottie animation from raw data
     * @param data - Lottie JSON data as Uint8Array or string
     */
    load(data: Uint8Array | string): this;
    /**
     * Get animation information (frames, duration, fps)
     */
    info(): AnimationInfo | null;
    /**
     * Get or set the current frame
     */
    frame(): number;
    frame(frameNumber: number): this;
    /**
     * Set animation segment/marker (for partial playback)
     * @param segment - Segment index (0-based)
     */
    segment(segment: number): this;
    /**
     * Play the animation
     * @param onFrame - Optional callback called on each frame update
     */
    play(onFrame?: (frame: number) => void): this;
    /**
     * Pause the animation
     */
    pause(): this;
    /**
     * Stop the animation and reset to frame 0
     */
    stop(): this;
    /**
     * Check if animation is currently playing
     */
    isPlaying(): boolean;
    /**
     * Set whether animation should loop
     */
    setLoop(loop: boolean): this;
    /**
     * Get loop status
     */
    getLoop(): boolean;
    /**
     * Seek to a specific time (in seconds)
     */
    seek(time: number): this;
    /**
     * Get current time (in seconds)
     */
    getCurrentTime(): number;
    /**
     * Dispose of the animation and free resources
     */
    dispose(): void;
}

/**
 * Linear gradient fill
 * @category Gradients
 */

/**
 * Linear gradient for filling shapes
 * @category Gradients
 *
 * @example
 * ```typescript
 * // Basic linear gradient
 * const gradient = new TVG.LinearGradient(100, 100, 300, 100);
 * gradient.addStop(0, [255, 0, 0, 255])    // Red
 *         .addStop(0.5, [255, 255, 0, 255]) // Yellow
 *         .addStop(1, [0, 255, 0, 255]);    // Green
 *
 * const shape = new TVG.Shape();
 * shape.appendRect(100, 100, 200, 100)
 *      .fillGradient(gradient);
 *
 * canvas.add(shape);
 * ```
 *
 * @example
 * ```typescript
 * // Vertical gradient with transparency
 * const gradient = new TVG.LinearGradient(200, 100, 200, 300);
 * gradient.addStop(0, [100, 150, 255, 255])
 *         .addStop(1, [100, 150, 255, 0])
 *         .spread(GradientSpread.Pad);
 *
 * const shape = new TVG.Shape();
 * shape.appendRect(150, 100, 100, 200)
 *      .fillGradient(gradient);
 *
 * canvas.add(shape);
 * ```
 */
declare class LinearGradient extends Fill {
    constructor(x1: number, y1: number, x2: number, y2: number);
    /**
     * Build the gradient (apply all color stops)
     * This should be called after all addStop() calls
     */
    build(): this;
}

/**
 * Radial gradient fill
 * @category Gradients
 */

/**
 * Radial gradient for filling shapes
 * @category Gradients
 *
 * @example
 * ```typescript
 * // Basic radial gradient
 * const gradient = new TVG.RadialGradient(200, 200, 100);
 * gradient.addStop(0, [255, 255, 255, 255])  // White center
 *         .addStop(1, [100, 100, 255, 255]);  // Blue edge
 *
 * const shape = new TVG.Shape();
 * shape.appendCircle(200, 200, 100)
 *      .fillGradient(gradient);
 *
 * canvas.add(shape);
 * ```
 *
 * @example
 * ```typescript
 * // Radial gradient with focal point
 * // Create gradient with offset focal point for lighting effect
 * const gradient = new TVG.RadialGradient(
 *   200, 200, 100,  // Center and radius
 *   170, 170, 0     // Focal point (offset)
 * );
 * gradient.addStop(0, [255, 255, 200, 255])
 *         .addStop(1, [255, 100, 100, 255]);
 *
 * const shape = new TVG.Shape();
 * shape.appendCircle(200, 200, 100)
 *      .fillGradient(gradient);
 *
 * canvas.add(shape);
 * ```
 */
declare class RadialGradient extends Fill {
    constructor(cx: number, cy: number, r: number, fx?: number, fy?: number, fr?: number);
    /**
     * Build the gradient (apply all color stops)
     * This should be called after all addStop() calls
     */
    build(): this;
}

/**
 * Load and manage fonts
 * @category Font
 */
/**
 * Supported font file types.
 * - `'ttf'`: TrueType Font
 * @category Font
 */
type FontType = 'ttf';
/**
 * @category Font
 */
interface LoadFontOptions {
    /** Font type ('ttf') */
    type?: FontType;
}
/**
 * Font loader class for managing custom fonts
 * Fonts are loaded globally and can be referenced by name in Text objects
 * @category Font
 *
 * @example
 * ```typescript
 * // Loading a custom font from URL
 * // Fetch and load custom font
 * const fontData = await fetch('/fonts/Roboto-Regular.ttf')
 *   .then(res => res.arrayBuffer());
 *
 * TVG.Font.load('Roboto', new Uint8Array(fontData), { type: 'ttf' });
 *
 * // Use the loaded font
 * const text = new TVG.Text();
 * text.font('Roboto', 48)
 *     .text('Hello with custom font!')
 *     .fill(50, 50, 50, 255);
 *
 * canvas.add(text);
 * ```
 *
 * @example
 * ```typescript
 * // Loading multiple fonts
 * async function loadFonts() {
 *   const fonts = [
 *     { name: 'Roboto-Regular', url: '/fonts/Roboto-Regular.ttf' },
 *     { name: 'Roboto-Bold', url: '/fonts/Roboto-Bold.ttf' }
 *   ];
 *
 *   for (const font of fonts) {
 *     const data = await fetch(font.url).then(r => r.arrayBuffer());
 *     TVG.Font.load(font.name, new Uint8Array(data));
 *   }
 * }
 *
 * await loadFonts();
 *
 * // Now use any loaded font
 * const text = new TVG.Text();
 * text.font('Roboto-Bold', 64).text('Bold Text');
 * ```
 */
declare class Font {
    /**
     * Load font from raw data (Uint8Array)
     * @param name - Unique name to identify this font
     * @param data - Raw font data
     * @param options - Load options
     */
    static load(name: string, data: Uint8Array, options?: LoadFontOptions): void;
    /**
     * Unload a previously loaded font
     * @param name - Font name to unload
     */
    static unload(name: string): void;
}

/**
 * ThorVG error result codes returned by native WASM operations.
 *
 * @category Error Handling
 */
declare enum ThorVGResultCode {
    Success = 0,
    InvalidArguments = 1,
    InsufficientCondition = 2,
    FailedAllocation = 3,
    MemoryCorruption = 4,
    NotSupported = 5,
    Unknown = 6
}
/**
 * Error class for ThorVG WASM operations.
 * Contains error code and operation information.
 *
 * @category Error Handling
 */
declare class ThorVGError extends Error {
    readonly code: ThorVGResultCode;
    readonly operation: string;
    constructor(message: string, code: ThorVGResultCode, operation: string);
    static fromCode(code: ThorVGResultCode, operation: string): ThorVGError;
}
/**
 * Context information provided when an error occurs.
 *
 * @category Error Handling
 */
interface ErrorContext {
    /** The operation that failed (e.g., 'moveTo', 'render', 'update') */
    operation: string;
}
/**
 * Error handler callback function.
 *
 * Handles both ThorVG WASM errors (ThorVGError) and JavaScript errors (Error).
 * Use instanceof to distinguish between error types.
 *
 * @category Error Handling
 *
 * @example
 * ```typescript
 * import { init } from '@thorvg/webcanvas';
 *
 * const TVG = await init({
 *   onError: (error, context) => {
 *     if (error instanceof ThorVGError) {
 *       // WASM error - has error.code
 *       console.log('WASM error code:', error.code);
 *     } else {
 *       // JavaScript error
 *       console.log('JS error:', error.message);
 *     }
 *   }
 * });
 * ```
 */
interface ErrorHandler {
    (error: Error, context: ErrorContext): void;
}

/**
 * ThorVG WebCanvas - TypeScript API for ThorVG
 *
 * @packageDocumentation
 *
 * A high-performance TypeScript Canvas API for ThorVG, providing an object-oriented
 * interface with fluent API pattern for vector graphics rendering using WebAssembly.
 *
 * ## Features
 *
 * - **Intuitive OOP API** - Fluent interface with method chaining
 * - **Type-Safe** - Full TypeScript support with strict typing
 * - **High Performance** - WebGPU, WebGL, and Software rendering backends
 * - **Automatic Memory Management** - FinalizationRegistry for garbage collection
 * - **Method Chaining** - Ergonomic fluent API design
 * - **Zero Overhead** - Direct WASM bindings with minimal abstraction
 * - **Animation Support** - Frame-based Lottie animation playback
 * - **Rich Primitives** - Shapes, scenes, pictures, text, and gradients
 *
 * @example
 * ```typescript
 * import ThorVG from '@thorvg/webcanvas';
 *
 * // Initialize ThorVG with renderer
 * const TVG = await ThorVG.init({
 *   locateFile: (path) => `/wasm/${path}`,
 *   renderer: 'gl'
 * });
 *
 * // Create canvas and draw
 * const canvas = new TVG.Canvas('#canvas', { width: 800, height: 600 });
 * const shape = new TVG.Shape();
 * shape.appendRect(100, 100, 200, 150)
 *      .fill(255, 0, 0, 255);
 * canvas.add(shape).render();
 * ```
 *
 * @module
 */

/**
 * @category Initialization
 */
interface InitOptions {
    /** Optional function to locate WASM files. If not provided, assumes WASM files are in the same directory as the JavaScript bundle. */
    locateFile?: (path: string) => string;
    /** Renderer type: 'sw' (Software), 'gl' (WebGL), or 'wg' (WebGPU). Default: 'gl'. WebGPU provides best performance but requires Chrome 113+ or Edge 113+. */
    renderer?: RendererType;
    /** Global error handler for all ThorVG operations. If provided, errors will be passed to this handler instead of being thrown. */
    onError?: ErrorHandler;
}
interface ThorVGNamespace {
    Canvas: typeof Canvas;
    Shape: typeof Shape;
    Scene: typeof Scene;
    Picture: typeof Picture;
    Text: typeof Text;
    Animation: typeof Animation;
    LinearGradient: typeof LinearGradient;
    RadialGradient: typeof RadialGradient;
    Font: typeof Font;
    BlendMethod: typeof BlendMethod;
    StrokeCap: typeof StrokeCap;
    StrokeJoin: typeof StrokeJoin;
    FillRule: typeof FillRule;
    GradientSpread: typeof GradientSpread;
    CompositeMethod: typeof CompositeMethod;
    MaskMethod: typeof MaskMethod;
    SceneEffect: typeof SceneEffect;
    TextWrapMode: typeof TextWrapMode;
    ColorSpace: typeof ColorSpace;
    term(): void;
}
/**
 * Get the currently configured renderer
 * @internal
 */
declare function getGlobalRenderer(): RendererType;
/**
 * Initialize ThorVG WASM module and rendering engine.
 *
 * This is the entry point for using ThorVG WebCanvas. It loads the WebAssembly module
 * and initializes the rendering engine with the specified backend (Software, WebGL, or WebGPU).
 *
 * @category Initialization
 * @param options - Initialization options
 * @param options.locateFile - Optional function to locate WASM files. If not provided, assumes
 *                              WASM files are in the same directory as the JavaScript bundle.
 * @param options.renderer - Renderer type: 'sw' (Software), 'gl' (WebGL), or 'wg' (WebGPU).
 *                           Default: 'gl'. WebGPU provides best performance but requires
 *                           Chrome 113+ or Edge 113+.
 *
 * @returns Promise that resolves to ThorVG namespace containing all classes and utilities
 *
 * @example
 * ```typescript
 * // Initialize with default WebGL renderer
 * const TVG = await ThorVG.init();
 * const canvas = new TVG.Canvas('#canvas');
 * ```
 *
 * @example
 * ```typescript
 * // Initialize with custom WASM file location
 * const TVG = await ThorVG.init({
 *   locateFile: (path) => `/public/wasm/${path}`,
 *   renderer: 'gl'
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Initialize with WebGPU for maximum performance
 * const TVG = await ThorVG.init({
 *   locateFile: (path) => '../dist/' + path.split('/').pop(),
 *   renderer: 'wg'
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Initialize with Software renderer for maximum compatibility
 * const TVG = await ThorVG.init({
 *   renderer: 'sw'
 * });
 * ```
 *
 * @throws {Error} If WASM module fails to load or engine initialization fails
 */
declare function init(options?: InitOptions): Promise<ThorVGNamespace>;
declare const ThorVG: {
    init: typeof init;
};

export { Animation, Canvas, Font, LinearGradient, Picture, RadialGradient, Scene, Shape, Text, ThorVGError, ThorVGResultCode, constants, ThorVG as default, getGlobalRenderer, init };
export type { AnimationInfo, AnimationSegment, Bounds, CanvasOptions, ColorStop, ErrorContext, ErrorHandler, FontType, InitOptions, LoadDataOptions, LoadFontOptions, Matrix, MimeType, PictureSize, RectOptions, RendererType, StrokeOptions, TextLayout, TextOutline, ThorVGNamespace };
