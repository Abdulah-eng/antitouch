/**
 * render-shapes.js
 * ================
 * Version M3.0 / M5.0
 *
 * M5.0 changes:
 *  - Resize handles now render on HOVER (not just selection).
 *  - Handles use GlobalVars resizeControlPointDefaultColor (transparent by default)
 *    and resizeControlPointHoverColor (white) for active/hover state.
 *  - 8 control points for rectangles: NW, N, NE, E, SE, S, SW, W.
 *  - 2 control points for circles: N, S (uniform radius drag).
 *  - Hover outline ring rendered distinct from selection outline.
 *  - Selection and hover states are independent — selected shape always shows handles.
 */

'use strict';

const RenderShapes = (() => {

  const NS = 'http://www.w3.org/2000/svg';

  function render(svg, canvas, width, height) {
    const shapes     = CanvasState.getShapes();
    const zoom       = canvas.ZoomScale;
    const selectedId = CanvasState.getSelectedId();
    const hoveredId  = CanvasState.getHoveredId();

    shapes.forEach(shape => {
      const pos        = WorldToScreen.convert(shape.WorldX, shape.WorldY, width, height);
      const isSelected = (shape.ShapeID === selectedId);
      const isHovered  = (shape.ShapeID === hoveredId) && !isSelected;
      const g          = _buildShapeGroup(shape, pos, zoom, isSelected, isHovered);
      svg.appendChild(g);
    });
  }

  function _buildShapeGroup(shape, pos, zoom, isSelected, isHovered) {
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
        _renderCircle(g, shape, pos, zoom, isSelected, isHovered);
        break;
      default:
        _renderRect(g, shape, pos, zoom, isSelected, isHovered, type);
    }

    // 2. Icon (Nested SVG — non-primitives only)
    if (shape.SvgIcon) {
      _renderIcon(g, shape, pos, zoom);
    }

    // 3. Resize Handles — show on hover OR selection
    if (isSelected || isHovered) {
      _renderHandles(g, shape, pos, zoom, type, isSelected);
    }

    // 4. Label
    _renderLabel(g, shape, pos, zoom, type);

    return g;
  }

  // ── Rectangle ────────────────────────────────────────────────
  function _renderRect(g, shape, pos, zoom, isSelected, isHovered, type) {
    const w = shape.Width  * zoom;
    const h = shape.Height * zoom;

    let fillOpacity = '1.0';
    let rx = 0;
    let strokeDash = 'none';

    if (type === 'aws-region' || type === 'aws-vpc' || type === 'aws-availability-zone') {
       fillOpacity = '0.12';
       rx = 4 * zoom;
       strokeDash = `${6 * zoom} ${4 * zoom}`;
    } else if (type === 'aws-route-table') {
       fillOpacity = '0.18';
       rx = 6 * zoom;
    }

    const rect = document.createElementNS(NS, 'rect');
    rect.setAttribute('x',            pos.x - w / 2);
    rect.setAttribute('y',            pos.y - h / 2);
    rect.setAttribute('width',        w);
    rect.setAttribute('height',       h);
    rect.setAttribute('fill',         shape.FillColor || shape.Color || '#6366f1');
    rect.setAttribute('fill-opacity', fillOpacity);
    rect.setAttribute('rx',           rx);
    rect.setAttribute('ry',           rx);
    rect.setAttribute('stroke',       shape.StrokeColor || shape.Color || '#6366f1');
    rect.setAttribute('stroke-width', 1.5 * zoom);
    if (strokeDash !== 'none') {
      rect.setAttribute('stroke-dasharray', strokeDash);
    }
    g.appendChild(rect);

    // Hover outline (subtle blue ring)
    if (isHovered) {
      const outline = document.createElementNS(NS, 'rect');
      outline.setAttribute('x',      pos.x - w / 2 - 3);
      outline.setAttribute('y',      pos.y - h / 2 - 3);
      outline.setAttribute('width',  w + 6);
      outline.setAttribute('height', h + 6);
      outline.setAttribute('fill',   'none');
      outline.setAttribute('stroke', '#93c5fd');
      outline.setAttribute('stroke-width', 1.5 * zoom);
      outline.setAttribute('stroke-dasharray', '4 3');
      outline.style.pointerEvents = 'none';
      g.appendChild(outline);
    }

    // Selection outline (solid blue)
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
      outline.style.pointerEvents = 'none';
      g.appendChild(outline);
    }
  }

  // ── Circle / Ellipse ─────────────────────────────────────────
  function _renderCircle(g, shape, pos, zoom, isSelected, isHovered) {
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

    if (isHovered) {
      const outline = document.createElementNS(NS, 'ellipse');
      outline.setAttribute('cx',     pos.x);
      outline.setAttribute('cy',     pos.y);
      outline.setAttribute('rx',     rx + 3);
      outline.setAttribute('ry',     ry + 3);
      outline.setAttribute('fill',   'none');
      outline.setAttribute('stroke', '#93c5fd');
      outline.setAttribute('stroke-width', 1.5 * zoom);
      outline.setAttribute('stroke-dasharray', '4 3');
      outline.style.pointerEvents = 'none';
      g.appendChild(outline);
    }

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
      outline.style.pointerEvents = 'none';
      g.appendChild(outline);
    }
  }

  // ── Line ─────────────────────────────────────────────────────
  function _renderLine(g, shape, pos, zoom, isSelected) {
    const hw = (shape.Width  / 2) * zoom;
    const hh = (shape.Height / 2) * zoom;

    const line = document.createElementNS(NS, 'line');
    line.setAttribute('x1',            pos.x - hw);
    line.setAttribute('y1',            pos.y - hh);
    line.setAttribute('x2',            pos.x + hw);
    line.setAttribute('y2',            pos.y + hh);
    line.setAttribute('stroke',        shape.StrokeColor || shape.Color || '#10b981');
    line.setAttribute('stroke-width',  2.5 * zoom);
    line.setAttribute('stroke-linecap','round');
    g.appendChild(line);

    if (isSelected) {
      const outline = document.createElementNS(NS, 'line');
      outline.setAttribute('x1', pos.x - hw);
      outline.setAttribute('y1', pos.y - hh);
      outline.setAttribute('x2', pos.x + hw);
      outline.setAttribute('y2', pos.y + hh);
      outline.setAttribute('stroke',         '#3b82f6');
      outline.setAttribute('stroke-width',   4.5 * zoom);
      outline.setAttribute('stroke-opacity', '0.4');
      outline.setAttribute('stroke-linecap', 'round');
      outline.style.pointerEvents = 'none';
      g.appendChild(outline);
    }

    // Wide transparent hit area
    const hitArea = document.createElementNS(NS, 'line');
    hitArea.setAttribute('x1',           pos.x - hw);
    hitArea.setAttribute('y1',           pos.y - hh);
    hitArea.setAttribute('x2',           pos.x + hw);
    hitArea.setAttribute('y2',           pos.y + hh);
    hitArea.setAttribute('stroke',       'transparent');
    hitArea.setAttribute('stroke-width', 24 * zoom);
    hitArea.style.pointerEvents = 'stroke';
    g.appendChild(hitArea);
  }

  // ── Resize / Endpoint Handles ────────────────────────────────
  /**
   * isSelected controls control point color:
   *   selected or hovered → use resizeControlPointHoverColor (white)
   *   hover only         → also show white (so hovering reveals the points)
   *   default (invisible)→ use resizeControlPointDefaultColor (transparent)
   *
   * For rectangles: 8 handles (NW, N, NE, E, SE, S, SW, W).
   * For circles:    2 handles (N, S) — radius is uniform.
   * For lines:      2 endpoint handles (P1, P2).
   */
  function _renderHandles(g, shape, pos, zoom, type, isSelected) {
    const gv = CanvasState.getGlobalVars();

    if (type === 'line') {
      const hw = (shape.Width  / 2) * zoom;
      const hh = (shape.Height / 2) * zoom;
      _createHandle(g, pos.x - hw, pos.y - hh, 'p1', 'pointer',  zoom, true);
      _createHandle(g, pos.x + hw, pos.y + hh, 'p2', 'pointer',  zoom, true);
      return;
    }

    const isCircle = (type === 'circle' || type === 'ellipse');
    const gvType   = isCircle ? gv.circle : gv.rectangle;
    // Show white handle colour when hovered or selected; transparent when just hovered-but-not-selected
    // Both states (isHovered for hover-only, isSelected for selected) show handle colour
    const activeFill = gvType.resizeControlPointHoverColor;

    if (isCircle) {
      const ry = (shape.Height / 2) * zoom;
      _createHandle(g, pos.x,        pos.y - ry, 'n',  'ns-resize',   zoom, isSelected, activeFill);
      _createHandle(g, pos.x,        pos.y + ry, 's',  'ns-resize',   zoom, isSelected, activeFill);
    } else {
      const w = shape.Width  * zoom;
      const h = shape.Height * zoom;
      const l = pos.x - w / 2, r = pos.x + w / 2, mid = pos.x;
      const t = pos.y - h / 2, b = pos.y + h / 2, midy = pos.y;
      _createHandle(g, l,   t,    'nw', 'nwse-resize', zoom, isSelected, activeFill);
      _createHandle(g, mid, t,    'n',  'ns-resize',   zoom, isSelected, activeFill);
      _createHandle(g, r,   t,    'ne', 'nesw-resize', zoom, isSelected, activeFill);
      _createHandle(g, r,   midy, 'e',  'ew-resize',   zoom, isSelected, activeFill);
      _createHandle(g, r,   b,    'se', 'nwse-resize', zoom, isSelected, activeFill);
      _createHandle(g, mid, b,    's',  'ns-resize',   zoom, isSelected, activeFill);
      _createHandle(g, l,   b,    'sw', 'nesw-resize', zoom, isSelected, activeFill);
      _createHandle(g, l,   midy, 'w',  'ew-resize',   zoom, isSelected, activeFill);
    }
  }

  function _createHandle(g, x, y, handleCode, cursor, zoom, isActive, activeFill = '#ffffff') {
    const size = 9 * zoom;
    const h    = document.createElementNS(NS, 'rect');
    h.setAttribute('x',      x - size / 2);
    h.setAttribute('y',      y - size / 2);
    h.setAttribute('width',  size);
    h.setAttribute('height', size);
    h.setAttribute('rx',     2 * zoom);
    h.setAttribute('ry',     2 * zoom);
    // Transparent by default; white when active (hovered or selected)
    h.setAttribute('fill',         isActive ? activeFill : 'transparent');
    h.setAttribute('stroke',       isActive ? '#94a3b8'  : 'transparent');
    h.setAttribute('stroke-width', 1 * zoom);
    h.setAttribute('data-handle',  handleCode);
    h.style.cursor        = cursor;
    h.style.pointerEvents = 'all';
    g.appendChild(h);
  }

  // ── Icon ─────────────────────────────────────────────────────
  function _renderIcon(g, shape, pos, zoom) {
    const typeString = (shape.Type || 'rectangle').toLowerCase();
    const primitives = [
      'line', 'circle', 'rectangle', 'rect', 'ellipse', 'cylinder', 'database',
      'aws-region', 'aws-vpc', 'aws-availability-zone', 'aws-route-table'
    ];
    if (primitives.includes(typeString)) return;

    const iconSize    = Math.min(shape.Width, shape.Height) * zoom * 0.55;
    const parser      = new DOMParser();
    const doc         = parser.parseFromString(shape.SvgIcon, 'image/svg+xml');
    const svgContent  = doc.querySelector('svg');

    if (svgContent) {
      const gIcon = document.createElementNS(NS, 'g');
      gIcon.style.pointerEvents = 'none';
      const scale = iconSize / 40;
      const tx    = pos.x - (20 * scale);
      const ty    = pos.y - (20 * scale);
      gIcon.setAttribute('transform', `translate(${tx}, ${ty}) scale(${scale})`);
      gIcon.setAttribute('fill', shape.Color || '#6366f1');
      svgContent.childNodes.forEach(node => {
        if (node.nodeType === 1 && node.getAttribute('opacity') !== '0.1') {
          gIcon.appendChild(node.cloneNode(true));
        }
      });
      g.appendChild(gIcon);
    }
  }

  // ── Label ─────────────────────────────────────────────────────
  function _renderLabel(g, shape, pos, zoom, type) {
    const text = document.createElementNS(NS, 'text');
    let yOff = 0;
    let xOff = 0;
    let textAnchor = 'middle';

    if (type.startsWith('aws-')) {
      // AWS style: Top-left inner corner
      yOff = -(shape.Height / 2 * zoom) + 16 * zoom;
      xOff = -(shape.Width / 2 * zoom) + 10 * zoom;
      textAnchor = 'start';
    } else if (type === 'line') {
      yOff = Math.abs(shape.Height / 2) * zoom + 16 * zoom;
    } else {
      yOff = (shape.Height * zoom) / 2 + 16 * zoom;
    }

    text.setAttribute('x', pos.x + xOff);
    text.setAttribute('y', pos.y + yOff);
    text.setAttribute('text-anchor', textAnchor);
    text.setAttribute('fill', '#475569');
    text.style.fontFamily    = 'Inter, system-ui, sans-serif';
    text.style.fontSize      = (12 * zoom) + 'px';
    text.style.fontWeight    = '500';
    text.style.pointerEvents = 'none';
    text.textContent = shape.Label;
    g.appendChild(text);
  }

  return { render };

})();
