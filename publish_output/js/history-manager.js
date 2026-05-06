/**
 * history-manager.js
 * ==================
 * Version M2.3 — Snapshot-based Undo/Redo Engine
 */

'use strict';

const HistoryManager = (() => {

  const MAX_HISTORY = 50;
  let undoStack = [];
  let redoStack = [];

  function init() {
    clear();
    console.log('[HistoryManager] Initialized.');
  }

  function clear() {
    undoStack = [];
    redoStack = [];
    updateButtons();
  }

  function recordState() {
    const shapes = CanvasState.getShapes();
    // Deep clone to prevent reference leaking
    const snapshot = JSON.parse(JSON.stringify(shapes));

    undoStack.push(snapshot);
    if (undoStack.length > MAX_HISTORY) {
      undoStack.shift();
    }
    
    // Any new explicit action drops the future
    redoStack = []; 
    updateButtons();
  }

  function undo() {
    // Need at least genesis state + 1 action
    if (undoStack.length <= 1) return;

    // Pop current state to Redo
    const current = undoStack.pop();
    redoStack.push(current);

    // Apply the previous state
    const previous = undoStack[undoStack.length - 1];
    _applySnapshot(previous);
  }

  function redo() {
    if (redoStack.length === 0) return;

    const next = redoStack.pop();
    undoStack.push(next);
    _applySnapshot(next);
  }

  function _applySnapshot(snapshotData) {
    CanvasState.clearShapes();
    const clone = JSON.parse(JSON.stringify(snapshotData));
    clone.forEach(s => CanvasState.addShape(s));

    // Clear UI active selection if the shape was deleted in history
    const selected = CanvasState.getSelectedId();
    if (selected && !clone.find(s => s.ShapeID === selected)) {
      CanvasState.selectShape(null);
    }

    RenderCanvas.render();
    updateButtons();
  }

  function updateButtons() {
    const btnUndo = document.getElementById('btn-undo');
    const btnRedo = document.getElementById('btn-redo');
    if (btnUndo) {
        btnUndo.disabled = undoStack.length <= 1;
        btnUndo.style.opacity = undoStack.length <= 1 ? '0.5' : '1';
        btnUndo.style.cursor = undoStack.length <= 1 ? 'not-allowed' : 'pointer';
    }
    if (btnRedo) {
        btnRedo.disabled = redoStack.length === 0;
        btnRedo.style.opacity = redoStack.length === 0 ? '0.5' : '1';
        btnRedo.style.cursor = redoStack.length === 0 ? 'not-allowed' : 'pointer';
    }
  }

  return { init, recordState, undo, redo, clear };

})();
