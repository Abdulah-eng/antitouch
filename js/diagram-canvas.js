/**
 * diagram-canvas.js
 * =================
 * Manages the interactive canvas for the shape diagram.
 * Stores placed shapes, renders them to an SVG, and handles drag/resize.
 */

'use strict';

const DiagramCanvas = (() => {

  let shapes = []; // { id, type, x, y, width, height, cx, cy, r, x1, y1, x2, y2, ... }
  let selectedId = null;

  let isDragging = false;
  let dragStartPos = null;
  let activeHandle = null; // 'move', 'nw', 'ne', 'sw', 'se', 'p1', 'p2'
  let snapshotShape = null; // Snapshot of the shape before move/resize

  const NS = "http://www.w3.org/2000/svg";
  let svgLayer = null;

  function init() {
    // Add SVG to #DiagramCanvas
    const container = document.getElementById('DiagramCanvas');
    if (!container) return;

    svgLayer = document.createElementNS(NS, 'svg');
    svgLayer.id = 'canvas-svg';
    svgLayer.style.width = '100%';
    svgLayer.style.height = '100%';
    svgLayer.style.position = 'absolute';
    svgLayer.style.top = '0';
    svgLayer.style.left = '0';
    svgLayer.style.pointerEvents = 'auto'; // allow interaction

    container.appendChild(svgLayer);

    // Event listeners
    document.addEventListener('libraryItemDroppedOnCanvas', onDrop);
    svgLayer.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    
    // Deselect if clicking empty space
    svgLayer.addEventListener('click', (e) => {
      if (e.target === svgLayer) {
        selectedId = null;
        render();
      }
    });

    render();
  }

  function onDrop(e) {
    const { payload, dropX, dropY } = e.detail;
    
    const newShape = {
      id: 'shape-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      type: payload.itemType
    };

    if (newShape.type === 'rectangle') {
      newShape.x = dropX - 50; newShape.y = dropY - 30;
      newShape.width = 100; newShape.height = 60;
    } else if (newShape.type === 'circle') {
      newShape.cx = dropX; newShape.cy = dropY;
      newShape.r = 40;
    } else if (newShape.type === 'line') {
      newShape.x1 = dropX - 40; newShape.y1 = dropY;
      newShape.x2 = dropX + 40; newShape.y2 = dropY;
    }

    // Find if dropped inside an existing container (rectangle)
    let parentId = null;
    for (const sh of shapes) {
      if (sh.type === 'rectangle' && sh.isContainer) {
        // Simple hit test for container
        if (dropX > sh.x && dropX < sh.x + sh.width && dropY > sh.y && dropY < sh.y + sh.height) {
          parentId = sh.id;
          break;
        }
      }
    }

    newShape.parentContainerId = parentId;
    if (newShape.type === 'rectangle') {
      newShape.paddingX = 10; // Default protection padding
      newShape.paddingY = 10;
      newShape.isContainer = true;
    }

    // Check collision before adding (if not contained)
    let valid = true;
    if (!parentId) {
      for (const sh of shapes) {
        if (Collision.checkCollision(newShape, sh)) {
          valid = false;
          break;
        }
      }
    }

    if (valid) {
      shapes.push(newShape);
      selectedId = newShape.id;
      
      // Hide empty state
      const emptyState = document.getElementById('canvas-empty-state');
      if (emptyState) emptyState.style.display = 'none';

      render();
    } else {
      console.log("Cannot place shape — collides at drop point!");
    }
  }

  function getShapeById(id) {
    return shapes.find(s => s.id === id);
  }

  function render() {
    if (!svgLayer) return;
    svgLayer.innerHTML = ''; // clear

    shapes.forEach(shape => {
      let el;
      let titleText = '';
      
      if (shape.type === 'rectangle') {
        el = document.createElementNS(NS, 'rect');
        el.setAttribute('x', shape.x);
        el.setAttribute('y', shape.y);
        el.setAttribute('width', Math.max(1, shape.width)); // no neg
        el.setAttribute('height', Math.max(1, shape.height));
        el.setAttribute('fill', '#fcd34d');
        el.setAttribute('stroke', '#d97706');
        el.setAttribute('stroke-width', '2');
        titleText = `Rectangle\nPosition: (${Math.round(shape.x)}, ${Math.round(shape.y)})\nSize: ${Math.round(shape.width)}x${Math.round(shape.height)}`;
      } else if (shape.type === 'circle') {
        el = document.createElementNS(NS, 'circle');
        el.setAttribute('cx', shape.cx);
        el.setAttribute('cy', shape.cy);
        el.setAttribute('r', Math.max(1, shape.r));
        el.setAttribute('fill', '#93c5fd');
        el.setAttribute('stroke', '#3b82f6');
        el.setAttribute('stroke-width', '2');
        titleText = `Circle\nCenter: (${Math.round(shape.cx)}, ${Math.round(shape.cy)})\nRadius: ${Math.round(shape.r)}`;
      } else if (shape.type === 'line') {
        el = document.createElementNS(NS, 'line');
        el.setAttribute('x1', shape.x1);
        el.setAttribute('y1', shape.y1);
        el.setAttribute('x2', shape.x2);
        el.setAttribute('y2', shape.y2);
        el.setAttribute('stroke', '#10b981');
        el.setAttribute('stroke-width', '4');
        el.setAttribute('stroke-linecap', 'round');
        const length = Math.sqrt((shape.x2 - shape.x1)**2 + (shape.y2 - shape.y1)**2);
        titleText = `Line\nStart: (${Math.round(shape.x1)}, ${Math.round(shape.y1)})\nEnd: (${Math.round(shape.x2)}, ${Math.round(shape.y2)})\nLength: ${Math.round(length)}`;
      }
      
      const titleNode = document.createElementNS(NS, 'title');
      titleNode.textContent = titleText;
      el.appendChild(titleNode);
      
      el.style.cursor = 'move';
      el.dataset.id = shape.id;
      el.dataset.handle = 'move';

      // Highlight selected
      if (shape.id === selectedId) {
        if (shape.type === 'rectangle' || shape.type === 'circle') {
          el.setAttribute('stroke', '#ef4444');
          el.setAttribute('stroke-width', '3');
          svgLayer.appendChild(el);
          _drawBoundingBoxHandles(shape);
        } else {
          el.setAttribute('stroke', '#ef4444');
          svgLayer.appendChild(el);
          _drawLineHandles(shape);
        }
      } else {
        svgLayer.appendChild(el);
      }
    });
  }

  function _createHandle(x, y, id, handleCode, cursor) {
    const h = document.createElementNS(NS, 'rect');
    h.setAttribute('x', x - 4);
    h.setAttribute('y', y - 4);
    h.setAttribute('width', 8);
    h.setAttribute('height', 8);
    h.setAttribute('fill', 'white');
    h.setAttribute('stroke', '#ef4444');
    h.setAttribute('stroke-width', '1.5');
    h.style.cursor = cursor;
    h.dataset.id = id;
    h.dataset.handle = handleCode;
    return h;
  }

  function _drawBoundingBoxHandles(shape) {
    let x, y, w, h;
    if (shape.type === 'rectangle') {
      x = shape.x; y = shape.y; w = shape.width; h = shape.height;
    } else {
      x = shape.cx - shape.r; y = shape.cy - shape.r;
      w = shape.r * 2; h = shape.r * 2;
    }

    svgLayer.appendChild(_createHandle(x, y, shape.id, 'nw', 'nwse-resize'));
    svgLayer.appendChild(_createHandle(x + w, y, shape.id, 'ne', 'nesw-resize'));
    svgLayer.appendChild(_createHandle(x, y + h, shape.id, 'sw', 'nesw-resize'));
    svgLayer.appendChild(_createHandle(x + w, y + h, shape.id, 'se', 'nwse-resize'));
  }

  function _drawLineHandles(shape) {
    svgLayer.appendChild(_createHandle(shape.x1, shape.y1, shape.id, 'p1', 'pointer'));
    svgLayer.appendChild(_createHandle(shape.x2, shape.y2, shape.id, 'p2', 'pointer'));
  }

  function getMouseCoords(e) {
    const rect = svgLayer.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  function onMouseDown(e) {
    const target = e.target;
    if (target.dataset && target.dataset.handle) {
      selectedId = target.dataset.id;
      activeHandle = target.dataset.handle;
      isDragging = true;
      dragStartPos = getMouseCoords(e);
      snapshotShape = JSON.parse(JSON.stringify(getShapeById(selectedId)));
      render();
      e.stopPropagation();
      e.preventDefault();
    }
  }

  function onMouseMove(e) {
    if (!isDragging || !selectedId) return;

    const coords = getMouseCoords(e);
    const dx = coords.x - dragStartPos.x;
    const dy = coords.y - dragStartPos.y;

    const shape = getShapeById(selectedId);
    if (!shape) return;

    // Apply move/resize relative to snapshot
    if (activeHandle === 'move') {
      let candidateX = snapshotShape.x + dx;
      let candidateY = snapshotShape.y + dy;

      if (shape.parentContainerId) {
        const parent = getShapeById(shape.parentContainerId);
        if (parent && shape.type === 'rectangle') {
          // Use Milestone 7 formulas
          const hw = shape.width / 2;
          const hh = shape.height / 2;
          const targetCX = candidateX + hw;
          const targetCY = candidateY + hh;

          // Recalculate Protection Padding is implicitly done by clamping logic variables
          const clamped = window.clampChildRectangleCenterWithinParent(
            targetCX, targetCY,
            parent.x, parent.x + parent.width, // ParentInner boundaries (assuming visible for now)
            parent.y + parent.height, parent.y, // SVG Y is inverted? Document says ParentInnerTopY > ParentInnerBottomY
            hw, hh,
            shape.paddingX, shape.paddingY
          );
          
          candidateX = clamped.ClampedChildCenterX - hw;
          candidateY = clamped.ClampedChildCenterY - hh;
        }
      }

      if (shape.type === 'rectangle') {
        shape.x = candidateX;
        shape.y = candidateY;
      } else if (shape.type === 'circle') {
        shape.cx = snapshotShape.cx + dx;
        shape.cy = snapshotShape.cy + dy;
      } else if (shape.type === 'line') {
        shape.x1 = snapshotShape.x1 + dx;
        shape.y1 = snapshotShape.y1 + dy;
        shape.x2 = snapshotShape.x2 + dx;
        shape.y2 = snapshotShape.y2 + dy;
      }
    } else {
      // Resize
      if (shape.type === 'line') {
        if (activeHandle === 'p1') { shape.x1 = coords.x; shape.y1 = coords.y; }
        if (activeHandle === 'p2') { shape.x2 = coords.x; shape.y2 = coords.y; }
      } else if (shape.type === 'circle') {
        // change radius based on distance from center
        const newR = Math.sqrt((coords.x - shape.cx)**2 + (coords.y - shape.cy)**2);
        shape.r = newR;
      } else if (shape.type === 'rectangle') {
        if (activeHandle === 'se') {
          shape.width = Math.max(5, snapshotShape.width + dx);
          shape.height = Math.max(5, snapshotShape.height + dy);
        } else if (activeHandle === 'nw') {
          const wOff = Math.min(snapshotShape.width - 5, dx);
          const hOff = Math.min(snapshotShape.height - 5, dy);
          shape.x = snapshotShape.x + wOff;
          shape.y = snapshotShape.y + hOff;
          shape.width = snapshotShape.width - wOff;
          shape.height = snapshotShape.height - hOff;
        } else if (activeHandle === 'ne') {
          const wOff = Math.max(-snapshotShape.width + 5, dx);
          const hOff = Math.min(snapshotShape.height - 5, dy);
          shape.width = snapshotShape.width + dx;
          shape.y = snapshotShape.y + hOff;
          shape.height = snapshotShape.height - hOff;
        } else if (activeHandle === 'sw') {
          const wOff = Math.min(snapshotShape.width - 5, dx);
          const hOff = Math.max(-snapshotShape.height + 5, dy);
          shape.x = snapshotShape.x + wOff;
          shape.width = snapshotShape.width - wOff;
          shape.height = snapshotShape.height + dy;
        }
      }
    }
    render();
  }

  function onMouseUp(e) {
    if (!isDragging) return;
    isDragging = false;
    
    // Verification: Collision Enforcement
    const movedShape = getShapeById(selectedId);
    if (!movedShape) return;

    let collides = false;
    for (const sh of shapes) {
      if (sh.id !== movedShape.id && Collision.checkCollision(movedShape, sh)) {
        collides = true;
        break;
      }
    }

    if (collides) {
      // Revert to snapshot
      Object.assign(movedShape, snapshotShape);
      console.log("Collision detected! Reverting to original position/size.");
    }

    render();
  }

  return { init };
})();

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    DiagramCanvas.init();
});
