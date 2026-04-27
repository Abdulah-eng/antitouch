/**
 * properties-modal.js
 * ===================
 * Manages the Global Variables modal and Shape Properties panel.
 *
 * Milestone 3: Added Circle and Rectangle tabs to Global Variables.
 * Each tab exposes: FillColor, LineColor, LineWidth, HoverPaddingRatio,
 * ProtectionPaddingRatio, and control-point color settings.
 * Constraint enforced: ProtectionPadding > HoverPadding.
 */

'use strict';

const PropertiesModal = (() => {

  let _activeMode    = 'form-canvas';
  let _activeShapeId = null;

  // ── 6-colour palette ─────────────────────────────────────────────
  const PALETTE = [
    '#6366f1', // Indigo
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#f43f5e', // Rose
    '#0ea5e9', // Sky
    '#64748b', // Slate
  ];

  // Per-type selected state
  const sel = {
    stroke:   PALETTE[0],
    fill:     PALETTE[0],
    bg:       '#f1f5f9',
    grid:     '#94a3b8',
    circFill: PALETTE[0],
    circLine: PALETTE[0],
    rectFill: PALETTE[0],
    rectLine: PALETTE[0],
  };

  // ── Build modal HTML ──────────────────────────────────────────────
  function init() {
    const html = `
      <div id="properties-modal-overlay" class="hidden">
        <div class="prop-modal">

          <div class="prop-sidebar">
            <div class="prop-sidebar-item active" id="tab-canvas" data-target="form-canvas">Canvas</div>
            <div class="prop-sidebar-item" id="tab-circle" data-target="form-circle">Circle</div>
            <div class="prop-sidebar-item" id="tab-rectangle" data-target="form-rectangle">Rectangle</div>
            <div class="prop-sidebar-item hidden" id="tab-shape" data-target="form-shape">Shape Properties</div>
          </div>

          <div class="prop-content">
            <div class="prop-header" id="prop-header-title">Global Variables — Canvas</div>

            <div class="prop-body">

              <!-- ═══ Canvas Tab ═══ -->
              <div class="prop-form active" id="form-canvas">
                <div class="prop-row" style="flex-direction:column;align-items:flex-start;gap:8px;">
                  <div class="prop-label">Background color</div>
                  <div class="prop-swatch-grid" id="swatch-bg"></div>
                </div>
                <div class="prop-row" style="margin-top:12px;">
                  <div class="prop-label">Grid visible</div>
                  <div class="prop-checkbox-wrap">
                    <input type="checkbox" class="prop-input" id="prop-grid-visible" />
                    <span>Enabled</span>
                  </div>
                </div>
                <div class="prop-row" style="flex-direction:column;align-items:flex-start;gap:8px;margin-top:12px;">
                  <div class="prop-label">Grid color</div>
                  <div class="prop-swatch-grid" id="swatch-grid"></div>
                </div>
                <div class="prop-row" style="margin-top:12px;">
                  <div class="prop-label">GridSpacingX</div>
                  <input type="number" class="prop-input" id="prop-grid-x" min="5" max="200" />
                </div>
                <div class="prop-row">
                  <div class="prop-label">GridSpacingY</div>
                  <input type="number" class="prop-input" id="prop-grid-y" min="5" max="200" />
                </div>
                <div class="prop-row">
                  <div class="prop-label">ShowOriginMarker</div>
                  <div class="prop-checkbox-wrap">
                    <input type="checkbox" class="prop-input" id="prop-show-origin" />
                    <span>Enabled</span>
                  </div>
                </div>
                <div class="prop-row">
                  <div class="prop-label">ShowAxes</div>
                  <div class="prop-checkbox-wrap">
                    <input type="checkbox" class="prop-input" id="prop-show-axes" />
                    <span>Enabled</span>
                  </div>
                </div>
                <div class="prop-hint">When Grid visible is off, grid-dependent settings are ignored.</div>
              </div>

              <!-- ═══ Circle Tab ═══ -->
              <div class="prop-form" id="form-circle">
                <div class="prop-row" style="flex-direction:column;align-items:flex-start;gap:8px;">
                  <div class="prop-label">Fill Color</div>
                  <div class="prop-swatch-grid" id="swatch-circ-fill"></div>
                </div>
                <div class="prop-row" style="flex-direction:column;align-items:flex-start;gap:8px;margin-top:12px;">
                  <div class="prop-label">Line Color</div>
                  <div class="prop-swatch-grid" id="swatch-circ-line"></div>
                </div>
                <div class="prop-row" style="margin-top:12px;">
                  <div class="prop-label">Line Width</div>
                  <input type="number" class="prop-input" id="prop-circ-linewidth" min="0.5" max="10" step="0.5" />
                </div>
                <div class="prop-section-divider">Hover Padding</div>
                <div class="prop-row">
                  <div class="prop-label">Hover Radius Ratio</div>
                  <input type="number" class="prop-input" id="prop-circ-hover" min="0.01" max="0.5" step="0.01" />
                </div>
                <div class="prop-section-divider">Protection Padding</div>
                <div class="prop-row">
                  <div class="prop-label">Protection Radius Ratio</div>
                  <input type="number" class="prop-input" id="prop-circ-protect" min="0.02" max="0.9" step="0.01" />
                </div>
                <div class="prop-hint">Protection Radius Ratio must be greater than Hover Radius Ratio.</div>
                <div class="prop-section-divider">Control Points</div>
                <div class="prop-row">
                  <div class="prop-label">Handle color (default)</div>
                  <div class="prop-swatch-grid" id="swatch-circ-cp-default"></div>
                </div>
                <div class="prop-row" style="margin-top:8px;">
                  <div class="prop-label">Handle color (hover/active)</div>
                  <div class="prop-swatch-grid" id="swatch-circ-cp-hover"></div>
                </div>
              </div>

              <!-- ═══ Rectangle Tab ═══ -->
              <div class="prop-form" id="form-rectangle">
                <div class="prop-row" style="flex-direction:column;align-items:flex-start;gap:8px;">
                  <div class="prop-label">Fill Color</div>
                  <div class="prop-swatch-grid" id="swatch-rect-fill"></div>
                </div>
                <div class="prop-row" style="flex-direction:column;align-items:flex-start;gap:8px;margin-top:12px;">
                  <div class="prop-label">Line Color</div>
                  <div class="prop-swatch-grid" id="swatch-rect-line"></div>
                </div>
                <div class="prop-row" style="margin-top:12px;">
                  <div class="prop-label">Line Width</div>
                  <input type="number" class="prop-input" id="prop-rect-linewidth" min="0.5" max="10" step="0.5" />
                </div>
                <div class="prop-section-divider">Hover Padding</div>
                <div class="prop-row">
                  <div class="prop-label">Hover Padding X Ratio</div>
                  <input type="number" class="prop-input" id="prop-rect-hover-x" min="0.01" max="0.5" step="0.01" />
                </div>
                <div class="prop-row">
                  <div class="prop-label">Hover Padding Y Ratio</div>
                  <input type="number" class="prop-input" id="prop-rect-hover-y" min="0.01" max="0.5" step="0.01" />
                </div>
                <div class="prop-section-divider">Protection Padding</div>
                <div class="prop-row">
                  <div class="prop-label">Protection Padding X Ratio</div>
                  <input type="number" class="prop-input" id="prop-rect-protect-x" min="0.02" max="0.9" step="0.01" />
                </div>
                <div class="prop-row">
                  <div class="prop-label">Protection Padding Y Ratio</div>
                  <input type="number" class="prop-input" id="prop-rect-protect-y" min="0.02" max="0.9" step="0.01" />
                </div>
                <div class="prop-hint">Protection Padding must be greater than Hover Padding (both axes).</div>
                <div class="prop-section-divider">Control Points</div>
                <div class="prop-row">
                  <div class="prop-label">Handle color (default)</div>
                  <div class="prop-swatch-grid" id="swatch-rect-cp-default"></div>
                </div>
                <div class="prop-row" style="margin-top:8px;">
                  <div class="prop-label">Handle color (hover/active)</div>
                  <div class="prop-swatch-grid" id="swatch-rect-cp-hover"></div>
                </div>
              </div>

              <!-- ═══ Shape Properties Tab (per-shape override) ═══ -->
              <div class="prop-form" id="form-shape">
                <div class="prop-row" style="flex-direction:column;align-items:flex-start;gap:8px;">
                  <div class="prop-label">Boundary Colour (Stroke)</div>
                  <div class="prop-swatch-grid" id="swatch-stroke"></div>
                </div>
                <div class="prop-row" style="flex-direction:column;align-items:flex-start;gap:8px;margin-top:12px;">
                  <div class="prop-label">Inner Colour (Fill)</div>
                  <div class="prop-swatch-grid" id="swatch-fill"></div>
                </div>
                <div class="prop-row" style="margin-top:16px;">
                  <div class="prop-label">Width</div>
                  <input type="number" class="prop-input" id="prop-shape-width" min="1" max="2000" />
                </div>
                <div class="prop-row">
                  <div class="prop-label">Height</div>
                  <input type="number" class="prop-input" id="prop-shape-height" min="0" max="2000" />
                </div>
              </div>

            </div><!-- /.prop-body -->

            <div class="prop-footer">
              <button class="prop-btn prop-btn-cancel" id="btn-prop-cancel">Cancel</button>
              <button class="prop-btn prop-btn-apply"  id="btn-prop-apply">Apply</button>
            </div>
          </div><!-- /.prop-content -->

        </div><!-- /.prop-modal -->
      </div><!-- /#properties-modal-overlay -->
    `;

    document.body.insertAdjacentHTML('beforeend', html);

    // ── Init swatches ─────────────────────────────────────────────
    _initPalette('swatch-bg',             'bg');
    _initPalette('swatch-grid',           'grid');
    _initPalette('swatch-stroke',         'stroke');
    _initPalette('swatch-fill',           'fill');
    _initPalette('swatch-circ-fill',      'circFill');
    _initPalette('swatch-circ-line',      'circLine');
    _initPalette('swatch-rect-fill',      'rectFill');
    _initPalette('swatch-rect-line',      'rectLine');
    // Control point swatches include 'transparent' as first option
    _initCpPalette('swatch-circ-cp-default',  'circCpDefault');
    _initCpPalette('swatch-circ-cp-hover',    'circCpHover');
    _initCpPalette('swatch-rect-cp-default',  'rectCpDefault');
    _initCpPalette('swatch-rect-cp-hover',    'rectCpHover');

    // ── Wire tab clicks ───────────────────────────────────────────
    document.querySelectorAll('.prop-sidebar-item').forEach(t => {
      t.onclick = () => {
        const targetId = t.dataset.target;
        _switchTab(targetId);
        if (targetId === 'form-canvas')    _populateCanvasForm();
        if (targetId === 'form-circle')    _populateCircleForm();
        if (targetId === 'form-rectangle') _populateRectangleForm();
        if (targetId === 'form-shape' && _activeShapeId) _populateShapeForm(_activeShapeId);
      };
    });

    // ── Footer buttons ────────────────────────────────────────────
    document.getElementById('btn-prop-cancel').onclick = close;
    document.getElementById('btn-prop-apply').onclick  = apply;
    document.getElementById('properties-modal-overlay').onclick = (e) => {
      if (e.target.id === 'properties-modal-overlay') close();
    };

    console.log('[PropertiesModal] Initialized — M3 tabs active.');
  }

  // ── Swatch helpers ────────────────────────────────────────────────

  // Control-point palette includes transparent + 6 colours + white
  const CP_PALETTE = ['transparent', ...PALETTE, '#ffffff'];

  function _initPalette(containerId, key) {
    const container = document.getElementById(containerId);
    if (!container) return;
    PALETTE.forEach(color => {
      const s = document.createElement('div');
      s.className = 'prop-swatch';
      s.style.backgroundColor = color;
      s.dataset.color = color;
      s.onclick = () => {
        container.querySelectorAll('.prop-swatch').forEach(sw => sw.classList.remove('active'));
        s.classList.add('active');
        sel[key] = color;
      };
      container.appendChild(s);
    });
  }

  function _initCpPalette(containerId, key) {
    const container = document.getElementById(containerId);
    if (!container) return;
    CP_PALETTE.forEach(color => {
      const s = document.createElement('div');
      s.className = 'prop-swatch';
      s.style.backgroundColor = color === 'transparent' ? 'transparent' : color;
      if (color === 'transparent') {
        s.style.border = '1px dashed #64748b';
        s.title = 'Transparent';
      }
      s.dataset.color = color;
      s.onclick = () => {
        container.querySelectorAll('.prop-swatch').forEach(sw => sw.classList.remove('active'));
        s.classList.add('active');
        sel[key] = color;
      };
      container.appendChild(s);
    });
  }

  function _updateSwatches(containerId, color) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.querySelectorAll('.prop-swatch').forEach(s => {
      s.classList.toggle('active', s.dataset.color.toLowerCase() === color.toLowerCase());
    });
  }

  // ── Tab switching ─────────────────────────────────────────────────
  function _switchTab(targetId) {
    document.querySelectorAll('.prop-sidebar-item').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.prop-form').forEach(f => f.classList.remove('active'));

    const tab = document.querySelector(`[data-target="${targetId}"]`);
    if (tab) tab.classList.add('active');

    const form = document.getElementById(targetId);
    if (form) form.classList.add('active');

    const titles = {
      'form-canvas':    'Global Variables — Canvas',
      'form-circle':    'Global Variables — Circle',
      'form-rectangle': 'Global Variables — Rectangle',
      'form-shape':     'Shape Properties',
    };
    const titleEl = document.getElementById('prop-header-title');
    if (titleEl) titleEl.textContent = titles[targetId] || 'Properties';

    _activeMode = targetId;
  }

  // ── Open entry points ─────────────────────────────────────────────
  function openForCanvas() {
    _activeShapeId = null;
    document.getElementById('tab-shape').classList.add('hidden');
    _switchTab('form-canvas');
    _populateCanvasForm();
    document.getElementById('properties-modal-overlay').classList.remove('hidden');
  }

  function openForShape(shapeId) {
    _activeShapeId = shapeId;
    document.getElementById('tab-shape').classList.remove('hidden');
    _switchTab('form-shape');
    _populateShapeForm(shapeId);
    document.getElementById('properties-modal-overlay').classList.remove('hidden');
  }

  function close() {
    document.getElementById('properties-modal-overlay').classList.add('hidden');
  }

  function apply() {
    switch (_activeMode) {
      case 'form-canvas':    _applyCanvasForm();    break;
      case 'form-circle':    _applyCircleForm();    break;
      case 'form-rectangle': _applyRectangleForm(); break;
      case 'form-shape':     if (_activeShapeId) _applyShapeForm(); break;
    }
    close();
  }

  // ── Populate ──────────────────────────────────────────────────────
  function _populateCanvasForm() {
    const canvas = CanvasState.getCanvas();
    if (!canvas) return;
    sel.bg   = canvas.BackgroundColor || '#f1f5f9';
    sel.grid = canvas.GridColor       || '#94a3b8';
    _updateSwatches('swatch-bg',   sel.bg);
    _updateSwatches('swatch-grid', sel.grid);
    document.getElementById('prop-grid-visible').checked = canvas.GridVisible !== false;
    document.getElementById('prop-grid-x').value         = canvas.GridSpacingX || 25;
    document.getElementById('prop-grid-y').value         = canvas.GridSpacingY || 25;
    document.getElementById('prop-show-origin').checked  = canvas.ShowOriginMarker !== false;
    document.getElementById('prop-show-axes').checked    = canvas.ShowAxes !== false;
  }

  function _populateCircleForm() {
    const gv = (CanvasState.getGlobalVars() || {}).Circle || {};
    sel.circFill   = gv.FillColor || PALETTE[0];
    sel.circLine   = gv.LineColor || PALETTE[0];
    sel.circCpDefault = gv.ResizeControlPointDefaultColor || 'transparent';
    sel.circCpHover   = gv.ResizeControlPointHoverColor   || '#ffffff';
    _updateSwatches('swatch-circ-fill',     sel.circFill);
    _updateSwatches('swatch-circ-line',     sel.circLine);
    _updateSwatches('swatch-circ-cp-default', sel.circCpDefault);
    _updateSwatches('swatch-circ-cp-hover',   sel.circCpHover);
    document.getElementById('prop-circ-linewidth').value = gv.LineWidth  || 1.5;
    document.getElementById('prop-circ-hover').value     = gv.HoverPaddingRadiusRatio      || 0.1;
    document.getElementById('prop-circ-protect').value   = gv.ProtectionPaddingRadiusRatio || 0.2;
  }

  function _populateRectangleForm() {
    const gv = (CanvasState.getGlobalVars() || {}).Rectangle || {};
    sel.rectFill      = gv.FillColor || PALETTE[0];
    sel.rectLine      = gv.LineColor || PALETTE[0];
    sel.rectCpDefault = gv.ResizeControlPointDefaultColor || 'transparent';
    sel.rectCpHover   = gv.ResizeControlPointHoverColor   || '#ffffff';
    _updateSwatches('swatch-rect-fill',     sel.rectFill);
    _updateSwatches('swatch-rect-line',     sel.rectLine);
    _updateSwatches('swatch-rect-cp-default', sel.rectCpDefault);
    _updateSwatches('swatch-rect-cp-hover',   sel.rectCpHover);
    document.getElementById('prop-rect-linewidth').value = gv.LineWidth  || 1.5;
    document.getElementById('prop-rect-hover-x').value   = gv.HoverPaddingXRatio      || 0.1;
    document.getElementById('prop-rect-hover-y').value   = gv.HoverPaddingYRatio      || 0.1;
    document.getElementById('prop-rect-protect-x').value = gv.ProtectionPaddingXRatio || 0.2;
    document.getElementById('prop-rect-protect-y').value = gv.ProtectionPaddingYRatio || 0.2;
  }

  function _populateShapeForm(shapeId) {
    const shape = CanvasState.getShapes().find(s => s.ShapeID === shapeId);
    if (!shape) return;
    sel.stroke = shape.StrokeColor || shape.Color || PALETTE[0];
    sel.fill   = shape.FillColor   || shape.Color || PALETTE[0];
    _updateSwatches('swatch-stroke', sel.stroke);
    _updateSwatches('swatch-fill',   sel.fill);
    document.getElementById('prop-shape-width').value  = shape.Width;
    document.getElementById('prop-shape-height').value = shape.Height;
  }

  // ── Apply ─────────────────────────────────────────────────────────
  function _applyCanvasForm() {
    CanvasState.updateCanvas({
      BackgroundColor:  sel.bg,
      GridVisible:      document.getElementById('prop-grid-visible').checked,
      GridColor:        sel.grid,
      GridSpacingX:     parseInt(document.getElementById('prop-grid-x').value, 10),
      GridSpacingY:     parseInt(document.getElementById('prop-grid-y').value, 10),
      ShowOriginMarker: document.getElementById('prop-show-origin').checked,
      ShowAxes:         document.getElementById('prop-show-axes').checked,
    });
    RenderCanvas.render();
    if (typeof HistoryManager !== 'undefined') HistoryManager.recordState();
    if (typeof DirtyTracker   !== 'undefined') DirtyTracker.markDirty();
  }

  function _applyCircleForm() {
    const hoverR   = parseFloat(document.getElementById('prop-circ-hover').value)   || 0.1;
    const protectR = parseFloat(document.getElementById('prop-circ-protect').value) || 0.2;

    if (protectR <= hoverR) {
      alert('Protection Radius Ratio must be greater than Hover Radius Ratio.\nPlease adjust and try again.');
      return;
    }

    CanvasState.updateGlobalVars('Circle', {
      FillColor:                     sel.circFill,
      LineColor:                     sel.circLine,
      LineWidth:                     parseFloat(document.getElementById('prop-circ-linewidth').value) || 1.5,
      HoverPaddingRadiusRatio:       hoverR,
      ProtectionPaddingRadiusRatio:  protectR,
      ResizeControlPointDefaultColor: sel.circCpDefault,
      ResizeControlPointHoverColor:   sel.circCpHover,
    });
    if (typeof DirtyTracker !== 'undefined') DirtyTracker.markDirty();
  }

  function _applyRectangleForm() {
    const hX = parseFloat(document.getElementById('prop-rect-hover-x').value)   || 0.1;
    const hY = parseFloat(document.getElementById('prop-rect-hover-y').value)   || 0.1;
    const pX = parseFloat(document.getElementById('prop-rect-protect-x').value) || 0.2;
    const pY = parseFloat(document.getElementById('prop-rect-protect-y').value) || 0.2;

    if (pX <= hX || pY <= hY) {
      alert('Protection Padding must be greater than Hover Padding on both axes.\nPlease adjust and try again.');
      return;
    }

    CanvasState.updateGlobalVars('Rectangle', {
      FillColor:                     sel.rectFill,
      LineColor:                     sel.rectLine,
      LineWidth:                     parseFloat(document.getElementById('prop-rect-linewidth').value) || 1.5,
      HoverPaddingXRatio:            hX,
      HoverPaddingYRatio:            hY,
      ProtectionPaddingXRatio:       pX,
      ProtectionPaddingYRatio:       pY,
      ResizeControlPointDefaultColor: sel.rectCpDefault,
      ResizeControlPointHoverColor:   sel.rectCpHover,
    });
    if (typeof DirtyTracker !== 'undefined') DirtyTracker.markDirty();
  }

  function _applyShapeForm() {
    const w = parseInt(document.getElementById('prop-shape-width').value, 10);
    const h = parseInt(document.getElementById('prop-shape-height').value, 10);
    const shape = CanvasState.getShapes().find(s => s.ShapeID === _activeShapeId);
    if (!shape) return;

    // Surgically recolor SVG icon string
    let newSvg = shape.SvgIcon;
    if (newSvg) {
      newSvg = newSvg.replace(/fill="([^"]*)"/g, (match, p1) => {
        if (p1 === 'none' || p1 === 'currentColor' || p1 === '') return match;
        return `fill="${sel.fill}"`;
      });
      newSvg = newSvg.replace(/stroke="([^"]*)"/g, (match, p1) => {
        if (p1 === 'none' || p1 === 'currentColor' || p1 === '') return match;
        return `stroke="${sel.stroke}"`;
      });
    }

    CanvasState.updateShape(_activeShapeId, {
      Width:       w,
      Height:      h,
      HalfWidth:   w / 2,
      HalfHeight:  h / 2,
      StrokeColor: sel.stroke,
      FillColor:   sel.fill,
      Color:       sel.fill,
      SvgIcon:     newSvg,
    });

    RenderCanvas.render();
    if (typeof HistoryManager !== 'undefined') HistoryManager.recordState();
    if (typeof DirtyTracker   !== 'undefined') DirtyTracker.markDirty();
  }

  return { init, openForCanvas, openForShape, close };

})();

