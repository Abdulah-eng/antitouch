/**
 * hover-state.js
 * ==============
 * Milestone 5 — Rectangle Interaction Engine (Hover Band Detection)
 *
 * Tracks which shape (if any) is currently hovered in world space.
 * The "hover band" is the area within (HoverPaddingXRatio * Width/2) of the
 * shape's boundary — i.e. the shape itself PLUS a thin outer ring.
 *
 * Fires on every mousemove via InputController and updates CanvasState.
 * Re-renders if hover state changed (avoids redundant renders).
 *
 * World-space authority: ALL geometry is computed in world coords.
 * Screen-space is only used for the initial mouse → world conversion.
 */

'use strict';

const HoverState = (() => {

  let _hoveredShapeId = null;

  /**
   * onMouseMove
   * ──────────────
   * Called by InputController on every canvas mousemove.
   * @param {MouseEvent} e
   * @param {number}     containerWidth   - SVG viewport width in px
   * @param {number}     containerHeight  - SVG viewport height in px
   */
  function onMouseMove(e, containerWidth, containerHeight) {
    // Skip during active drag — DragHandler owns the cursor then
    if (typeof DragHandler !== 'undefined' && DragHandler.isActive()) return;

    const container = document.getElementById('MainCanvasViewport');
    if (!container) return;
    const rect = container.getBoundingClientRect();

    // Convert screen position to world position
    const worldPos = ScreenToWorld.convert(
      e.clientX - rect.left,
      e.clientY - rect.top,
      rect.width,
      rect.height
    );

    const shapes    = CanvasState.getShapes();
    const globalVars = CanvasState.getGlobalVars();
    let   newHover  = null;

    // Iterate in reverse paint order (topmost shape gets priority)
    for (let i = shapes.length - 1; i >= 0; i--) {
      const shape = shapes[i];
      const type  = (shape.Type || 'rectangle').toLowerCase();

      if (type === 'rectangle' || type === 'rect') {
        const gv  = globalVars.Rectangle || {};
        const hpx = (gv.HoverPaddingXRatio ?? 0.10) * shape.Width  / 2;
        const hpy = (gv.HoverPaddingYRatio ?? 0.10) * shape.Height / 2;

        const halfW = shape.Width  / 2 + hpx;
        const halfH = shape.Height / 2 + hpy;

        if (
          worldPos.x >= shape.WorldX - halfW && worldPos.x <= shape.WorldX + halfW &&
          worldPos.y >= shape.WorldY - halfH && worldPos.y <= shape.WorldY + halfH
        ) {
          newHover = shape.ShapeID;
          break;
        }

      } else if (type === 'circle' || type === 'ellipse') {
        const gv = globalVars.Circle || {};
        const hpr = (gv.HoverPaddingRadiusRatio ?? 0.10);
        const r  = (shape.Width / 2) * (1 + hpr);

        const dx = worldPos.x - shape.WorldX;
        const dy = worldPos.y - shape.WorldY;
        if (dx * dx + dy * dy <= r * r) {
          newHover = shape.ShapeID;
          break;
        }
      }
    }

    if (newHover !== _hoveredShapeId) {
      _hoveredShapeId = newHover;
      // Re-render so handles/outlines react
      if (typeof RenderCanvas !== 'undefined') RenderCanvas.render();
    }
  }

  function getHoveredId() { return _hoveredShapeId; }

  function clear() {
    const changed = _hoveredShapeId !== null;
    _hoveredShapeId = null;
    if (changed && typeof RenderCanvas !== 'undefined') RenderCanvas.render();
  }

  return { onMouseMove, getHoveredId, clear };

})();
