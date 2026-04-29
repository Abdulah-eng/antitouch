/**
 * drop-handler_v2.js
 * ==================
 * Version M4.0 — Cloud Shape Library + Parent Drop Validation
 *
 * M4.0 changes:
 *   - Calls ParentDropValidator.validate() before creating any shape.
 *   - Uses item definition (defaultWidth, defaultHeight, fillColor, strokeColor)
 *     from ShapeCategories for precise sizing per shape type.
 *   - Blocks placeholder "Coming Soon" items from being placed.
 *   - Shows user-friendly toast/alert on validation failure.
 */

'use strict';

const DropHandler = (() => {

  console.log('[DropHandler] MODULE LOADED - Version M4.0');

  function init() {
    window.addEventListener('libraryItemDroppedOnCanvas', onDrop);
  }

  function onDrop(e) {
    const { payload, dropX, dropY } = e.detail;

    const container = document.getElementById('MainCanvasViewport');
    if (!container) return;

    const rect  = container.getBoundingClientRect();
    const safeX = Math.max(0, Math.min(dropX, rect.width));
    const safeY = Math.max(0, Math.min(dropY, rect.height));

    const worldPos = ScreenToWorld.convert(safeX, safeY, rect.width, rect.height);

    // ── M4: Retrieve full item definition from ShapeCategories ────
    const itemDef = (typeof ShapeCategories !== 'undefined')
      ? ShapeCategories.getItemByType(payload.itemType)
      : null;

    // ── M4: Parent-hierarchy validation ───────────────────────────
    if (typeof ParentDropValidator !== 'undefined' && itemDef) {
      const result = ParentDropValidator.validate(itemDef, worldPos.x, worldPos.y);
      if (!result.ok) {
        _showDropError(result.reason);
        return;  // Block the drop
      }
    }

    // ── Determine shape dimensions ────────────────────────────────
    const typeLC  = payload.itemType.toLowerCase();
    const isLine  = typeLC === 'line';
    const isCircle= typeLC === 'circle' || typeLC === 'ellipse';

    const w = itemDef?.defaultWidth  ?? (isLine ? 80 : isCircle ? 80 : 100);
    const h = itemDef?.defaultHeight ?? (isLine ? 0  : isCircle ? 80 : 60);

    // ── Determine colors ──────────────────────────────────────────
    // Prefer itemDef colours; fall back to SVG attribute extraction
    let strokeColor = itemDef?.strokeColor ?? '#6366f1';
    let fillColor   = itemDef?.fillColor   ?? '#6366f1';

    if (!itemDef?.strokeColor && !itemDef?.fillColor) {
      const fillMatch   = payload.svgIcon.match(/fill="([^"]+)"/);
      const strokeMatch = payload.svgIcon.match(/stroke="([^"]+)"/);
      if (fillMatch   && fillMatch[1]   !== 'none' && fillMatch[1]   !== 'currentColor') fillColor   = fillMatch[1];
      if (strokeMatch && strokeMatch[1] !== 'none' && strokeMatch[1] !== 'currentColor') strokeColor = strokeMatch[1];
    }

    // ── Build shape object ────────────────────────────────────────
    const newShape = {
      ShapeID:     'shape-' + Date.now(),
      DiagramID:   CanvasState.getActiveDiagram()?.DiagramID ?? 'unsaved',
      Type:        payload.itemType,
      Label:       payload.itemLabel,
      WorldX:      worldPos.x,
      WorldY:      worldPos.y,
      Width:       w,
      Height:      h,
      Color:       fillColor,
      StrokeColor: strokeColor,
      FillColor:   fillColor,
      SvgIcon:     payload.svgIcon,
    };

    // ── Collision Check before drop ───────────────────────────────
    if (typeof Collision !== 'undefined') {
      const allShapes = CanvasState.getShapes();
      const dropObj = _obj(newShape);
      let collided = false;
      
      for (const other of allShapes) {
        if (Collision.checkCollision(dropObj, _obj(other))) {
          collided = true;
          break;
        }
      }
      
      if (collided) {
        _showDropError("Shapes cannot overlap boundaries.");
        return; // Block drop
      }
    }

    CanvasState.addShape(newShape);
    if (typeof HistoryManager !== 'undefined') HistoryManager.recordState();
    if (typeof DirtyTracker   !== 'undefined') DirtyTracker.markDirty();
    RenderCanvas.render();
  }

  // ── Error feedback ────────────────────────────────────────────────────────

  /**
   * _showDropError
   * Shows a temporary on-canvas toast message explaining why a drop was blocked.
   * Falls back to console.warn if the toast container is unavailable.
   */
  function _showDropError(message) {
    console.warn('[DropHandler] Drop blocked:', message);

    // Remove any existing toast
    const old = document.getElementById('drop-error-toast');
    if (old) old.remove();

    const toast = document.createElement('div');
    toast.id        = 'drop-error-toast';
    toast.className = 'drop-error-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Auto-dismiss after 10 seconds
    setTimeout(() => toast.remove(), 10000);
  }

  function _obj(s) {
    const t = (s.Type || 'rectangle').toLowerCase();
    if (t === 'rectangle' || t.startsWith('aws-') || t === 'database' || t === 'service') {
      return { type: 'rectangle', x: s.WorldX - s.Width/2, y: s.WorldY - s.Height/2, width: s.Width, height: s.Height };
    }
    if (t === 'circle' || t === 'ellipse') {
      return { type: 'circle', cx: s.WorldX, cy: s.WorldY, r: s.Width / 2 };
    }
    if (t === 'line') {
      return { 
        type: 'line', 
        x1: s.WorldX - s.Width/2, 
        y1: s.WorldY - s.Height/2, 
        x2: s.WorldX + s.Width/2, 
        y2: s.WorldY + s.Height/2 
      };
    }
    return { type: 'rectangle', x: s.WorldX - s.Width/2, y: s.WorldY - s.Height/2, width: s.Width, height: s.Height };
  }

  return { init };

})();
