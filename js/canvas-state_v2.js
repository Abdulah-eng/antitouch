/**
 * canvas-state_v2.js
 * ==================
 * Version M3.0 — Single source of truth for the active diagram.
 *
 * BUG-18 fix: Added ViewportWidth, ViewportHeight to Canvas object.
 * BUG-20 fix: Added AxisOrientationZ, IsInfiniteX/Y/Z to Canvas object.
 * BUG-10 fix: Added updateDiagramMeta() for root-level diagram properties.
 * M3     fix: Added GlobalVars (Rectangle + Circle) with padding + color defaults.
 */

'use strict';

const CanvasState = (() => {

  console.log('[CanvasState] MODULE LOADED - Version M3.0');

  let activeDiagram   = null;
  let selectedShapeId = null;

  // ──────────────────────────────────────────────────────────────
  /**
   * initializeCanvasState
   * ─────────────────────
   * Trigger:     Application startup (main_v2.js), JSON/DB diagram reload
   * Input:       Optional config — flat or nested Canvas:{}
   * Output:      true on success
   * State Change: Replaces activeDiagram entirely
   */
  function initializeCanvasState(config = {}) {
    try {
      const c  = config.Canvas || config;
      const gv = config.GlobalVars || {};

      selectedShapeId = null;

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

          AxisOrientationX: c.AxisOrientationX || CanvasConfig.AXIS_ORIENTATION_X,
          AxisOrientationY: c.AxisOrientationY || CanvasConfig.AXIS_ORIENTATION_Y,
          AxisOrientationZ: c.AxisOrientationZ || CanvasConfig.AXIS_ORIENTATION_Z,

          IsInfiniteX: c.IsInfiniteX !== undefined ? c.IsInfiniteX : true,
          IsInfiniteY: c.IsInfiniteY !== undefined ? c.IsInfiniteY : true,
          IsInfiniteZ: c.IsInfiniteZ !== undefined ? c.IsInfiniteZ : true,

          ViewportCenterX: c.ViewportCenterX !== undefined ? c.ViewportCenterX : 0,
          ViewportCenterY: c.ViewportCenterY !== undefined ? c.ViewportCenterY : 0,
          ViewportWidth:   c.ViewportWidth  || CanvasConfig.DEFAULT_VIEWPORT_WIDTH,
          ViewportHeight:  c.ViewportHeight || CanvasConfig.DEFAULT_VIEWPORT_HEIGHT,

          ZoomScale: c.ZoomScale || 1.0,

          GridVisible:  c.GridVisible  !== undefined ? c.GridVisible  : true,
          GridColor:    c.GridColor    || CanvasConfig.DEFAULT_GRID_COLOR,
          GridSpacingX: c.GridSpacingX || CanvasConfig.DEFAULT_GRID_SPACING,
          GridSpacingY: c.GridSpacingY || CanvasConfig.DEFAULT_GRID_SPACING,

          ShowOriginMarker: c.ShowOriginMarker !== undefined ? c.ShowOriginMarker : true,
          ShowAxes:         c.ShowAxes         !== undefined ? c.ShowAxes         : true,

          PanEnabled:  c.PanEnabled  !== undefined ? c.PanEnabled  : true,
          ZoomEnabled: c.ZoomEnabled !== undefined ? c.ZoomEnabled : true,
        },

        Shapes: config.Shapes || [],

        // ── M3: Global Variables for shape types ────────────────────
        GlobalVars: {
          Rectangle: {
            DefaultFillColor:         gv.Rectangle?.DefaultFillColor         || '#6366f1',
            DefaultStrokeColor:       gv.Rectangle?.DefaultStrokeColor       || '#6366f1',
            ControlPointColorDefault: gv.Rectangle?.ControlPointColorDefault || '#ffffff',
            ControlPointColorActive:  gv.Rectangle?.ControlPointColorActive  || '#f59e0b',
            HoverPaddingXRatio:       gv.Rectangle?.HoverPaddingXRatio       ?? 0.10,
            HoverPaddingYRatio:       gv.Rectangle?.HoverPaddingYRatio       ?? 0.10,
            ProtectionPaddingXRatio:  gv.Rectangle?.ProtectionPaddingXRatio  ?? 0.20,
            ProtectionPaddingYRatio:  gv.Rectangle?.ProtectionPaddingYRatio  ?? 0.20,
          },
          Circle: {
            DefaultFillColor:             gv.Circle?.DefaultFillColor             || '#10b981',
            DefaultStrokeColor:           gv.Circle?.DefaultStrokeColor           || '#10b981',
            ControlPointColorDefault:     gv.Circle?.ControlPointColorDefault     || '#ffffff',
            ControlPointColorActive:      gv.Circle?.ControlPointColorActive      || '#f59e0b',
            HoverPaddingRadiusRatio:      gv.Circle?.HoverPaddingRadiusRatio      ?? 0.10,
            ProtectionPaddingRadiusRatio: gv.Circle?.ProtectionPaddingRadiusRatio ?? 0.20,
          },
        },
      };

      console.log('[CanvasState] State Initialized — Shapes:', activeDiagram.Shapes.length);
      return true;

    } catch (err) {
      console.error('[CanvasState] initializeCanvasState failed:', err);
      return false;
    }
  }

  // ── Getters ─────────────────────────────────────────────────────
  function getActiveDiagram() { return activeDiagram; }
  function getCanvas()        { return activeDiagram ? activeDiagram.Canvas     : null; }
  function getShapes()        { return activeDiagram ? activeDiagram.Shapes     : []; }
  function getSelectedId()    { return selectedShapeId; }
  function getGlobalVars()    { return activeDiagram ? activeDiagram.GlobalVars : {}; }

  // ── Shape mutations ─────────────────────────────────────────────
  function selectShape(id) { selectedShapeId = id; }

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

  // ── Canvas mutations ────────────────────────────────────────────
  /**
   * updateCanvas
   * Merges changes into activeDiagram.Canvas (viewport, colors, flags, etc.)
   */
  function updateCanvas(changes) {
    if (!activeDiagram) return;
    Object.assign(activeDiagram.Canvas, changes);
  }

  /**
   * updateGlobalVars  (M3)
   * ──────────────────────
   * Merges shape-type global variable changes into activeDiagram.GlobalVars.
   * Accepts: { Rectangle: {...} } and/or { Circle: {...} }
   * Validation is done in PropertiesModal before calling this function.
   */
  function updateGlobalVars(changes) {
    if (!activeDiagram) return;
    if (!activeDiagram.GlobalVars) activeDiagram.GlobalVars = {};
    if (changes.Rectangle) {
      if (!activeDiagram.GlobalVars.Rectangle) activeDiagram.GlobalVars.Rectangle = {};
      Object.assign(activeDiagram.GlobalVars.Rectangle, changes.Rectangle);
    }
    if (changes.Circle) {
      if (!activeDiagram.GlobalVars.Circle) activeDiagram.GlobalVars.Circle = {};
      Object.assign(activeDiagram.GlobalVars.Circle, changes.Circle);
    }
  }

  /**
   * updateDiagramMeta  (BUG-10 fix)
   * ─────────────────────────────────
   * Updates root-level diagram properties (DiagramID, DiagramName, DiagramVersion).
   * These live on activeDiagram, NOT on activeDiagram.Canvas.
   */
  function updateDiagramMeta(changes) {
    if (!activeDiagram) return;
    const allowed = ['DiagramID', 'DiagramName', 'DiagramVersion'];
    allowed.forEach(key => {
      if (changes[key] !== undefined) activeDiagram[key] = changes[key];
    });
  }

  // ── Public API ───────────────────────────────────────────────────
  return {
    initializeCanvasState,
    getActiveDiagram,
    getCanvas,
    getShapes,
    getSelectedId,
    getGlobalVars,
    selectShape,
    addShape,
    updateShape,
    removeShape,
    clearShapes,
    updateCanvas,
    updateGlobalVars,
    updateDiagramMeta,
  };

})();
