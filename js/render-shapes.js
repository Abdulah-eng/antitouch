/**
 * render-shapes.js
 * ================
 * Version M2.8 - Nuclear Stability Fix
 *
 * M2.8 FINAL STABILITY FIX:
 * - Nested SVG Icons: Replaced <foreignObject> with native <svg> nesting to fix Chrome rendering artifacts.
 * - Selection Handles: Standard red squares for all shapes including endpoints (P1/P2) for lines.
 */

'use strict';

const RenderShapes = (() => {

  const NS = 'http://www.w3.org/2000/svg';

  function render(svg, canvas, width, height) {
    const shapes = CanvasState.getShapes();
    const zoom   = canvas.ZoomScale;
    const selectedId = CanvasState.getSelectedId();

    shapes.forEach(shape => {
      const pos = WorldToScreen.convert(shape.WorldX, shape.WorldY, width, height);
      const isSelected = (shape.ShapeID === selectedId);
      const g = _buildShapeGroup(shape, pos, zoom, isSelected);
      svg.appendChild(g);
    });
  }

  function _buildShapeGroup(shape, pos, zoom, isSelected) {
    const g = document.createElementNS(NS, 'g');
    g.id            = shape.ShapeID;
    g.style.cursor  = 'move';
    g.dataset.objId = shape.ShapeID;

    const type = (shape.Type || 'rectangle').toLowerCase();

    // 1. Geometry
    switch (type) {
      case 'line':
        _renderLine(g, shape, pos, zoom, isSelected);
        break;
      case 'circle':
      case 'ellipse':
        _renderCircle(g, shape, pos, zoom, isSelected);
        break;
      default:
        _renderRect(g, shape, pos, zoom, isSelected);
    }

    // 2. Icon (Nested SVG)
    if (shape.SvgIcon) {
      _renderIcon(g, shape, pos, zoom);
    }

    // 3. Selection Handles (Interaction Parity)
    if (isSelected) {
      _renderHandles(g, shape, pos, zoom, type);
    }

    // 4. Label
    _renderLabel(g, shape, pos, zoom, type);

    return g;
  }

  function _renderRect(g, shape, pos, zoom, isSelected) {
    const w = shape.Width  * zoom;
    const h = shape.Height * zoom;
    const rect = document.createElementNS(NS, 'rect');
    rect.setAttribute('x',            pos.x - w / 2);
    rect.setAttribute('y',            pos.y - h / 2);
    rect.setAttribute('width',        w);
    rect.setAttribute('height',       h);
    rect.setAttribute('fill',         shape.FillColor || shape.Color || '#6366f1');
    rect.setAttribute('fill-opacity', '1.0');
    // FLAT/FRAMELESS: Razor sharp corners (Explicit 0)
    rect.setAttribute('rx',           0);
    rect.setAttribute('ry',           0);
    rect.setAttribute('stroke',       shape.StrokeColor || shape.Color || '#6366f1');
    rect.setAttribute('stroke-width', 1.5 * zoom);
    g.appendChild(rect);

    if (isSelected) {
      const outline = document.createElementNS(NS, 'rect');
      outline.setAttribute('x',      pos.x - w / 2 - 2);
      outline.setAttribute('y',      pos.y - h / 2 - 2);
      outline.setAttribute('width',  w + 4);
      outline.setAttribute('height', h + 4);
      outline.setAttribute('fill',   'none');
      outline.setAttribute('stroke', '#3b82f6');
      outline.setAttribute('stroke-width', 2 * zoom);
      outline.setAttribute('stroke-dasharray', '5 3');
      g.appendChild(outline);
    }
  }

  function _renderCircle(g, shape, pos, zoom, isSelected) {
    const rx = (shape.Width  / 2) * zoom;
    const ry = (shape.Height / 2) * zoom;
    const el = document.createElementNS(NS, 'ellipse');
    el.setAttribute('cx',           pos.x);
    el.setAttribute('cy',           pos.y);
    el.setAttribute('rx',           rx);
    el.setAttribute('ry',           ry);
    el.setAttribute('fill',         shape.FillColor || shape.Color || '#6366f1');
    el.setAttribute('fill-opacity', '1.0');
    el.setAttribute('stroke',       shape.StrokeColor || shape.Color || '#6366f1');
    el.setAttribute('stroke-width', 1.5 * zoom);
    g.appendChild(el);

    if (isSelected) {
      const outline = document.createElementNS(NS, 'ellipse');
      outline.setAttribute('cx',     pos.x);
      outline.setAttribute('cy',     pos.y);
      outline.setAttribute('rx',     rx + 2);
      outline.setAttribute('ry',     ry + 2);
      outline.setAttribute('fill',   'none');
      outline.setAttribute('stroke', '#ef4444');
      outline.setAttribute('stroke-width', 1.5 * zoom);
      outline.setAttribute('stroke-dasharray', '4 2');
      g.appendChild(outline);
    }
  }

  function _renderLine(g, shape, pos, zoom, isSelected) {
    const hw = (shape.Width / 2) * zoom;
    const hh = (shape.Height / 2) * zoom; // Use height as Y-delta

    const line = document.createElementNS(NS, 'line');
    line.setAttribute('x1',           pos.x - hw);
    line.setAttribute('y1',           pos.y - hh);
    line.setAttribute('x2',           pos.x + hw);
    line.setAttribute('y2',           pos.y + hh);
    line.setAttribute('stroke',       shape.StrokeColor || shape.Color || '#10b981');
    line.setAttribute('stroke-width', 2.5 * zoom);
    line.setAttribute('stroke-linecap', 'round');
    g.appendChild(line);

    if (isSelected) {
      const outline = document.createElementNS(NS, 'line');
      outline.setAttribute('x1', pos.x - hw);
      outline.setAttribute('y1', pos.y - hh);
      outline.setAttribute('x2', pos.x + hw);
      outline.setAttribute('y2', pos.y + hh);
      outline.setAttribute('stroke', '#3b82f6'); // Blue highlight
      outline.setAttribute('stroke-width', 4.5 * zoom);
      outline.setAttribute('stroke-opacity', '0.4');
      outline.setAttribute('stroke-linecap', 'round');
      g.appendChild(outline);
    }

    // Hit area (angled)
    const hitArea = document.createElementNS(NS, 'line');
    hitArea.setAttribute('x1',           pos.x - hw);
    hitArea.setAttribute('y1',           pos.y - hh);
    hitArea.setAttribute('x2',           pos.x + hw);
    hitArea.setAttribute('y2',           pos.y + hh);
    hitArea.setAttribute('stroke',       'transparent');
    hitArea.setAttribute('stroke-width', 24 * zoom);
    // OPTIMIZATION: Ensure hit area doesn't swallow handle clicks
    hitArea.style.pointerEvents = 'stroke'; 
    g.appendChild(hitArea);
  }

  function _renderHandles(g, shape, pos, zoom, type) {
    if (type === 'line') {
      const hw = (shape.Width / 2) * zoom;
      const hh = (shape.Height / 2) * zoom;
      _createHandle(g, pos.x - hw, pos.y - hh, 'p1', 'pointer', zoom);
      _createHandle(g, pos.x + hw, pos.y + hh, 'p2', 'pointer', zoom);
    } else {
      const w = shape.Width  * zoom;
      const h = shape.Height * zoom;
      _createHandle(g, pos.x - w/2, pos.y - h/2, 'nw', 'nwse-resize', zoom);
      _createHandle(g, pos.x + w/2, pos.y - h/2, 'ne', 'nesw-resize', zoom);
      _createHandle(g, pos.x - w/2, pos.y + h/2, 'sw', 'nesw-resize', zoom);
      _createHandle(g, pos.x + w/2, pos.y + h/2, 'se', 'nwse-resize', zoom);
    }
  }

  function _createHandle(g, x, y, handleCode, cursor, zoom) {
    const size = 10 * zoom;
    const h = document.createElementNS(NS, 'rect');
    h.setAttribute('x', x - size / 2);
    h.setAttribute('y', y - size / 2);
    h.setAttribute('width',  size);
    h.setAttribute('height', size);
    h.setAttribute('rx', 0);
    h.setAttribute('ry', 0);
    h.setAttribute('fill', '#ffffff');
    h.setAttribute('stroke', '#ef4444');
    h.setAttribute('stroke-width', 1.5 * zoom);
    h.setAttribute('data-handle', handleCode);
    h.style.cursor = cursor;
    // STABILITY: Ensure handles absorb all pointer events over geometry
    h.style.pointerEvents = 'all'; 
    g.appendChild(h);
  }

  function _renderIcon(g, shape, pos, zoom) {
    const typeString = (shape.Type || 'rectangle').toLowerCase();
    
    // HARD LOCKDOWN: Never render icons for primitive shapes (kills orange boxes)
    const primitives = ['line', 'circle', 'rectangle', 'rect', 'ellipse', 'cylinder', 'database'];
    if (primitives.includes(typeString)) {
      return;
    }

    const iconSize = Math.min(shape.Width, shape.Height) * zoom * 0.55;
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(shape.SvgIcon, 'image/svg+xml');
    const svgContent = doc.querySelector('svg');

    if (svgContent) {
      const gIcon = document.createElementNS(NS, 'g');
      gIcon.style.pointerEvents = 'none';

      // Advanced Centering: Library icons are 40x40. We scale and then shift to center.
      const scale = iconSize / 40; 
      const tx = pos.x - (20 * scale);
      const ty = pos.y - (20 * scale);
      gIcon.setAttribute('transform', `translate(${tx}, ${ty}) scale(${scale})`);
      gIcon.setAttribute('fill', shape.Color || '#6366f1');

      // Selective Clone: Skip background backing elements (opacity="0.1")
      svgContent.childNodes.forEach(node => {
        if (node.nodeType === 1) { // Element
          if (node.getAttribute('opacity') === '0.1') return; // Skip backing
          const clone = node.cloneNode(true);
          gIcon.appendChild(clone);
        }
      });

      g.appendChild(gIcon);
    }
  }

  function _renderLabel(g, shape, pos, zoom, type) {
    const text = document.createElementNS(NS, 'text');
    
    // DYNAMIC OFFSET: Keep labels clear of diagonal paths
    let yOff = 0;
    if (type === 'line') {
      const hh = Math.abs(shape.Height / 2) * zoom;
      yOff = hh + 16 * zoom;
    } else {
      yOff = (shape.Height * zoom) / 2 + 16 * zoom;
    }
    
    text.setAttribute('x', pos.x);
    text.setAttribute('y', pos.y + yOff);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', '#475569');
    text.style.fontFamily  = 'Inter, system-ui, sans-serif';
    text.style.fontSize    = (12 * zoom) + 'px';
    text.style.fontWeight  = '500';
    text.style.pointerEvents = 'none';
    text.textContent = shape.Label;
    g.appendChild(text);
  }

  return { render };

})();
