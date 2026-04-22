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
            <div class="prop-sidebar-item active" id="tab-canvas" data-target="form-canvas">Canvas</div>
            <div class="prop-sidebar-item hidden" id="tab-shape" data-target="form-shape">Shape Properties</div>
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

              <!-- Shape Form -->
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
              </div>
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

    // Initial Palette setup
    _initPalette('swatch-grid-bg',     'bg');
    _initPalette('swatch-grid-grid',   'grid');
    _initPalette('swatch-grid-stroke', 'stroke');
    _initPalette('swatch-grid-fill',   'fill');

    // Bindings
    document.getElementById('btn-prop-cancel').onclick = close;
    document.getElementById('btn-prop-apply').onclick = apply;
    document.getElementById('properties-modal-overlay').onclick = (e) => {
      if (e.target.id === 'properties-modal-overlay') close();
    };

    const tabs = document.querySelectorAll('.prop-sidebar-item');
    tabs.forEach(t => t.onclick = (e) => _switchTab(e.target.dataset.target));

    console.log('[PropertiesModal] Initialized.');
  }

  const PALETTE = [
    '#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#0ea5e9', '#64748b', 
    '#ffffff', '#f1f5f9', '#94a3b8', '#1e293b', '#0f172a', '#000000'
  ];
  let _selectedStroke = PALETTE[0];
  let _selectedFill   = PALETTE[0];
  let _selectedBg     = PALETTE[7]; // Default light gray
  let _selectedGrid   = PALETTE[8]; // Default slate gray

  function _initPalette(containerId, type) {
    const container = document.getElementById(containerId);
    PALETTE.forEach(color => {
      const swatch = document.createElement('div');
      swatch.className = 'prop-swatch';
      swatch.style.backgroundColor = color;
      swatch.dataset.color = color;
      swatch.onclick = () => {
        container.querySelectorAll('.prop-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        if (type === 'stroke') _selectedStroke = color;
        else if (type === 'fill') _selectedFill = color;
        else if (type === 'bg') _selectedBg = color;
        else if (type === 'grid') _selectedGrid = color;
      };
      container.appendChild(swatch);
    });
  }

  function _switchTab(targetId) {
    document.querySelectorAll('.prop-sidebar-item').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.prop-form').forEach(f => f.classList.remove('active'));
    
    const tab = document.querySelector(`[data-target="${targetId}"]`);
    if (tab) tab.classList.add('active');
    
    const form = document.getElementById(targetId);
    if (form) form.classList.add('active');

    const title = document.getElementById('prop-header-title');
    if (targetId === 'form-canvas') title.textContent = 'Global Variables - Canvas';
    if (targetId === 'form-shape') title.textContent = 'Shape Properties';
    
    _activeMode = targetId;
  }

  function openForCanvas() {
    _activeShapeId = null;
    document.getElementById('tab-shape').style.display = 'none';
    _switchTab('form-canvas');
    _populateCanvasForm();
    document.getElementById('properties-modal-overlay').classList.remove('hidden');
  }

  function openForShape(shapeId) {
    _activeShapeId = shapeId;
    document.getElementById('tab-shape').style.display = 'block';
    _switchTab('form-shape');
    _populateShapeForm(shapeId);
    document.getElementById('properties-modal-overlay').classList.remove('hidden');
  }

  function close() {
    document.getElementById('properties-modal-overlay').classList.add('hidden');
  }

  function apply() {
    if (_activeMode === 'form-canvas') {
      _applyCanvasForm();
    } else if (_activeMode === 'form-shape' && _activeShapeId) {
      _applyShapeForm();
    }
    close();
  }

  // --- Populate ---
  function _populateCanvasForm() {
    const canvas = CanvasState.getCanvas();
    if (!canvas) return;

    _selectedBg   = canvas.BackgroundColor || PALETTE[7];
    _selectedGrid = canvas.GridColor       || PALETTE[8];

    _updateActiveSwatches('swatch-grid-bg',   _selectedBg);
    _updateActiveSwatches('swatch-grid-grid', _selectedGrid);

    document.getElementById('prop-grid-visible').checked = canvas.GridVisible !== false;
    document.getElementById('prop-grid-x').value = canvas.GridSpacingX || 25;
    document.getElementById('prop-grid-y').value = canvas.GridSpacingY || 25;
    document.getElementById('prop-show-origin').checked = canvas.ShowOriginMarker !== false;
    document.getElementById('prop-show-axes').checked = canvas.ShowAxes !== false;
  }

  function _populateShapeForm(shapeId) {
    const shapes = CanvasState.getShapes();
    const shape = shapes.find(s => s.ShapeID === shapeId);
    if (!shape) return;

    _selectedStroke = shape.StrokeColor || shape.Color || PALETTE[0];
    _selectedFill   = shape.FillColor   || shape.Color || PALETTE[0];

    _updateActiveSwatches('swatch-grid-stroke', _selectedStroke);
    _updateActiveSwatches('swatch-grid-fill',   _selectedFill);

    document.getElementById('prop-shape-width').value = shape.Width;
    document.getElementById('prop-shape-height').value = shape.Height;
  }

  function _updateActiveSwatches(containerId, color) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.querySelectorAll('.prop-swatch').forEach(s => {
      s.classList.toggle('active', s.dataset.color.toLowerCase() === color.toLowerCase());
    });
  }

  // --- Apply ---
  function _applyCanvasForm() {
    CanvasState.updateCanvas({
      BackgroundColor: _selectedBg,
      GridVisible: document.getElementById('prop-grid-visible').checked,
      GridColor: _selectedGrid,
      GridSpacingX: parseInt(document.getElementById('prop-grid-x').value, 10),
      GridSpacingY: parseInt(document.getElementById('prop-grid-y').value, 10),
      ShowOriginMarker: document.getElementById('prop-show-origin').checked,
      ShowAxes: document.getElementById('prop-show-axes').checked
    });
    RenderCanvas.render();
    if (typeof HistoryManager !== 'undefined') HistoryManager.recordState();
  }

  function _applyShapeForm() {
    const w = parseInt(document.getElementById('prop-shape-width').value, 10);
    const h = parseInt(document.getElementById('prop-shape-height').value, 10);

    const shapes = CanvasState.getShapes();
    const shape = shapes.find(s => s.ShapeID === _activeShapeId);
    if (!shape) return;

    // Replace color in SVG icon string surgically using regex
    let newSvg = shape.SvgIcon;
    if (newSvg) {
      // Replace fill (only if it's a color, not none/currentColor)
      newSvg = newSvg.replace(/fill="([^"]*)"/g, (match, p1) => {
          if (p1 === 'none' || p1 === 'currentColor' || p1 === '') return match;
          return `fill="${_selectedFill}"`;
      });
      // Replace stroke (only if it's a color, not none/currentColor)
      newSvg = newSvg.replace(/stroke="([^"]*)"/g, (match, p1) => {
          if (p1 === 'none' || p1 === 'currentColor' || p1 === '') return match;
          return `stroke="${_selectedStroke}"`;
      });
    }

    CanvasState.updateShape(_activeShapeId, {
      Width: w,
      Height: h,
      StrokeColor: _selectedStroke,
      FillColor: _selectedFill,
      Color: _selectedFill, // Sync legacy Color to Fill for partial support
      SvgIcon: newSvg
    });

    RenderCanvas.render();
    if (typeof HistoryManager !== 'undefined') HistoryManager.recordState();
  }

  return { init, openForCanvas, openForShape, close };

})();
