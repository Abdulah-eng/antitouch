/**
 * context-menu.js
 * ===============
 * Handles right-click interactions on the canvas.
 * Fix 6: Added "Delete Shape" context menu item.
 */

'use strict';

const ContextMenuController = (() => {

  function init() {
    const container = document.getElementById('MainCanvasViewport');
    if (!container) return;

    // Create DOM element for context menu
    const menuHtml = `
      <div id="app-context-menu" class="hidden">
        <div class="context-menu-item" id="ctx-edit-props">
          <svg viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          <span id="ctx-edit-props-label">Edit Properties</span>
        </div>
        <div class="context-menu-item" id="ctx-connect-to" style="display:none;">
          <svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <span>Connect To...</span>
        </div>
        <div class="context-menu-item context-menu-item--danger" id="ctx-delete-shape" style="display:none;">
          <svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <span>Delete Shape</span>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', menuHtml);

    const ctxMenu      = document.getElementById('app-context-menu');
    const btnEditProps = document.getElementById('ctx-edit-props');
    const btnConnect   = document.getElementById('ctx-connect-to');
    const btnDelete    = document.getElementById('ctx-delete-shape');
    const labelProps   = document.getElementById('ctx-edit-props-label');

    let _lastTargetShapeId = null;

    container.addEventListener('contextmenu', (e) => {
      e.preventDefault();

      // Determine if a shape was clicked
      const path = e.composedPath();
      let shapeEl = null;
      for (const el of path) {
        if (el.getAttribute && el.getAttribute('data-obj-id')) {
          shapeEl = el;
          break;
        }
        if (el.id === 'MainCanvasViewport') break;
      }

      if (shapeEl) {
        _lastTargetShapeId = shapeEl.dataset.objId;
        CanvasState.selectShape(_lastTargetShapeId);
        RenderCanvas.render();
        labelProps.textContent = 'Edit Shape Properties';
        btnConnect.style.display = 'flex';
        btnDelete.style.display = 'flex';
      } else {
        _lastTargetShapeId = null;
        CanvasState.selectShape(null);
        RenderCanvas.render();
        labelProps.textContent = 'Edit Canvas Properties';
        btnConnect.style.display = 'none';
        btnDelete.style.display = 'none';
      }

      // Position the menu
      ctxMenu.style.left = `${e.pageX}px`;
      ctxMenu.style.top  = `${e.pageY}px`;
      ctxMenu.classList.remove('hidden');
    });

    // Close menu on outside click or scroll
    document.addEventListener('pointerdown', (e) => {
      if (!ctxMenu.contains(e.target)) {
        ctxMenu.classList.add('hidden');
      }
    });

    // Edit Properties action
    btnEditProps.addEventListener('click', (e) => {
      e.stopPropagation();
      ctxMenu.classList.add('hidden');
      if (typeof PropertiesModal !== 'undefined') {
        if (_lastTargetShapeId) PropertiesModal.openForShape(_lastTargetShapeId);
        else                    PropertiesModal.openForCanvas();
      }
    });

    // Connect To action (M7)
    btnConnect.addEventListener('click', (e) => {
      e.stopPropagation();
      ctxMenu.classList.add('hidden');
      if (_lastTargetShapeId && typeof ConnectToMode !== 'undefined') {
        ConnectToMode.start(_lastTargetShapeId);
      }
    });

    // Delete Shape action (Fix 6)
    btnDelete.addEventListener('click', (e) => {
      e.stopPropagation();
      ctxMenu.classList.add('hidden');
      if (_lastTargetShapeId) {
        // ── Check if shape has dependent children ──
        const allShapes = CanvasState.getShapes();
        const shapeToDelete = allShapes.find(s => s.ShapeID === _lastTargetShapeId);
        
        if (shapeToDelete && typeof ShapeCategories !== 'undefined') {
          const hasChild = allShapes.some(child => {
            if (child.ShapeID === shapeToDelete.ShapeID) return false;
            
            const childDef = ShapeCategories.getItemByType(child.Type);
            if (!childDef || !childDef.parentType) return false;
            
            const allowedParents = Array.isArray(childDef.parentType) ? childDef.parentType : [childDef.parentType];
            if (!allowedParents.includes(shapeToDelete.Type)) return false;
            
            // Check containment
            const hw = shapeToDelete.Width / 2;
            const hh = shapeToDelete.Height / 2;
            const inside = (
              child.WorldX >= shapeToDelete.WorldX - hw && child.WorldX <= shapeToDelete.WorldX + hw &&
              child.WorldY >= shapeToDelete.WorldY - hh && child.WorldY <= shapeToDelete.WorldY + hh
            );
            return inside;
          });
          
          if (hasChild) {
            const def = ShapeCategories.getItemByType(shapeToDelete.Type);
            const label = def ? def.label : 'This shape';
            alert(`Cannot delete ${label} because it contains child resources. Please remove them first.`);
            return;
          }
        }

        CanvasState.removeShape(_lastTargetShapeId);
        CanvasState.selectShape(null);
        if (typeof HistoryManager  !== 'undefined') HistoryManager.recordState();
        if (typeof DirtyTracker    !== 'undefined') DirtyTracker.markDirty();
        RenderCanvas.render();
        _lastTargetShapeId = null;
      }
    });

    console.log('[ContextMenuController] Initialized.');
  }

  return { init };

})();

