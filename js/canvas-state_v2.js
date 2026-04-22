/**
 * canvas-state_v2.js
 * ==================
 * Version M2.1 — Single source of truth for the active diagram.
 *
 * BUG-18 fix: Added ViewportWidth, ViewportHeight to Canvas object.
 * BUG-20 fix: Added AxisOrientationZ, IsInfiniteX/Y/Z to Canvas object.
 * BUG-10 fix: Added updateDiagramMeta() for root-level diagram properties.
 */

'use strict';

const CanvasState = (() => {

  console.log('[CanvasState] MODULE LOADED - Version M2.1');

  let activeDiagram = null;
  let selectedShapeId = null;

  // ──────────────────────────────────────────────────────────────
  /**
   * initializeCanvasState
   * ─────────────────────
   * Trigger:     Application startup (main_v2.js), JSON/DB diagram reload
   * Input:       Optional config object — can be flat or contain nested Canvas:{}
   * Validation:  Falls back to CanvasConfig defaults for any missing field
   * Processing:  Constructs the full in-memory activeDiagram model
   * Output:      true on success
   * State Change: Replaces activeDiagram entirely
   * Next Call:   RenderCanvas.init() / RenderCanvas.render()
   * Error:       Returns false; caller must abort rendering
   */
  function initializeCanvasState(config = {}) {
    try {
      // Support both flat config (legacy) and nested { Canvas: {...} } (JSON reload)
      const c = config.Canvas || config;

      selectedShapeId = null; // Reset selection on init

      activeDiagram = {
        DiagramID:      config.DiagramID      || 'diagram-' + Date.now(),
        DiagramName:    config.DiagramName    || 'Untitled Diagram',
        DiagramVersion: config.DiagramVersion || 1,

        Canvas: {
          CanvasID:   c.CanvasID   || 'canvas-' + Date.now(),
          CanvasName: c.CanvasName || CanvasConfig.DEFAULT_CANVAS_NAME,

          BackgroundColor:      c.BackgroundColor      || CanvasConfig.DEFAULT_BACKGROUND_COLOR,
          CoordinateSystemType: c.CoordinateSystemType || CanvasConfig.COORDINATE_SYSTEM,
          OriginDefinition:     c.OriginDefinition     || CanvasConfig.ORIGIN_DEFINITION,

          // Axis orientations (BUG-20: AxisOrientationZ was missing)
          AxisOrientationX: c.AxisOrientationX || CanvasConfig.AXIS_ORIENTATION_X,
          AxisOrientationY: c.AxisOrientationY || CanvasConfig.AXIS_ORIENTATION_Y,
          AxisOrientationZ: c.AxisOrientationZ || CanvasConfig.AXIS_ORIENTATION_Z,

          // Infinite canvas flags (BUG-20: all three were missing)
          IsInfiniteX: c.IsInfiniteX !== undefined ? c.IsInfiniteX : true,
          IsInfiniteY: c.IsInfiniteY !== undefined ? c.IsInfiniteY : true,
          IsInfiniteZ: c.IsInfiniteZ !== undefined ? c.IsInfiniteZ : true,

          // Viewport
          ViewportCenterX: c.ViewportCenterX !== undefined ? c.ViewportCenterX : 0,
          ViewportCenterY: c.ViewportCenterY !== undefined ? c.ViewportCenterY : 0,
          // BUG-18: ViewportWidth and ViewportHeight were missing from state
          ViewportWidth:   c.ViewportWidth  || CanvasConfig.DEFAULT_VIEWPORT_WIDTH,
          ViewportHeight:  c.ViewportHeight || CanvasConfig.DEFAULT_VIEWPORT_HEIGHT,

          ZoomScale: c.ZoomScale || 1.0,

          // Grid
          GridVisible:  c.GridVisible  !== undefined ? c.GridVisible  : true,
          GridColor:    c.GridColor    || CanvasConfig.DEFAULT_GRID_COLOR,
          GridSpacingX: c.GridSpacingX || CanvasConfig.DEFAULT_GRID_SPACING,
          GridSpacingY: c.GridSpacingY || CanvasConfig.DEFAULT_GRID_SPACING,

          // Visibility flags
          ShowOriginMarker: c.ShowOriginMarker !== undefined ? c.ShowOriginMarker : true,
          ShowAxes:         c.ShowAxes         !== undefined ? c.ShowAxes         : true,

          // Interaction flags
          PanEnabled:  c.PanEnabled  !== undefined ? c.PanEnabled  : true,
          ZoomEnabled: c.ZoomEnabled !== undefined ? c.ZoomEnabled : true,
        },

        // Shapes collection — loaded from JSON/DB or start empty
        Shapes: config.Shapes || []
      };

      console.log('[CanvasState] State Initialized — Shapes:', activeDiagram.Shapes.length);
      return true;

    } catch (err) {
      console.error('[CanvasState] initializeCanvasState failed:', err);
      return false;
    }
  }

  // ── Getters ───────────────────────────────────────────────────
  function getActiveDiagram() { return activeDiagram; }
  function getCanvas()        { return activeDiagram ? activeDiagram.Canvas : null; }
  function getShapes()        { return activeDiagram ? activeDiagram.Shapes : []; }
  function getSelectedId()    { return selectedShapeId; }

  // ── Shape mutations ───────────────────────────────────────────
  function selectShape(id) {
    selectedShapeId = id;
  }

  function addShape(shape) {
    if (!activeDiagram) return;
    console.log('[CanvasState] Adding shape:', shape.Label);
    activeDiagram.Shapes.push(shape);
  }

  function updateShape(shapeId, changes) {
    if (!activeDiagram) return;
    const shape = activeDiagram.Shapes.find(s => s.ShapeID === shapeId);
    if (shape) Object.assign(shape, changes);
  }

  function removeShape(shapeId) {
    if (!activeDiagram) return;
    activeDiagram.Shapes = activeDiagram.Shapes.filter(s => s.ShapeID !== shapeId);
  }

  function clearShapes() {
    if (activeDiagram) activeDiagram.Shapes = [];
  }

  // ── Canvas mutations ─────────────────────────────────────────
  /**
   * updateCanvas
   * ─────────────
   * Merges changes into activeDiagram.Canvas (viewport, colors, flags, etc.)
   */
  function updateCanvas(changes) {
    if (!activeDiagram) return;
    Object.assign(activeDiagram.Canvas, changes);
  }

  /**
   * updateDiagramMeta
   * ─────────────────
   * BUG-10 fix: Updates root-level diagram properties (DiagramID, DiagramName,
   * DiagramVersion). These live on activeDiagram, NOT on activeDiagram.Canvas.
   * Using updateCanvas() for these silently did nothing.
   *
   * Trigger:     After a successful DB save returns a new version/ID from the server
   * Input:       changes object — keys must be DiagramID | DiagramName | DiagramVersion
   * Output:      Root diagram fields updated in memory
   */
  function updateDiagramMeta(changes) {
    if (!activeDiagram) return;
    const allowed = ['DiagramID', 'DiagramName', 'DiagramVersion'];
    allowed.forEach(key => {
      if (changes[key] !== undefined) activeDiagram[key] = changes[key];
    });
  }

  // ── Public API ────────────────────────────────────────────────
  return {
    initializeCanvasState,
    getActiveDiagram,
    getCanvas,
    getShapes,
    getSelectedId,
    selectShape,
    addShape,
    updateShape,
    removeShape,
    clearShapes,
    updateCanvas,
    updateDiagramMeta,   // BUG-10 fix
  };

})();
