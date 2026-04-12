/**
 * shape-library-drag-payload.js
 * ==============================
 * Responsibility: Build the typed drag payload object when a
 * DraggableShapeLibraryItem begins a drag, and dispatch the
 * handoff event to the canvas on drop.
 * No DOM access beyond event dispatching. Pure data builder.
 *
 * Phase Coverage: 1.3
 *
 * Contract Structure:
 *   Trigger / Input / Validation / Processing / Output /
 *   State Change / Next Possible Call / Error
 */

'use strict';

const ShapeLibraryDragPayload = (() => {

  /**
   * buildLibraryItemDragPayload
   * ───────────────────────────
   * Trigger:     beginLibraryItemDrag (after drag threshold crossed)
   * Input:       item — ShapeLibraryItemModel { id, type, label, categoryId, svgIcon }
   * Validation:  item must be non-null, must have id and type
   * Processing:  Constructs a typed, timestamped payload object
   * Output:      DragPayload object
   * State Change: none — pure builder
   * Next Call:   updateLibraryItemDragPreview, handoffDragToCanvas
   * Error:       Returns null; caller must cancel the drag
   */
  function buildLibraryItemDragPayload(item) {
    if (!item || typeof item !== 'object') {
      console.warn('[DragPayload] buildLibraryItemDragPayload: item is null or not an object');
      return null;
    }
    if (!item.id || !item.type) {
      console.warn('[DragPayload] buildLibraryItemDragPayload: item missing id or type', item);
      return null;
    }

    return {
      sourceType:    'ShapeLibrary',        // Origin type for canvas handler
      itemId:        item.id,
      itemType:      item.type,
      itemLabel:     item.label || '',
      categoryId:    item.categoryId || '',
      originLibrary: 'ShapesPanel',
      svgIcon:       item.svgIcon || '',
      timestamp:     Date.now(),
    };
  }

  /**
   * handoffDragToCanvas
   * ───────────────────
   * Trigger:     endLibraryItemDrag — when mouse is released over DiagramCanvas
   * Input:       payload (DragPayload), dropX (number), dropY (number)
   * Validation:  payload must be non-null; dropX/dropY should be in-canvas coords
   * Processing:  Creates and dispatches 'libraryItemDroppedOnCanvas' CustomEvent
   * Output:      Custom event fired on document — DiagramCanvas listens for it
   * State Change: none — handoff only
   * Next Call:   DiagramCanvas.handleLibraryItemDrop (future Milestone 2)
   * Error:       Logs warning and returns false if payload is null; caller fails safely
   */
  function handoffDragToCanvas(payload, dropX, dropY) {
    if (!payload) {
      console.warn('[DragPayload] handoffDragToCanvas: null payload, handoff cancelled');
      return false;
    }

    const event = new CustomEvent('libraryItemDroppedOnCanvas', {
      bubbles:    true,
      cancelable: false,
      detail: { payload, dropX, dropY },
    });

    document.dispatchEvent(event);
    console.log('[DragPayload] Canvas handoff dispatched:', payload.itemType,
                `@ (${Math.round(dropX)}, ${Math.round(dropY)})`);
    return true;
  }

  return {
    buildLibraryItemDragPayload,
    handoffDragToCanvas,
  };

})();
