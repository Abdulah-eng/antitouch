/**
 * debug-panel.js
 * ==============
 * Responsibility: Render live diagnostic information into #debug-panel.
 * Called after every canvas render cycle.
 *
 * BUG-03 fix: Removed all references to the deleted diagram.TestObject.
 * Now reads from CanvasState.getCanvas() and CanvasState.getShapes().
 *
 * Trigger:     Called by RenderCanvas.render() at the end of each frame
 * Input:       None (reads CanvasState directly)
 * Validation:  Panel element and canvas state must exist
 * Processing:  Formats canvas, viewport, and shape info as HTML rows
 * Output:      Updated innerHTML in #debug-panel
 * State Change: None — read-only diagnostic display
 * Error:        No-op if panel or canvas state is missing
 */

'use strict';

const DebugPanel = (() => {

  function update() {
    const panel = document.getElementById('debug-panel');
    if (!panel) return;

    const canvas  = CanvasState.getCanvas();
    const diagram = CanvasState.getActiveDiagram();
    if (!canvas || !diagram) return;

    const shapes  = CanvasState.getShapes();
    const shapeCount = shapes.length;

    // Get screen dimensions from SVG layer
    const svg = document.getElementById('canvas-svg');
    const sW  = svg ? svg.clientWidth  : 0;
    const sH  = svg ? svg.clientHeight : 0;

    // First shape world & screen position (if any exist)
    let firstShapeRows = '<div class="debug-row"><span class="debug-label">Shapes:</span><span class="debug-value">none</span></div>';
    if (shapes.length > 0) {
      const s    = shapes[0];
      const sPos = WorldToScreen.convert(s.WorldX, s.WorldY, sW, sH);
      firstShapeRows = `
        <div class="debug-row"><span class="debug-label">Shape[0] W:</span><span class="debug-value">(${s.WorldX.toFixed(1)}, ${s.WorldY.toFixed(1)})</span></div>
        <div class="debug-row"><span class="debug-label">Shape[0] S:</span><span class="debug-value">(${Math.round(sPos.x)}, ${Math.round(sPos.y)})</span></div>`;
    }

    panel.innerHTML = `
      <div class="debug-title">Diagram</div>
      <div class="debug-row"><span class="debug-label">ID:</span><span class="debug-value">${diagram.DiagramID.slice(-8)}</span></div>
      <div class="debug-row"><span class="debug-label">Name:</span><span class="debug-value">${diagram.DiagramName}</span></div>
      <div class="debug-row"><span class="debug-label">Version:</span><span class="debug-value">${diagram.DiagramVersion}</span></div>
      <div class="debug-row"><span class="debug-label">Shapes:</span><span class="debug-value">${shapeCount}</span></div>

      <div class="debug-title">Viewport (World)</div>
      <div class="debug-row"><span class="debug-label">Center X:</span><span class="debug-value">${canvas.ViewportCenterX.toFixed(2)}</span></div>
      <div class="debug-row"><span class="debug-label">Center Y:</span><span class="debug-value">${canvas.ViewportCenterY.toFixed(2)}</span></div>
      <div class="debug-row"><span class="debug-label">Zoom:</span><span class="debug-value">${(canvas.ZoomScale * 100).toFixed(0)}%</span></div>

      <div class="debug-title">Screen</div>
      <div class="debug-row"><span class="debug-label">Canvas W:</span><span class="debug-value">${sW}px</span></div>
      <div class="debug-row"><span class="debug-label">Canvas H:</span><span class="debug-value">${sH}px</span></div>

      <div class="debug-title">First Shape (World → Screen)</div>
      ${firstShapeRows}
    `;
  }

  return { update };

})();
