/**
 * drop-handler_v2.js
 * ==================
 * Version M2.8 - Nuclear Stability Fix
 */

'use strict';

const DropHandler = (() => {

  console.log('[DropHandler] MODULE LOADED - Version M2.8');

  function init() {
    // BUG FIX: Only listen on window to avoid double-triggering across window/document buses
    window.addEventListener('libraryItemDroppedOnCanvas', onDrop);
  }

  function onDrop(e) {
    const { payload, dropX, dropY } = e.detail;

    // Target the new specialized container ID
    const container = document.getElementById('MainCanvasViewport');
    if (!container) return;
    
    const rect = container.getBoundingClientRect();

    // BUG-09 fix: clamp drop coordinates
    const safeX = Math.max(0, Math.min(dropX, rect.width));
    const safeY = Math.max(0, Math.min(dropY, rect.height));

    const worldPos = ScreenToWorld.convert(
      safeX,
      safeY,
      rect.width,
      rect.height
    );

    const isLine = payload.itemType.toLowerCase() === 'line';
    const isCircle = payload.itemType.toLowerCase() === 'circle';

    // Extract colors from SVG payload to maintain Milestone 1 colorful shapes
    let strokeColor = '#6366f1'; 
    let fillColor   = '#6366f1';
    
    const fillMatch = payload.svgIcon.match(/fill="([^"]+)"/);
    if (fillMatch && fillMatch[1] !== 'none' && fillMatch[1] !== 'currentColor') {
      fillColor = fillMatch[1];
    }
    
    const strokeMatch = payload.svgIcon.match(/stroke="([^"]+)"/);
    if (strokeMatch && strokeMatch[1] !== 'none' && strokeMatch[1] !== 'currentColor') {
      strokeColor = strokeMatch[1];
    }

    const newShape = {
      ShapeID: 'shape-' + Date.now(),
      DiagramID: CanvasState.getActiveDiagram()?.DiagramID ?? 'unsaved',
      Type: payload.itemType,
      Label: payload.itemLabel,
      WorldX: worldPos.x,
      WorldY: worldPos.y,
      Width:  isLine ? 80 : (isCircle ? 80 : 100),
      Height: isLine ? 0  : (isCircle ? 80 : 60),
      Color: fillColor, // Legacy field
      StrokeColor: strokeColor,
      FillColor: fillColor,
      SvgIcon: payload.svgIcon,
      ParentShapeId: null // M4 containment
    };

    // ── Milestone 4: Strict Hierarchy Validation ────────────────────────
    const lType = payload.itemLabel.toLowerCase();
    const shapes = CanvasState.getShapes();
    
    // AWS Hierarchy checks
    if (lType === 'vpc') {
      const parentRegion = shapes.find(s => s.Label.toLowerCase() === 'region');
      if (!parentRegion) {
        alert('Please drop VPC within a Region.');
        return;
      }
      newShape.ParentShapeId = parentRegion.ShapeID;
    } 
    else if (lType === 'availability zone') {
      const parentVpc = shapes.find(s => s.Label.toLowerCase() === 'vpc');
      if (!parentVpc) {
        alert('Please drop the availability zone within a VPC. If VPC is not created, please create before creating availability zone.');
        return;
      }
      newShape.ParentShapeId = parentVpc.ShapeID;
    }
    else if (lType === 'route table') {
      const parentAZ = shapes.find(s => s.Label.toLowerCase() === 'availability zone');
      const parentVpc = shapes.find(s => s.Label.toLowerCase() === 'vpc');
      if (!parentAZ && !parentVpc) {
        alert('Please drop the route table within a VPC or Availability Zone. If none exists, please create the required parent first.');
        return;
      }
      newShape.ParentShapeId = parentAZ ? parentAZ.ShapeID : parentVpc.ShapeID;
    }
    // ──────────────────────────────────────────────────────────────────

    CanvasState.addShape(newShape);
    
    // Record history snapshot after successful drop
    if (typeof HistoryManager !== 'undefined') HistoryManager.recordState();
    // Mark diagram as having unsaved changes
    if (typeof DirtyTracker   !== 'undefined') DirtyTracker.markDirty();
    
    RenderCanvas.render();
  }

  return { init };

})();
