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
    const gv = (CanvasState.getGlobalVars() || {}).Rectangle || {};

    // ── Protection Zone ───────────────────────────────────────────────
    if (isSelected) {
      const pxRatio = shape.ProtectionPaddingXRatio || gv.ProtectionPaddingXRatio || 0.2;
      const pyRatio = shape.ProtectionPaddingYRatio || gv.ProtectionPaddingYRatio || 0.2;
      const pw = w * (1 + pxRatio * 2);
      const ph = h * (1 + pyRatio * 2);
      
      const protectRect = document.createElementNS(NS, 'rect');
      protectRect.setAttribute('x', pos.x - pw / 2);
      protectRect.setAttribute('y', pos.y - ph / 2);
      protectRect.setAttribute('width', pw);
      protectRect.setAttribute('height', ph);
      protectRect.setAttribute('fill', gv.ProtectionPaddingColor || 'transparent');
      protectRect.setAttribute('stroke', '#ef4444');
      protectRect.setAttribute('stroke-width', 1 * zoom);
      protectRect.setAttribute('stroke-dasharray', '8 4');
      protectRect.setAttribute('stroke-opacity', '0.4');
      g.appendChild(protectRect);
    }

    // ── Hover Zone ────────────────────────────────────────────────────
    if (isSelected) {
      const hxRatio = shape.HoverPaddingXRatio || gv.HoverPaddingXRatio || 0.1;
      const hyRatio = shape.HoverPaddingYRatio || gv.HoverPaddingYRatio || 0.1;
      const hw = w * (1 + hxRatio * 2);
      const hh = h * (1 + hyRatio * 2);

      const hoverRect = document.createElementNS(NS, 'rect');
      hoverRect.setAttribute('x', pos.x - hw / 2);
      hoverRect.setAttribute('y', pos.y - hh / 2);
      hoverRect.setAttribute('width', hw);
      hoverRect.setAttribute('height', hh);
      hoverRect.setAttribute('fill', gv.HoverPaddingColor || 'transparent');
      hoverRect.setAttribute('stroke', '#3b82f6');
      hoverRect.setAttribute('stroke-width', 2 * zoom);
      hoverRect.setAttribute('stroke-dasharray', '4 2');
      hoverRect.setAttribute('stroke-opacity', '0.6');
      g.appendChild(hoverRect);
    }

    // ── Main Rectangle ────────────────────────────────────────────────
    const rect = document.createElementNS(NS, 'rect');
    rect.setAttribute('x',            pos.x - w / 2);
    rect.setAttribute('y',            pos.y - h / 2);
    rect.setAttribute('width',        w);
    rect.setAttribute('height',       h);
    rect.setAttribute('fill',         shape.FillColor || shape.Color || gv.FillColor || '#6366f1');
    rect.setAttribute('fill-opacity', '1.0');
    rect.setAttribute('rx',           0);
    rect.setAttribute('ry',           0);
    rect.setAttribute('stroke',       shape.StrokeColor || shape.Color || gv.LineColor || '#6366f1');
    rect.setAttribute('stroke-width', (gv.LineWidth || 1.5) * zoom);
    g.appendChild(rect);
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
      _createHandle(g, pos.x - hw, pos.y - hh, 'p1', 'pointer', zoom, 'line');
      _createHandle(g, pos.x + hw, pos.y + hh, 'p2', 'pointer', zoom, 'line');
    } else {
      const w = shape.Width  * zoom;
      const h = shape.Height * zoom;
      // 8-point resize controls
      _createHandle(g, pos.x - w/2, pos.y - h/2, 'nw', 'nwse-resize', zoom, type);
      _createHandle(g, pos.x,       pos.y - h/2, 'n',  'ns-resize',   zoom, type);
      _createHandle(g, pos.x + w/2, pos.y - h/2, 'ne', 'nesw-resize', zoom, type);
      _createHandle(g, pos.x + w/2, pos.y,       'e',  'ew-resize',   zoom, type);
      _createHandle(g, pos.x + w/2, pos.y + h/2, 'se', 'nwse-resize', zoom, type);
      _createHandle(g, pos.x,       pos.y + h/2, 's',  'ns-resize',   zoom, type);
      _createHandle(g, pos.x - w/2, pos.y + h/2, 'sw', 'nesw-resize', zoom, type);
      _createHandle(g, pos.x - w/2, pos.y,       'w',  'ew-resize',   zoom, type);
    }
  }

  function _createHandle(g, x, y, handleCode, cursor, zoom, type) {
    const size = 10 * zoom;
    const isRect = type === 'rectangle';
    const isCirc = type === 'circle' || type === 'ellipse';
    const gvKey  = isRect ? 'Rectangle' : (isCirc ? 'Circle' : 'Rectangle'); // fallback to rect settings for lines
    const gv     = (CanvasState.getGlobalVars() || {})[gvKey] || {};
    
    const defColor = gv.ResizeControlPointDefaultColor || 'transparent';
    const hovColor = gv.ResizeControlPointHoverColor   || '#ffffff';
    
    const h = document.createElementNS(NS, 'rect');
    h.setAttribute('x', x - size / 2);
    h.setAttribute('y', y - size / 2);
    h.setAttribute('width',  size);
    h.setAttribute('height', size);
    h.setAttribute('rx', 0);
    h.setAttribute('ry', 0);
    h.setAttribute('fill', defColor);
    h.setAttribute('stroke', defColor === 'transparent' ? 'transparent' : '#ef4444');
    h.setAttribute('stroke-width', 1.5 * zoom);
    h.setAttribute('data-handle', handleCode);
    h.style.cursor = cursor;
    h.style.pointerEvents = 'all'; 
    
    // Hover effect via CSS (inline script simulation since we're manipulating DOM directly)
    h.addEventListener('mouseenter', () => {
      h.setAttribute('fill', hovColor);
      h.setAttribute('stroke', '#ef4444');
    });
    h.addEventListener('mouseleave', () => {
      h.setAttribute('fill', defColor);
      h.setAttribute('stroke', defColor === 'transparent' ? 'transparent' : '#ef4444');
    });
    
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
