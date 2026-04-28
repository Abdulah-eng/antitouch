/**
 * drag-handler_v2.js
 * ==================
 * Version M2.8 - Nuclear Stability Fix
 */

'use strict';

const DragHandler = (() => {

  console.log('[DragHandler] MODULE LOADED - Version M2.8');

  let _isDragging = false;
  let _hasMoved = false;
  let _activeHandle = 'move';
  let _draggedShapeId = null;
  
  let _dragStartWorldPos = null;
  let _shapeSnapshot = null;

  function onMouseDown(e, shapeId, handle = 'move') {
    const container = document.getElementById('MainCanvasViewport');
    const rect = container.getBoundingClientRect();

    _draggedShapeId = shapeId;
    _isDragging = true;
    _hasMoved = false;
    _activeHandle = handle;

    _dragStartWorldPos = ScreenToWorld.convert(
      e.clientX - rect.left,
      e.clientY - rect.top,
      rect.width,
      rect.height
    );
    
    _shapeSnapshot = CanvasState.getShapes().find(s => s.ShapeID === shapeId);
    if (_shapeSnapshot) {
      _shapeSnapshot = JSON.parse(JSON.stringify(_shapeSnapshot));
    }

    document.body.style.cursor = _getCursorForHandle(handle);
  }

  function onMouseMove(e) {
    if (!_isDragging || !_draggedShapeId || !_shapeSnapshot) return;

    const container = document.getElementById('MainCanvasViewport');
    const rect = container.getBoundingClientRect();

    const currentWorldPos = ScreenToWorld.convert(
      e.clientX - rect.left,
      e.clientY - rect.top,
      rect.width,
      rect.height
    );

    const dx = Math.round((currentWorldPos.x - _dragStartWorldPos.x) * 100) / 100;
    const dy = Math.round((currentWorldPos.y - _dragStartWorldPos.y) * 100) / 100;

    const type = (_shapeSnapshot.Type || 'rectangle').toLowerCase();
    const changes = {};

    if (_activeHandle === 'move') {
      changes.WorldX = _shapeSnapshot.WorldX + dx;
      changes.WorldY = _shapeSnapshot.WorldY + dy;
    } else {
      // HANDLE-SPECIFIC RESIZE MATH
      if (type === 'line') {
        const hw = _shapeSnapshot.Width / 2;
        const hh = _shapeSnapshot.Height / 2;
        const sP1X = _shapeSnapshot.WorldX - hw;
        const sP1Y = _shapeSnapshot.WorldY + hh;
        const sP2X = _shapeSnapshot.WorldX + hw;
        const sP2Y = _shapeSnapshot.WorldY - hh;
        if (_activeHandle === 'p1') {
          const nP1X = sP1X + dx; const nP1Y = sP1Y + dy;
          changes.WorldX = (nP1X + sP2X) / 2; changes.WorldY = (nP1Y + sP2Y) / 2;
          changes.Width  = sP2X - nP1X;        changes.Height = nP1Y - sP2Y;
        } else if (_activeHandle === 'p2') {
          const nP2X = sP2X + dx; const nP2Y = sP2Y + dy;
          changes.WorldX = (sP1X + nP2X) / 2; changes.WorldY = (sP1Y + nP2Y) / 2;
          changes.Width  = nP2X - sP1X;        changes.Height = sP1Y - nP2Y;
        }
      } else if (type === 'circle' || type === 'ellipse') {
        const dist = Math.sqrt(
          (currentWorldPos.x - _shapeSnapshot.WorldX) ** 2 +
          (currentWorldPos.y - _shapeSnapshot.WorldY) ** 2
        );
        changes.Width  = dist * 2;
        changes.Height = dist * 2;
      } else {
        // Rectangle — 8 handles (M5: added N / S / E / W edge midpoints)
        const sw = _shapeSnapshot.Width,  sh = _shapeSnapshot.Height;
        const sx = _shapeSnapshot.WorldX, sy = _shapeSnapshot.WorldY;
        // Screen-to-World vertical parity: screen DOWN = World dy < 0
        switch (_activeHandle) {
          case 'se': changes.Width = Math.max(10, sw+dx); changes.Height = Math.max(10, sh-dy); changes.WorldX = sx+dx/2; changes.WorldY = sy+dy/2; break;
          case 'nw': changes.Width = Math.max(10, sw-dx); changes.Height = Math.max(10, sh+dy); changes.WorldX = sx+dx/2; changes.WorldY = sy+dy/2; break;
          case 'ne': changes.Width = Math.max(10, sw+dx); changes.Height = Math.max(10, sh+dy); changes.WorldX = sx+dx/2; changes.WorldY = sy+dy/2; break;
          case 'sw': changes.Width = Math.max(10, sw-dx); changes.Height = Math.max(10, sh-dy); changes.WorldX = sx+dx/2; changes.WorldY = sy+dy/2; break;
          case 'n':  changes.Height = Math.max(10, sh+dy); changes.WorldY = sy+dy/2; break;
          case 's':  changes.Height = Math.max(10, sh-dy); changes.WorldY = sy+dy/2; break;
          case 'e':  changes.Width  = Math.max(10, sw+dx); changes.WorldX = sx+dx/2; break;
          case 'w':  changes.Width  = Math.max(10, sw-dx); changes.WorldX = sx+dx/2; break;
        }
      }
    }

    _hasMoved = true;
    CanvasState.updateShape(_draggedShapeId, changes);
    RenderCanvas.render();
  }

  function onMouseUp() {
    if (!_isDragging) return;

    // ── STRICT COLLISION REJECTION ──────────────────────────────
    const finalShape = CanvasState.getShapes().find(s => s.ShapeID === _draggedShapeId);
    if (finalShape && _shapeSnapshot) {
      let collided = false;
      const allShapes = CanvasState.getShapes();
      
      for (const other of allShapes) {
        if (other.ShapeID === _draggedShapeId) continue;
        
        if (Collision.checkCollision(_obj(finalShape), _obj(other))) {
          collided = true;
          break;
        }
      }

      if (collided) {
        console.warn('[DragHandler] REJECTED overlap - Snapping back');
        CanvasState.updateShape(_draggedShapeId, {
          WorldX: _shapeSnapshot.WorldX,
          WorldY: _shapeSnapshot.WorldY,
          Width:  _shapeSnapshot.Width,
          Height: _shapeSnapshot.Height
        });
        RenderCanvas.render();
      } else if (_hasMoved) {
        // Successful, non-colliding move -> Record state, mark dirty, save valid center
        CanvasState.updateShape(_draggedShapeId, {
          PreviousValidCenterX: finalShape.WorldX,
          PreviousValidCenterY: finalShape.WorldY,
        });
        if (typeof HistoryManager !== 'undefined') HistoryManager.recordState();
        if (typeof DirtyTracker   !== 'undefined') DirtyTracker.markDirty();
      }
    }

    _isDragging = false;
    _hasMoved = false;
    _draggedShapeId = null;
    _shapeSnapshot = null;
    document.body.style.cursor = 'default';
  }

  function _obj(s) {
    const t = (s.Type || 'rectangle').toLowerCase();
    if (t === 'rectangle') return { type: 'rectangle', x: s.WorldX - s.Width/2, y: s.WorldY - s.Height/2, width: s.Width, height: s.Height };
    if (t === 'circle' || t === 'ellipse') return { type: 'circle', cx: s.WorldX, cy: s.WorldY, r: s.Width / 2 };
    if (t === 'line') return { 
      type: 'line', 
      x1: s.WorldX - s.Width/2, 
      y1: s.WorldY - s.Height/2, 
      x2: s.WorldX + s.Width/2, 
      y2: s.WorldY + s.Height/2 
    };
    return s;
  }

  function _getCursorForHandle(h) {
    if (h === 'nw' || h === 'se') return 'nwse-resize';
    if (h === 'ne' || h === 'sw') return 'nesw-resize';
    if (h === 'n'  || h === 's')  return 'ns-resize';
    if (h === 'e'  || h === 'w')  return 'ew-resize';
    if (h === 'p1' || h === 'p2') return 'crosshair';
    return 'move';
  }

  function isActive() { return _isDragging; }

  return { onMouseDown, onMouseMove, onMouseUp, isActive };

})();
