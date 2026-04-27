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
        <div class="context-menu-item context-menu-item--danger" id="ctx-delete-shape" style="display:none;">
          <svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
          <span>Delete Shape</span>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', menuHtml);

    const ctxMenu      = document.getElementById('app-context-menu');
    const btnEditProps = document.getElementById('ctx-edit-props');
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
        btnDelete.style.display = 'flex';
      } else {
        _lastTargetShapeId = null;
        CanvasState.selectShape(null);
        RenderCanvas.render();
        labelProps.textContent = 'Edit Canvas Properties';
        btnDelete.style.display = 'none';
      }

      // Position the menu
      ctxMenu.style.left = `${e.pageX}px`;
      ctxMenu.style.top  = `${e.pageY}px`;
      ctxMenu.classList.remove('hidden');
    });

    // Close menu on outside click or scroll
    document.addEventListener('click', () => ctxMenu.classList.add('hidden'));

    // Edit Properties action
    btnEditProps.addEventListener('click', (e) => {
      e.stopPropagation();
      ctxMenu.classList.add('hidden');
      if (typeof PropertiesModal !== 'undefined') {
        if (_lastTargetShapeId) PropertiesModal.openForShape(_lastTargetShapeId);
        else                    PropertiesModal.openForCanvas();
      }
    });

    // Delete Shape action (Fix 6)
    btnDelete.addEventListener('click', (e) => {
      e.stopPropagation();
      ctxMenu.classList.add('hidden');
      if (_lastTargetShapeId) {
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

