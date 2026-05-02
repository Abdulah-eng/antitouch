/**
 * canvas-state_v2.js
 * ==================
 * Version M3.0 — Single source of truth for the active diagram.
 *
 * M3.0: Added GlobalVars store for Rectangle and Circle shape defaults.
 *       getGlobalVars() / updateGlobalVar() / hoverShape() / getHoveredId() added.
 * BUG-18 fix: Added ViewportWidth, ViewportHeight.
 * BUG-20 fix: Added AxisOrientationZ, IsInfiniteX/Y/Z.
 * BUG-10 fix: Added updateDiagramMeta() for root-level diagram properties.
 */

'use strict';

const CanvasState = (() => {

  console.log('[CanvasState] MODULE LOADED - Version M3.0');

  let activeDiagram   = null;
  let selectedShapeId = null;
  let hoveredShapeId  = null;

  // ── Global Variables (per shape-type defaults) ────────────────────────────
  const _globalVars = {
    rectangle: {
      defaultFillColor:               '#6366f1',
      defaultStrokeColor:             '#6366f1',
      hoverPaddingRatio:              0.05,   // 5% of min(w,h)
      protectionPaddingRatio:         0.10,   // must remain > hoverPaddingRatio
      resizeControlPointDefaultColor: 'transparent',
      resizeControlPointHoverColor:   '#ffffff',
    },
    circle: {
      defaultFillColor:               '#6366f1',
      defaultStrokeColor:             '#6366f1',
      hoverPaddingRatio:              0.05,
      protectionPaddingRatio:         0.10,
      resizeControlPointDefaultColor: 'transparent',
      resizeControlPointHoverColor:   '#ffffff',
    },
  };

  function getGlobalVars() { return _globalVars; }

  function updateGlobalVar(type, changes) {
    if (!_globalVars[type]) return;
    // Strict rule: ProtectionPaddingRatio must always be > HoverPaddingRatio
    if (changes.hoverPaddingRatio !== undefined && changes.protectionPaddingRatio !== undefined) {
      if (changes.protectionPaddingRatio <= changes.hoverPaddingRatio) {
        console.warn('[CanvasState] updateGlobalVar rejected: ProtectionPaddingRatio must be > HoverPaddingRatio');
        return;
      }
    }
    Object.assign(_globalVars[type], changes);
    console.log(`[CanvasState] GlobalVar [${type}] updated:`, _globalVars[type]);
  }

  // ──────────────────────────────────────────────────────────────
  /**
   * initializeCanvasState
   * ─────────────────────
   * Trigger:     App startup, JSON/DB reload
   * Input:       Optional config — flat or { Canvas:{...} }
   * Output:      true on success
   */
  function initializeCanvasState(config = {}) {
    try {
      const c = config.Canvas || config;
      selectedShapeId = null;
      hoveredShapeId  = null;

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
          ViewportWidth:   c.ViewportWidth   || CanvasConfig.DEFAULT_VIEWPORT_WIDTH,
          ViewportHeight:  c.ViewportHeight  || CanvasConfig.DEFAULT_VIEWPORT_HEIGHT,

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
        Connections: config.Connections || []
      };

      console.log(`[CanvasState] State Initialized — Shapes: ${activeDiagram.Shapes.length}, Connections: ${activeDiagram.Connections.length}`);
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
  function getHoveredId()     { return hoveredShapeId; }

  // ── Shape mutations ───────────────────────────────────────────
  function selectShape(id) { selectedShapeId = id; }
  function hoverShape(id)  { hoveredShapeId  = id; }

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
  function updateCanvas(changes) {
    if (!activeDiagram) return;
    Object.assign(activeDiagram.Canvas, changes);
  }

  /**
   * updateDiagramMeta — BUG-10 fix
   * Updates root-level diagram properties (DiagramID, DiagramName, DiagramVersion).
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
    getHoveredId,
    getGlobalVars,
    updateGlobalVar,
    selectShape,
    hoverShape,
    addShape,
    updateShape,
    removeShape,
    clearShapes,
    updateCanvas,
    updateDiagramMeta,
  };

})();
