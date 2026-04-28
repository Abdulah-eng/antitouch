/**
 * properties-modal.js
 * ===================
 * Manages the Global Variables and Shape Properties modal.
 */

'use strict';

const PropertiesModal = (() => {

  let _activeMode = 'canvas';
  let _activeShapeId = null;

  function init() {
    const html = `
      <div id="properties-modal-overlay" class="hidden">
        <div class="prop-modal">
          <div class="prop-sidebar">
            <div class="prop-sidebar-item active" id="tab-canvas"  data-target="form-canvas">Canvas</div>
            <div class="prop-sidebar-item"         id="tab-rect"   data-target="form-rect">Rectangle</div>
            <div class="prop-sidebar-item"         id="tab-circle" data-target="form-circle">Circle</div>
            <div class="prop-sidebar-item hidden"  id="tab-shape"  data-target="form-shape">Shape Properties</div>
          </div>
          <div class="prop-content">
            <div class="prop-header" id="prop-header-title">Global Variables - Canvas</div>
            
            <div class="prop-body">
              <!-- Canvas Form -->
              <div class="prop-form active" id="form-canvas">
                <div class="prop-row" style="flex-direction: column; align-items: flex-start; gap: 8px;">
                  <div class="prop-label">Background color</div>
                  <div class="prop-swatch-grid" id="swatch-grid-bg"></div>
                </div>
                <div class="prop-row" style="margin-top: 12px;">
                  <div class="prop-label">Grid visible</div>
                  <div class="prop-checkbox-wrap">
                    <input type="checkbox" class="prop-input" id="prop-grid-visible" />
                    <span>Enabled</span>
                  </div>
                </div>
                <div class="prop-row" style="flex-direction: column; align-items: flex-start; gap: 8px; margin-top: 12px;">
                  <div class="prop-label">Grid color</div>
                  <div class="prop-swatch-grid" id="swatch-grid-grid"></div>
                </div>
                <div class="prop-row" style="margin-top: 12px;">
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
                <div class="prop-hint">Rule: when Grid visible is unchecked, GridColor, GridSpacingX, GridSpacingY, ShowOriginMarker, and ShowAxes are disabled.</div>
              </div>

              <!-- Rectangle Global Defaults Form -->
              <div class="prop-form" id="form-rect">
                <div class="prop-row" style="flex-direction:column;align-items:flex-start;gap:8px;">
                  <div class="prop-label">Default Fill Colour</div>
                  <div class="prop-swatch-grid" id="swatch-rect-fill"></div>
                </div>
                <div class="prop-row" style="flex-direction:column;align-items:flex-start;gap:8px;margin-top:12px;">
                  <div class="prop-label">Default Stroke Colour</div>
                  <div class="prop-swatch-grid" id="swatch-rect-stroke"></div>
                </div>
                <div class="prop-row" style="margin-top:14px;">
                  <div class="prop-label">HoverPaddingXRatio</div>
                  <input type="number" class="prop-input" id="prop-rect-hover-x" min="0" max="1" step="0.01" />
                </div>
                <div class="prop-row">
                  <div class="prop-label">HoverPaddingYRatio</div>
                  <input type="number" class="prop-input" id="prop-rect-hover-y" min="0" max="1" step="0.01" />
                </div>
                <div class="prop-row">
                  <div class="prop-label">ProtectionPaddingXRatio</div>
                  <input type="number" class="prop-input" id="prop-rect-protect-x" min="0" max="2" step="0.01" />
                </div>
                <div class="prop-row">
                  <div class="prop-label">ProtectionPaddingYRatio</div>
                  <input type="number" class="prop-input" id="prop-rect-protect-y" min="0" max="2" step="0.01" />
                </div>
                <div class="prop-row" style="flex-direction:column;align-items:flex-start;gap:8px;margin-top:12px;">
                  <div class="prop-label">Resize Control Point (default)</div>
                  <div class="prop-swatch-grid" id="swatch-rect-cp-default"></div>
                </div>
                <div class="prop-row" style="flex-direction:column;align-items:flex-start;gap:8px;margin-top:8px;">
                  <div class="prop-label">Resize Control Point (hover/active)</div>
                  <div class="prop-swatch-grid" id="swatch-rect-cp-active"></div>
                </div>
                <div class="prop-hint">Rule: ProtectionPaddingRatio must always be greater than HoverPaddingRatio.</div>
              </div>

              <!-- Circle Global Defaults Form -->
              <div class="prop-form" id="form-circle">
                <div class="prop-row" style="flex-direction:column;align-items:flex-start;gap:8px;">
                  <div class="prop-label">Default Fill Colour</div>
                  <div class="prop-swatch-grid" id="swatch-circle-fill"></div>
                </div>
                <div class="prop-row" style="flex-direction:column;align-items:flex-start;gap:8px;margin-top:12px;">
                  <div class="prop-label">Default Stroke Colour</div>
                  <div class="prop-swatch-grid" id="swatch-circle-stroke"></div>
                </div>
                <div class="prop-row" style="margin-top:14px;">
                  <div class="prop-label">HoverPaddingRadiusRatio</div>
                  <input type="number" class="prop-input" id="prop-circle-hover" min="0" max="1" step="0.01" />
                </div>
                <div class="prop-row">
                  <div class="prop-label">ProtectionPaddingRadiusRatio</div>
                  <input type="number" class="prop-input" id="prop-circle-protect" min="0" max="2" step="0.01" />
                </div>
                <div class="prop-row" style="flex-direction:column;align-items:flex-start;gap:8px;margin-top:12px;">
                  <div class="prop-label">Resize Control Point (default)</div>
                  <div class="prop-swatch-grid" id="swatch-circle-cp-default"></div>
                </div>
                <div class="prop-row" style="flex-direction:column;align-items:flex-start;gap:8px;margin-top:8px;">
                  <div class="prop-label">Resize Control Point (hover/active)</div>
                  <div class="prop-swatch-grid" id="swatch-circle-cp-active"></div>
                </div>
                <div class="prop-hint">Rule: ProtectionPaddingRatio must always be greater than HoverPaddingRatio.</div>
              </div>
              
              <!-- Shape Properties Form -->
              <div class="prop-form" id="form-shape">
                 <div class="prop-row" style="flex-direction: column; align-items: flex-start; gap: 8px;">
                   <div class="prop-label">Boundary Colour (Stroke)</div>
                   <div class="prop-swatch-grid" id="swatch-grid-stroke"></div>
                 </div>
                 <div class="prop-row" style="flex-direction: column; align-items: flex-start; gap: 8px; margin-top: 12px;">
                   <div class="prop-label">Inner Colour (Fill)</div>
                   <div class="prop-swatch-grid" id="swatch-grid-fill"></div>
                 </div>
                 <div class="prop-row" style="margin-top: 16px;">
                   <div class="prop-label">Width</div>
                   <input type="number" class="prop-input" id="prop-shape-width" min="1" max="2000" />
                 </div>
                 <div class="prop-row">
                   <div class="prop-label">Height</div>
                   <input type="number" class="prop-input" id="prop-shape-height" min="0" max="2000" />
                 </div>
               </div><!-- /form-shape -->
             </div>

            <div class="prop-footer">
              <button class="prop-btn prop-btn-cancel" id="btn-prop-cancel">Cancel</button>
              <button class="prop-btn prop-btn-apply" id="btn-prop-apply">Apply</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    // Bindings
    document.getElementById('btn-prop-cancel').onclick = close;
    document.getElementById('btn-prop-apply').onclick = apply;
    document.getElementById('properties-modal-overlay').onclick = (e) => {
      if (e.target.id === 'properties-modal-overlay') close();
    };

    const tabs = document.querySelectorAll('.prop-sidebar-item');
    tabs.forEach(t => t.onclick = (e) => _switchTab(e.target.dataset.target));

    // Initialise ALL palette grids upfront so swatches exist when any tab is opened
    _initPalette('swatch-grid-bg',         'bg');
    _initPalette('swatch-grid-grid',       'gridColor');
    _initPalette('swatch-grid-stroke',     'stroke');
    _initPalette('swatch-grid-fill',       'fill');
    _initPalette('swatch-rect-fill',       'rectFill');
    _initPalette('swatch-rect-stroke',     'rectStroke');
    _initPalette('swatch-rect-cp-default', 'rectCpDefault');
    _initPalette('swatch-rect-cp-active',  'rectCpActive');
    _initPalette('swatch-circle-fill',       'circleFill');
    _initPalette('swatch-circle-stroke',     'circleStroke');
    _initPalette('swatch-circle-cp-default', 'circleCpDefault');
    _initPalette('swatch-circle-cp-active',  'circleCpActive');

    console.log('[PropertiesModal] Initialized.');
  }

  // ── Colour palette ────────────────────────────────────────────────
  const PALETTE = [
    '#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#0ea5e9',
    '#64748b', '#ffffff', '#1e293b', '#000000'
  ];

  // Selected-state variables
  let _selectedStroke      = PALETTE[0];
  let _selectedFill        = PALETTE[0];
  let _selectedBg          = PALETTE[6]; // white
  let _selectedGrid        = PALETTE[5]; // slate

  let _selectedRectFill      = PALETTE[0];
  let _selectedRectStroke    = PALETTE[0];
  let _selectedRectCpDefault = PALETTE[6]; // white
  let _selectedRectCpActive  = PALETTE[2]; // amber

  let _selectedCircleFill      = PALETTE[0];
  let _selectedCircleStroke    = PALETTE[0];
  let _selectedCircleCpDefault = PALETTE[6];
  let _selectedCircleCpActive  = PALETTE[2];

  function _initPalette(containerId, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    PALETTE.forEach(color => {
      const swatch = document.createElement('div');
      swatch.className = 'prop-swatch';
      swatch.style.backgroundColor = color;
      swatch.dataset.color = color;
      swatch.onclick = () => {
        container.querySelectorAll('.prop-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        if      (type === 'stroke')         _selectedStroke         = color;
        else if (type === 'fill')           _selectedFill           = color;
        else if (type === 'bg')             _selectedBg             = color;
        else if (type === 'gridColor')      _selectedGrid           = color;
        else if (type === 'rectFill')       _selectedRectFill       = color;
        else if (type === 'rectStroke')     _selectedRectStroke     = color;
        else if (type === 'rectCpDefault')  _selectedRectCpDefault  = color;
        else if (type === 'rectCpActive')   _selectedRectCpActive   = color;
        else if (type === 'circleFill')     _selectedCircleFill     = color;
        else if (type === 'circleStroke')   _selectedCircleStroke   = color;
        else if (type === 'circleCpDefault') _selectedCircleCpDefault = color;
        else if (type === 'circleCpActive') _selectedCircleCpActive  = color;
      };
      container.appendChild(swatch);
    });
  }

  // ── Tab switching ─────────────────────────────────────────────────
  function _switchTab(targetId) {
    if (!targetId) return;
    document.querySelectorAll('.prop-sidebar-item').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.prop-form').forEach(f => f.classList.remove('active'));

    const tab  = document.querySelector(`[data-target="${targetId}"]`);
    const form = document.getElementById(targetId);
    if (tab)  tab.classList.add('active');
    if (form) form.classList.add('active');

    const title = document.getElementById('prop-header-title');
    const titles = {
      'form-canvas': 'Global Variables – Canvas',
      'form-rect':   'Global Variables – Rectangle',
      'form-circle': 'Global Variables – Circle',
      'form-shape':  'Shape Properties',
    };
    if (title) title.textContent = titles[targetId] || 'Properties';

    _activeMode = targetId;

    // Auto-populate the newly opened tab
    if (targetId === 'form-canvas')  _populateCanvasForm();
    if (targetId === 'form-rect')    _populateRectForm();
    if (targetId === 'form-circle')  _populateCircleForm();
  }

  // ── Open functions ────────────────────────────────────────────────
  function openForCanvas() {
    _activeShapeId = null;
    document.getElementById('tab-shape').classList.add('hidden');
    _switchTab('form-canvas');
    document.getElementById('properties-modal-overlay').classList.remove('hidden');
    
    // Init palettes if not done
    _initPalette('swatch-grid-bg',   'bg');
    _initPalette('swatch-grid-grid', 'gridColor');
  }

  function openForShape(shapeId) {
    _activeShapeId = shapeId;
    document.getElementById('tab-shape').classList.remove('hidden');
    _switchTab('form-shape');
    _populateShapeForm(shapeId);
    document.getElementById('properties-modal-overlay').classList.remove('hidden');

    _initPalette('swatch-grid-stroke', 'stroke');
    _initPalette('swatch-grid-fill',   'fill');
  }

  function close() {
    document.getElementById('properties-modal-overlay').classList.add('hidden');
  }

  function apply() {
    if      (_activeMode === 'form-canvas') _applyCanvasForm();
    else if (_activeMode === 'form-rect')   _applyRectForm();
    else if (_activeMode === 'form-circle') _applyCircleForm();
    else if (_activeMode === 'form-shape' && _activeShapeId) _applyShapeForm();
    close();
  }

  // ── Populate helpers ──────────────────────────────────────────────
  function _populateCanvasForm() {
    const canvas = CanvasState.getCanvas();
    if (!canvas) return;
    _selectedBg   = canvas.BackgroundColor || PALETTE[6];
    _selectedGrid = canvas.GridColor       || PALETTE[5];
    _updateActiveSwatches('swatch-grid-bg',   _selectedBg);
    _updateActiveSwatches('swatch-grid-grid', _selectedGrid);
    document.getElementById('prop-grid-visible').checked  = canvas.GridVisible !== false;
    document.getElementById('prop-grid-x').value          = canvas.GridSpacingX || 25;
    document.getElementById('prop-grid-y').value          = canvas.GridSpacingY || 25;
    document.getElementById('prop-show-origin').checked   = canvas.ShowOriginMarker !== false;
    document.getElementById('prop-show-axes').checked     = canvas.ShowAxes !== false;
  }

  function _populateRectForm() {
    const gv = CanvasState.getGlobalVars();
    const r  = gv.Rectangle;
    _selectedRectFill      = r.DefaultFillColor;
    _selectedRectStroke    = r.DefaultStrokeColor;
    _selectedRectCpDefault = r.ControlPointColorDefault;
    _selectedRectCpActive  = r.ControlPointColorActive;
    _updateActiveSwatches('swatch-rect-fill',       _selectedRectFill);
    _updateActiveSwatches('swatch-rect-stroke',     _selectedRectStroke);
    _updateActiveSwatches('swatch-rect-cp-default', _selectedRectCpDefault);
    _updateActiveSwatches('swatch-rect-cp-active',  _selectedRectCpActive);
    document.getElementById('prop-rect-hover-x').value    = r.HoverPaddingXRatio;
    document.getElementById('prop-rect-hover-y').value    = r.HoverPaddingYRatio;
    document.getElementById('prop-rect-protect-x').value  = r.ProtectionPaddingXRatio;
    document.getElementById('prop-rect-protect-y').value  = r.ProtectionPaddingYRatio;
  }

  function _populateCircleForm() {
    const gv = CanvasState.getGlobalVars();
    const c  = gv.Circle;
    _selectedCircleFill      = c.DefaultFillColor;
    _selectedCircleStroke    = c.DefaultStrokeColor;
    _selectedCircleCpDefault = c.ControlPointColorDefault;
    _selectedCircleCpActive  = c.ControlPointColorActive;
    _updateActiveSwatches('swatch-circle-fill',       _selectedCircleFill);
    _updateActiveSwatches('swatch-circle-stroke',     _selectedCircleStroke);
    _updateActiveSwatches('swatch-circle-cp-default', _selectedCircleCpDefault);
    _updateActiveSwatches('swatch-circle-cp-active',  _selectedCircleCpActive);
    document.getElementById('prop-circle-hover').value   = c.HoverPaddingRadiusRatio;
    document.getElementById('prop-circle-protect').value = c.ProtectionPaddingRadiusRatio;
  }

  function _populateShapeForm(shapeId) {
    const shape = CanvasState.getShapes().find(s => s.ShapeID === shapeId);
    if (!shape) return;
    _selectedStroke = shape.StrokeColor || shape.Color || PALETTE[0];
    _selectedFill   = shape.FillColor   || shape.Color || PALETTE[0];
    _updateActiveSwatches('swatch-grid-stroke', _selectedStroke);
    _updateActiveSwatches('swatch-grid-fill',   _selectedFill);
    document.getElementById('prop-shape-width').value  = shape.Width;
    document.getElementById('prop-shape-height').value = shape.Height;
  }

  function _updateActiveSwatches(containerId, color) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.querySelectorAll('.prop-swatch').forEach(s => {
      s.classList.toggle('active', s.dataset.color.toLowerCase() === color.toLowerCase());
    });
  }

  // ── Apply helpers ─────────────────────────────────────────────────
  function _applyCanvasForm() {
    CanvasState.updateCanvas({
      BackgroundColor:  _selectedBg,
      GridVisible:      document.getElementById('prop-grid-visible').checked,
      GridColor:        _selectedGrid,
      GridSpacingX:     parseInt(document.getElementById('prop-grid-x').value, 10),
      GridSpacingY:     parseInt(document.getElementById('prop-grid-y').value, 10),
      ShowOriginMarker: document.getElementById('prop-show-origin').checked,
      ShowAxes:         document.getElementById('prop-show-axes').checked,
    });
    RenderCanvas.render();
    if (typeof HistoryManager !== 'undefined') HistoryManager.recordState();
  }

  function _applyRectForm() {
    const hx = parseFloat(document.getElementById('prop-rect-hover-x').value);
    const hy = parseFloat(document.getElementById('prop-rect-hover-y').value);
    const px = parseFloat(document.getElementById('prop-rect-protect-x').value);
    const py = parseFloat(document.getElementById('prop-rect-protect-y').value);

    // M3 validation: ProtectionPadding must be > HoverPadding
    if (px <= hx || py <= hy) {
      alert('Validation error: ProtectionPaddingRatio must be greater than HoverPaddingRatio on both axes.');
      return;
    }
    CanvasState.updateGlobalVars({ Rectangle: {
      DefaultFillColor:         _selectedRectFill,
      DefaultStrokeColor:       _selectedRectStroke,
      ControlPointColorDefault: _selectedRectCpDefault,
      ControlPointColorActive:  _selectedRectCpActive,
      HoverPaddingXRatio:       hx,
      HoverPaddingYRatio:       hy,
      ProtectionPaddingXRatio:  px,
      ProtectionPaddingYRatio:  py,
    }});
    if (typeof DirtyTracker !== 'undefined') DirtyTracker.markDirty();
    console.log('[PropertiesModal] Rectangle global vars applied.');
  }

  function _applyCircleForm() {
    const h = parseFloat(document.getElementById('prop-circle-hover').value);
    const p = parseFloat(document.getElementById('prop-circle-protect').value);

    // M3 validation: ProtectionPadding must be > HoverPadding
    if (p <= h) {
      alert('Validation error: ProtectionPaddingRadiusRatio must be greater than HoverPaddingRadiusRatio.');
      return;
    }
    CanvasState.updateGlobalVars({ Circle: {
      DefaultFillColor:          _selectedCircleFill,
      DefaultStrokeColor:        _selectedCircleStroke,
      ControlPointColorDefault:  _selectedCircleCpDefault,
      ControlPointColorActive:   _selectedCircleCpActive,
      HoverPaddingRadiusRatio:   h,
      ProtectionPaddingRadiusRatio: p,
    }});
    if (typeof DirtyTracker !== 'undefined') DirtyTracker.markDirty();
    console.log('[PropertiesModal] Circle global vars applied.');
  }

  function _applyShapeForm() {
    const w = parseInt(document.getElementById('prop-shape-width').value, 10);
    const h = parseInt(document.getElementById('prop-shape-height').value, 10);
    const shape = CanvasState.getShapes().find(s => s.ShapeID === _activeShapeId);
    if (!shape) return;

    let newSvg = shape.SvgIcon;
    if (newSvg) {
      newSvg = newSvg.replace(/fill="([^"]*)"/g, (match, p1) => {
        if (p1 === 'none' || p1 === 'currentColor' || p1 === '') return match;
        return `fill="${_selectedFill}"`;
      });
      newSvg = newSvg.replace(/stroke="([^"]*)"/g, (match, p1) => {
        if (p1 === 'none' || p1 === 'currentColor' || p1 === '') return match;
        return `stroke="${_selectedStroke}"`;
      });
    }

    CanvasState.updateShape(_activeShapeId, {
      Width: w, Height: h,
      StrokeColor: _selectedStroke,
      FillColor:   _selectedFill,
      Color:       _selectedFill,
      SvgIcon:     newSvg,
    });

    RenderCanvas.render();
    if (typeof HistoryManager !== 'undefined') HistoryManager.recordState();
    if (typeof DirtyTracker   !== 'undefined') DirtyTracker.markDirty();
  }

  return { init, openForCanvas, openForShape, close };

})();
