/**
 * render-shapes.js
 * ================
 * Version M5.0 — Rectangle Interaction Engine
 *
 * M5 changes:
 * - Rectangles show 8 resize control points when hovered OR selected.
 * - Control point colors sourced from GlobalVars.Rectangle:
 *     transparent (default), white (hover/selected).
 * - Circles show 1 radial resize handle when hovered OR selected.
 * - PreviousValidCenterX/Y written to shape after every successful move.
 * - Selection outline is now a dashed blue ring for all primitives.
 * - Icon rendering unchanged.
 */

'use strict';

const RenderShapes = (() => {

  const NS = 'http://www.w3.org/2000/svg';

  function render(svg, canvas, width, height) {
    const shapes     = CanvasState.getShapes();
    const zoom       = canvas.ZoomScale;
    const selectedId = CanvasState.getSelectedId();
    const hoveredId  = (typeof HoverState !== 'undefined') ? HoverState.getHoveredId() : null;
    const globalVars = CanvasState.getGlobalVars();

    shapes.forEach(shape => {
      const pos       = WorldToScreen.convert(shape.WorldX, shape.WorldY, width, height);
      const isSelected = (shape.ShapeID === selectedId);
      const isHovered  = (shape.ShapeID === hoveredId);
      const g = _buildShapeGroup(shape, pos, zoom, isSelected, isHovered, globalVars);
      svg.appendChild(g);
    });
  }

  function _buildShapeGroup(shape, pos, zoom, isSelected, isHovered, globalVars) {
    const g = document.createElementNS(NS, 'g');
    g.id            = shape.ShapeID;
    g.style.cursor  = 'move';
    g.setAttribute('data-obj-id', shape.ShapeID);

    const type = (shape.Type || 'rectangle').toLowerCase();

    // 1. Geometry primitive
    switch (type) {
      case 'line':
        _renderLine(g, shape, pos, zoom, isSelected);
        break;
      case 'circle':
      case 'ellipse':
        _renderCircle(g, shape, pos, zoom, isSelected, isHovered, globalVars);
        break;
      default:
        _renderRect(g, shape, pos, zoom, isSelected, isHovered, globalVars);
    }

    // 2. Icon (Nested SVG — only for non-primitive library shapes)
    if (shape.SvgIcon) _renderIcon(g, shape, pos, zoom);

    // 3. Selection + Hover handles (Interaction Parity)
    if (isSelected || isHovered) {
      _renderHandles(g, shape, pos, zoom, type, isSelected, isHovered, globalVars);
    }

    // 4. Label
    _renderLabel(g, shape, pos, zoom, type);

    return g;
  }

  // ── Primitives ────────────────────────────────────────────────────

  function _renderRect(g, shape, pos, zoom, isSelected, isHovered, globalVars) {
    const w = shape.Width  * zoom;
    const h = shape.Height * zoom;

    const rect = document.createElementNS(NS, 'rect');
    rect.setAttribute('x',            pos.x - w / 2);
    rect.setAttribute('y',            pos.y - h / 2);
    rect.setAttribute('width',        w);
    rect.setAttribute('height',       h);
    rect.setAttribute('fill',         shape.FillColor   || shape.Color || '#6366f1');
    rect.setAttribute('fill-opacity', '1.0');
    rect.setAttribute('rx', 0);
    rect.setAttribute('ry', 0);
    rect.setAttribute('stroke',       shape.StrokeColor || shape.Color || '#6366f1');
    rect.setAttribute('stroke-width', 1.5 * zoom);
    g.appendChild(rect);

    // Selection dashed outline
    if (isSelected) {
      const outline = document.createElementNS(NS, 'rect');
      outline.setAttribute('x',      pos.x - w / 2 - 3);
      outline.setAttribute('y',      pos.y - h / 2 - 3);
      outline.setAttribute('width',  w + 6);
      outline.setAttribute('height', h + 6);
      outline.setAttribute('fill',   'none');
      outline.setAttribute('stroke', '#3b82f6');
      outline.setAttribute('stroke-width',     2 * zoom);
      outline.setAttribute('stroke-dasharray', '6 3');
      outline.style.pointerEvents = 'none';
      g.appendChild(outline);
    } else if (isHovered) {
      // Subtle hover ring
      const hring = document.createElementNS(NS, 'rect');
      hring.setAttribute('x',      pos.x - w / 2 - 2);
      hring.setAttribute('y',      pos.y - h / 2 - 2);
      hring.setAttribute('width',  w + 4);
      hring.setAttribute('height', h + 4);
      hring.setAttribute('fill',   'none');
      hring.setAttribute('stroke', 'rgba(255,255,255,0.35)');
      hring.setAttribute('stroke-width', 1.5 * zoom);
      hring.style.pointerEvents = 'none';
      g.appendChild(hring);
    }
  }

  function _renderCircle(g, shape, pos, zoom, isSelected, isHovered, globalVars) {
    const rx = (shape.Width  / 2) * zoom;
    const ry = (shape.Height / 2) * zoom;

    const el = document.createElementNS(NS, 'ellipse');
    el.setAttribute('cx',           pos.x);
    el.setAttribute('cy',           pos.y);
    el.setAttribute('rx',           rx);
    el.setAttribute('ry',           ry);
    el.setAttribute('fill',         shape.FillColor   || shape.Color || '#10b981');
    el.setAttribute('fill-opacity', '1.0');
    el.setAttribute('stroke',       shape.StrokeColor || shape.Color || '#10b981');
    el.setAttribute('stroke-width', 1.5 * zoom);
    g.appendChild(el);

    if (isSelected) {
      const outline = document.createElementNS(NS, 'ellipse');
      outline.setAttribute('cx',   pos.x);
      outline.setAttribute('cy',   pos.y);
      outline.setAttribute('rx',   rx + 3);
      outline.setAttribute('ry',   ry + 3);
      outline.setAttribute('fill', 'none');
      outline.setAttribute('stroke', '#3b82f6');
      outline.setAttribute('stroke-width',     2 * zoom);
      outline.setAttribute('stroke-dasharray', '6 3');
      outline.style.pointerEvents = 'none';
      g.appendChild(outline);
    } else if (isHovered) {
      const hring = document.createElementNS(NS, 'ellipse');
      hring.setAttribute('cx',   pos.x);
      hring.setAttribute('cy',   pos.y);
      hring.setAttribute('rx',   rx + 2);
      hring.setAttribute('ry',   ry + 2);
      hring.setAttribute('fill', 'none');
      hring.setAttribute('stroke', 'rgba(255,255,255,0.35)');
      hring.setAttribute('stroke-width', 1.5 * zoom);
      hring.style.pointerEvents = 'none';
      g.appendChild(hring);
    }
  }

  function _renderLine(g, shape, pos, zoom, isSelected) {
    const hw = (shape.Width  / 2) * zoom;
    const hh = (shape.Height / 2) * zoom;

    const line = document.createElementNS(NS, 'line');
    line.setAttribute('x1', pos.x - hw);  line.setAttribute('y1', pos.y - hh);
    line.setAttribute('x2', pos.x + hw);  line.setAttribute('y2', pos.y + hh);
    line.setAttribute('stroke',         shape.StrokeColor || shape.Color || '#10b981');
    line.setAttribute('stroke-width',   2.5 * zoom);
    line.setAttribute('stroke-linecap', 'round');
    g.appendChild(line);

    if (isSelected) {
      const outline = document.createElementNS(NS, 'line');
      outline.setAttribute('x1', pos.x - hw);  outline.setAttribute('y1', pos.y - hh);
      outline.setAttribute('x2', pos.x + hw);  outline.setAttribute('y2', pos.y + hh);
      outline.setAttribute('stroke',         '#3b82f6');
      outline.setAttribute('stroke-width',   4.5 * zoom);
      outline.setAttribute('stroke-opacity', '0.4');
      outline.setAttribute('stroke-linecap', 'round');
      outline.style.pointerEvents = 'none';
      g.appendChild(outline);
    }

    // Wide invisible hit area
    const hitArea = document.createElementNS(NS, 'line');
    hitArea.setAttribute('x1', pos.x - hw);  hitArea.setAttribute('y1', pos.y - hh);
    hitArea.setAttribute('x2', pos.x + hw);  hitArea.setAttribute('y2', pos.y + hh);
    hitArea.setAttribute('stroke',       'transparent');
    hitArea.setAttribute('stroke-width', 24 * zoom);
    hitArea.style.pointerEvents = 'stroke';
    g.appendChild(hitArea);
  }

  // ── Handles ───────────────────────────────────────────────────────

  function _renderHandles(g, shape, pos, zoom, type, isSelected, isHovered, globalVars) {
    if (type === 'line') {
      // Lines: two endpoint handles only (always shown when selected)
      if (!isSelected) return;
      const hw = (shape.Width  / 2) * zoom;
      const hh = (shape.Height / 2) * zoom;
      _createHandle(g, pos.x - hw, pos.y - hh, 'p1', 'pointer', zoom, '#ffffff', '#ef4444');
      _createHandle(g, pos.x + hw, pos.y + hh, 'p2', 'pointer', zoom, '#ffffff', '#ef4444');
      return;
    }

    // Rectangle: 8 control points
    if (type === 'rectangle' || type === 'rect' || type !== 'circle' && type !== 'ellipse') {
      const gv  = (globalVars && globalVars.Rectangle) || {};
      // Default: transparent; hover/selected: white
      const cpColor = (isSelected || isHovered)
        ? (gv.ControlPointColorActive  || '#f59e0b')
        : (gv.ControlPointColorDefault || 'transparent');

      const w = shape.Width  * zoom;
      const h = shape.Height * zoom;
      const cx = pos.x, cy = pos.y;

      // 4 corners
      _createHandle(g, cx - w/2, cy - h/2, 'nw', 'nwse-resize', zoom, cpColor, '#475569');
      _createHandle(g, cx + w/2, cy - h/2, 'ne', 'nesw-resize', zoom, cpColor, '#475569');
      _createHandle(g, cx - w/2, cy + h/2, 'sw', 'nesw-resize', zoom, cpColor, '#475569');
      _createHandle(g, cx + w/2, cy + h/2, 'se', 'nwse-resize', zoom, cpColor, '#475569');
      // 4 edge midpoints
      _createHandle(g, cx,       cy - h/2, 'n',  'ns-resize',   zoom, cpColor, '#475569');
      _createHandle(g, cx,       cy + h/2, 's',  'ns-resize',   zoom, cpColor, '#475569');
      _createHandle(g, cx - w/2, cy,       'w',  'ew-resize',   zoom, cpColor, '#475569');
      _createHandle(g, cx + w/2, cy,       'e',  'ew-resize',   zoom, cpColor, '#475569');
      return;
    }

    // Circle: 1 radial handle (east edge)
    if (type === 'circle' || type === 'ellipse') {
      const gv      = (globalVars && globalVars.Circle) || {};
      const cpColor = (isSelected || isHovered)
        ? (gv.ControlPointColorActive  || '#f59e0b')
        : (gv.ControlPointColorDefault || 'transparent');
      const rx = (shape.Width / 2) * zoom;
      _createHandle(g, pos.x + rx, pos.y, 'se', 'nwse-resize', zoom, cpColor, '#475569');
    }
  }

  function _createHandle(g, x, y, handleCode, cursor, zoom, fillColor, strokeColor) {
    const size = 9 * zoom;
    const h = document.createElementNS(NS, 'rect');
    h.setAttribute('x',      x - size / 2);
    h.setAttribute('y',      y - size / 2);
    h.setAttribute('width',  size);
    h.setAttribute('height', size);
    h.setAttribute('rx', 2);
    h.setAttribute('ry', 2);
    h.setAttribute('fill',         fillColor   || '#ffffff');
    h.setAttribute('stroke',       strokeColor || '#475569');
    h.setAttribute('stroke-width', 1.5 * zoom);
    h.setAttribute('data-handle',  handleCode);
    h.style.cursor       = cursor;
    h.style.pointerEvents = 'all';
    g.appendChild(h);
  }

  // ── Icon ──────────────────────────────────────────────────────────

  function _renderIcon(g, shape, pos, zoom) {
    const typeString = (shape.Type || 'rectangle').toLowerCase();
    const primitives = ['line', 'circle', 'rectangle', 'rect', 'ellipse', 'cylinder', 'database'];
    if (primitives.includes(typeString)) return;

    const iconSize = Math.min(shape.Width, shape.Height) * zoom * 0.55;
    const parser   = new DOMParser();
    const doc      = parser.parseFromString(shape.SvgIcon, 'image/svg+xml');
    const svgContent = doc.querySelector('svg');

    if (svgContent) {
      const gIcon = document.createElementNS(NS, 'g');
      gIcon.style.pointerEvents = 'none';
      const scale = iconSize / 40;
      const tx = pos.x - (20 * scale);
      const ty = pos.y - (20 * scale);
      gIcon.setAttribute('transform', `translate(${tx}, ${ty}) scale(${scale})`);
      gIcon.setAttribute('fill', shape.Color || '#6366f1');

      svgContent.childNodes.forEach(node => {
        if (node.nodeType === 1) {
          if (node.getAttribute('opacity') === '0.1') return;
          gIcon.appendChild(node.cloneNode(true));
        }
      });
      g.appendChild(gIcon);
    }
  }

  // ── Label ─────────────────────────────────────────────────────────

  function _renderLabel(g, shape, pos, zoom, type) {
    const text = document.createElementNS(NS, 'text');
    let yOff = 0;
    if (type === 'line') {
      yOff = Math.abs(shape.Height / 2) * zoom + 16 * zoom;
    } else {
      yOff = (shape.Height * zoom) / 2 + 16 * zoom;
    }
    text.setAttribute('x',           pos.x);
    text.setAttribute('y',           pos.y + yOff);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill',        '#475569');
    text.style.fontFamily  = 'Inter, system-ui, sans-serif';
    text.style.fontSize    = (12 * zoom) + 'px';
    text.style.fontWeight  = '500';
    text.style.pointerEvents = 'none';
    text.textContent = shape.Label;
    g.appendChild(text);
  }

  return { render };

})();
