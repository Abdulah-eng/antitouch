/**
 * input-controller.js
 * ===================
 * Final Coordinator — Version M2.8 (Sanitized)
 */

'use strict';

const InputController = (() => {

  let container = null;
  let activeTool = 'select';

  function init() {
    // NUCLEAR FIX: New container ID to brick legacy logic
    container = document.getElementById('MainCanvasViewport');
    if (!container) return;

    container.addEventListener('mousedown', onMouseDown, { capture: true });
    window.addEventListener('mousemove', onMouseMove, { passive: false });
    window.addEventListener('mouseup',   onMouseUp);
    container.addEventListener('wheel',   onWheel, { passive: false });
    
    console.log('[InputController] Initialized — M2.8 Nuclear Stability');
  }

  function setTool(toolName) {
    activeTool = toolName || 'select';
    console.log('[InputController] Active Tool switched to:', activeTool);
  }

  function getTool() {
    return activeTool;
  }

  function onMouseDown(e) {
    if (e.button !== 0) return; // Left click only

    const path = e.composedPath();
    let handleEl = null;
    let shapeEl  = null;

    for (const el of path) {
      if (el.getAttribute) {
        const hCode = el.getAttribute('data-handle');
        const oId   = el.getAttribute('data-obj-id');
        if (!handleEl && hCode && hCode !== 'move') handleEl = el;
        if (!shapeEl && oId) shapeEl = el;
      }
      if (el.id === 'MainCanvasViewport') break;
    }

    // Connect Tool Logic Placeholder
    if (activeTool === 'connect') {
       console.log('[InputController] Connect tool active — logic placeholder');
       // In a later milestone, this will trigger line drawing
       return;
    }

    if (handleEl && shapeEl) {
      e.stopPropagation();
      e.preventDefault();
      
      const shapeId = shapeEl.dataset.objId;
      const handle  = handleEl.dataset.handle;
      
      console.log('[InputController] SELECTING HANDLE:', handle, 'on shape:', shapeId);
      CanvasState.selectShape(shapeId);
      DragHandler.onMouseDown(e, shapeId, handle);
      RenderCanvas.render();
      return; 
    }

    if (shapeEl) {
      e.stopPropagation();
      e.preventDefault();

      const shapeId = shapeEl.dataset.objId;
      console.log('[InputController] Shape hit:', shapeId);
      
      CanvasState.selectShape(shapeId);
      DragHandler.onMouseDown(e, shapeId, 'move');
      RenderCanvas.render();
      return;
    }

    // Background call
    CanvasState.selectShape(null);
    PanHandler.onMouseDown(e);
    RenderCanvas.render();
  }

  function onMouseMove(e) {
    if (DragHandler.isActive()) {
      e.preventDefault();
      DragHandler.onMouseMove(e);
      return;
    }

    if (PanHandler.isActive()) {
      PanHandler.onMouseMove(e);
      return;
    }
  }

  function onMouseUp(e) {
    DragHandler.onMouseUp(e);
    PanHandler.onMouseUp(e);
  }

  function onWheel(e) {
    ZoomHandler.onWheel(e);
  }

  function onKeyDown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.key === 'Delete' || e.key === 'Backspace') {
       const selected = CanvasState.getSelectedId();
       if (selected) {
         // ── Same child-containment guard as the context menu ──────────
         const allShapes = CanvasState.getShapes();
         const shapeToDelete = allShapes.find(s => s.ShapeID === selected);

         if (shapeToDelete) {
           // Primary: any shape whose ParentContainerID points to this shape
           const hasNamedChild = allShapes.some(child =>
             child.ShapeID !== shapeToDelete.ShapeID &&
             child.ParentContainerID === shapeToDelete.ShapeID
           );

           // Fallback: any non-root shape geometrically inside this shape's bounds
           let hasGeometricChild = false;
           if (!hasNamedChild && typeof ShapeCategories !== 'undefined') {
             const hw = shapeToDelete.Width / 2;
             const hh = shapeToDelete.Height / 2;
             hasGeometricChild = allShapes.some(child => {
               if (child.ShapeID === shapeToDelete.ShapeID) return false;
               const childDef = ShapeCategories.getItemByType(child.Type);
               if (!childDef || childDef.parentType === null || childDef.parentType === undefined) return false;
               return (
                 child.WorldX >= shapeToDelete.WorldX - hw &&
                 child.WorldX <= shapeToDelete.WorldX + hw &&
                 child.WorldY >= shapeToDelete.WorldY - hh &&
                 child.WorldY <= shapeToDelete.WorldY + hh
               );
             });
           }

           if (hasNamedChild || hasGeometricChild) {
             const def = typeof ShapeCategories !== 'undefined'
               ? ShapeCategories.getItemByType(shapeToDelete.Type)
               : null;
             const label = def ? def.label : 'This shape';
             alert(`Cannot delete "${label}" because it contains child resources. Please remove them first.`);
             return;
           }
         }

         CanvasState.removeShape(selected);
         CanvasState.selectShape(null);
         if (typeof HistoryManager !== 'undefined') HistoryManager.recordState();
         if (typeof DirtyTracker !== 'undefined') DirtyTracker.markDirty();
         RenderCanvas.render();
       }
    }
    
    if (e.ctrlKey && e.key.toLowerCase() === 'z') {
       e.preventDefault();
       if (e.shiftKey) {
           if (typeof HistoryManager !== 'undefined') HistoryManager.redo();
       } else {
           if (typeof HistoryManager !== 'undefined') HistoryManager.undo();
       }
    }
    
    if (e.ctrlKey && e.key.toLowerCase() === 'y') {
       e.preventDefault();
       if (typeof HistoryManager !== 'undefined') HistoryManager.redo();
    }
  }

  // Register keyboard events globally
  document.addEventListener('keydown', onKeyDown);

  return { init, setTool, getTool };

})();
