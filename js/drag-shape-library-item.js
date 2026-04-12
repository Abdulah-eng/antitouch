/**
 * drag-shape-library-item.js
 * ===========================
 * Responsibility: Handle mouse-based drag-start, drag move/preview,
 * and drag-end for DraggableShapeLibraryItem elements.
 * Uses mouse events (not HTML5 DnD API) for full visual control.
 * The source library item is NEVER removed — a new canvas instance
 * is created on drop (handled by canvas listener in render-shapes-panel.js).
 *
 * Phase Coverage: 1.3
 *
 * Contract Structure:
 *   Trigger / Input / Validation / Processing / Output /
 *   State Change / Next Possible Call / Error
 */

'use strict';

const DragShapeLibraryItem = (() => {

  const DRAG_THRESHOLD_PX = 5; // pixels of movement to count as a drag start

  let _isPointerDown    = false;
  let _startX           = 0;
  let _startY           = 0;
  let _activeDragItemEl = null;
  let _activePayload    = null;

  // ── Public API ────────────────────────────────────────────────

  /**
   * beginLibraryItemDrag
   * ─────────────────────
   * Trigger:     mousedown on DraggableShapeLibraryItem
   * Input:       event (MouseEvent), itemEl (HTMLElement — the clicked item)
   * Validation:  DragFromLibraryEnabled must be true;
   *              itemEl must have data-item-id and data-item-type
   * Processing:  Records start position; prepares payload; attaches move/up listeners
   * Output:      Drag session initialized
   * State Change: Sets _isPointerDown, _activeDragItemEl
   *              Full state update deferred until DRAG_THRESHOLD crossed
   * Next Call:   updateLibraryItemDragPreview (via _onMouseMove)
   * Error:       Cancel if item data is invalid
   */
  function beginLibraryItemDrag(event, itemEl) {
    if (!ShapesPanelState.get('DragFromLibraryEnabled')) return;
    if (!itemEl) return;

    const itemId     = itemEl.dataset.itemId;
    const itemType   = itemEl.dataset.itemType;
    const categoryId = itemEl.dataset.categoryId;

    if (!itemId || !itemType) {
      console.warn('[DragItem] beginLibraryItemDrag: item missing id or type — drag cancelled');
      return;
    }

    // Find the full item model from state
    const allItems = ShapesPanelState.get('VisibleShapeLibraryItems') || [];
    const item     = allItems.find(i => i.id === itemId);

    if (!item) {
      console.warn('[DragItem] beginLibraryItemDrag: item not found in state:', itemId);
      return;
    }

    _activePayload = ShapeLibraryDragPayload.buildLibraryItemDragPayload(item);
    if (!_activePayload) {
      console.warn('[DragItem] beginLibraryItemDrag: payload build failed — drag cancelled');
      return;
    }

    _isPointerDown    = true;
    _startX           = event.clientX;
    _startY           = event.clientY;
    _activeDragItemEl = itemEl;

    document.addEventListener('mousemove', _onMouseMove);
    document.addEventListener('mouseup',   endLibraryItemDrag);

    event.preventDefault(); // Prevent text selection
  }

  /**
   * updateLibraryItemDragPreview
   * ─────────────────────────────
   * Trigger:     mousemove during active drag (after threshold crossed)
   * Input:       x, y — screen coordinates of mouse position
   * Validation:  _activePayload must be set
   * Processing:  Builds ghost card on first call; positions ghost at cursor
   * Output:      Ghost element rendered and moved to (x, y)
   * State Change: DragPreviewVisible = true
   * Next Call:   endLibraryItemDrag (on mouseup)
   * Error:       No-op if ghost element not found in DOM
   */
  function updateLibraryItemDragPreview(x, y) {
    const ghost = document.getElementById('drag-preview-ghost');
    if (!ghost || !_activePayload) return;

    if (ghost.classList.contains('hidden')) {
      ghost.innerHTML = `
        <div class="drag-ghost-card">
          <div class="drag-ghost-icon">${_activePayload.svgIcon}</div>
          <span class="drag-ghost-label">${_escHtml(_activePayload.itemLabel)}</span>
        </div>`;
      ghost.classList.remove('hidden');
    }

    ghost.style.left = x + 'px';
    ghost.style.top  = y + 'px';
  }

  /**
   * endLibraryItemDrag
   * ───────────────────
   * Trigger:     mouseup anywhere after drag
   * Input:       MouseEvent
   * Validation:  _isPointerDown must be true
   * Processing:  Checks if drop is within DiagramCanvas bounds;
   *              if yes, hands off payload; hides ghost; resets state.
   *              Source library item is NOT removed — it stays in the panel.
   * Output:      handoffDragToCanvas (if dropped on canvas)
   * State Change: Resets all drag-related state fields to false/null
   * Next Call:   ShapeLibraryDragPayload.handoffDragToCanvas (if on canvas)
   * Error:       Fails safely — ghost hidden, drag state reset regardless
   */
  function endLibraryItemDrag(event) {
    if (!_isPointerDown) return;

    const wasDragging = ShapesPanelState.get('IsLibraryItemDragging');

    // ── Clean up visuals first (always, even on error) ─────────
    if (_activeDragItemEl) _activeDragItemEl.classList.remove('dragging');
    _hideGhost();
    _showCanvasDropIndicator(false);

    // ── Hand off if genuinely dragging ─────────────────────────
    if (wasDragging && _activePayload) {
      const canvas = document.getElementById('DiagramCanvas');
      if (canvas) {
        const rect     = canvas.getBoundingClientRect();
        const inCanvas =
          event.clientX >= rect.left && event.clientX <= rect.right &&
          event.clientY >= rect.top  && event.clientY <= rect.bottom;

        if (inCanvas) {
          const dropX = event.clientX - rect.left;
          const dropY = event.clientY - rect.top;
          ShapeLibraryDragPayload.handoffDragToCanvas(_activePayload, dropX, dropY);
          _updateStatus('Placed "' + _activePayload.itemLabel + '" on canvas');
        }
      }
    }

    // ── Reset all drag state ────────────────────────────────────
    ShapesPanelState.setState({
      IsLibraryItemDragging:  false,
      DraggedLibraryItemId:   null,
      DraggedLibraryItemType: null,
      DragPreviewVisible:     false,
    });

    _isPointerDown    = false;
    _activeDragItemEl = null;
    _activePayload    = null;

    document.removeEventListener('mousemove', _onMouseMove);
    document.removeEventListener('mouseup',   endLibraryItemDrag);
  }

  /**
   * attachDragListeners
   * ────────────────────
   * Trigger:     renderShapeLibraryItems (after grid rendered)
   * Input:       container — the ShapeLibraryItemsContainer element
   * Processing:  Queries all .DraggableShapeLibraryItem children;
   *              removes old listener before adding new to avoid duplicates
   * Output:      Each item is wired for mousedown → beginLibraryItemDrag
   */
  function attachDragListeners(container) {
    if (!container) return;
    const items = container.querySelectorAll('.DraggableShapeLibraryItem');
    items.forEach(itemEl => {
      itemEl.removeEventListener('mousedown', _onItemMouseDown);
      itemEl.addEventListener('mousedown', _onItemMouseDown);
    });
  }

  // ── Private helpers ───────────────────────────────────────────

  function _onItemMouseDown(event) {
    beginLibraryItemDrag(event, event.currentTarget);
  }

  function _onMouseMove(event) {
    if (!_isPointerDown || !_activeDragItemEl) return;

    const dx = Math.abs(event.clientX - _startX);
    const dy = Math.abs(event.clientY - _startY);

    if (!ShapesPanelState.get('IsLibraryItemDragging')) {
      if (dx > DRAG_THRESHOLD_PX || dy > DRAG_THRESHOLD_PX) {
        // Cross the threshold — officially start drag
        ShapesPanelState.setState({
          IsLibraryItemDragging:  true,
          DraggedLibraryItemId:   _activePayload ? _activePayload.itemId   : null,
          DraggedLibraryItemType: _activePayload ? _activePayload.itemType : null,
          DragPreviewVisible:     true,
        });
        _activeDragItemEl.classList.add('dragging');
        _showCanvasDropIndicator(true);
      }
    }

    if (ShapesPanelState.get('IsLibraryItemDragging')) {
      updateLibraryItemDragPreview(event.clientX, event.clientY);
    }
  }

  function _hideGhost() {
    const ghost = document.getElementById('drag-preview-ghost');
    if (ghost) {
      ghost.classList.add('hidden');
      ghost.innerHTML = '';
    }
  }

  function _showCanvasDropIndicator(show) {
    const indicator = document.getElementById('canvas-drop-indicator');
    if (indicator) indicator.classList.toggle('hidden', !show);
  }

  function _updateStatus(msg) {
    const el = document.getElementById('status-message');
    if (el) {
      el.textContent = msg;
      setTimeout(() => { if (el) el.textContent = 'Ready'; }, 3000);
    }
  }

  function _escHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );
  }

  return {
    beginLibraryItemDrag,
    updateLibraryItemDragPreview,
    endLibraryItemDrag,
    attachDragListeners,
  };

})();
