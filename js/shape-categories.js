/**
 * shape-categories.js
 * ===================
 * Milestone 4 — AWS / Azure / GCP Cloud Shape Library.
 *
 * Structure:
 *   - AWS:   Region → VPC → Availability Zone → Route Table  (fully implemented)
 *   - Azure: placeholder (Coming Soon items)
 *   - GCP:   placeholder (Coming Soon items)
 *
 * Each item carries:
 *   id, type (must match ShapeHierarchyModel.ShapeType), label,
 *   categoryId, svgIcon, parentType (null = canvas root)
 */

'use strict';

const ShapeCategories = (() => {

  // ── SVG helpers ────────────────────────────────────────────────────────────

  function _svgLine(c = '#10b981') {
    return `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="6" y1="20" x2="34" y2="20" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`;
  }

  function _svgCircle(c = '#6366f1') {
    return `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="14" fill="${c}" fill-opacity="0.1" stroke="${c}" stroke-width="2"/>
    </svg>`;
  }

  function _svgRectangle(c = '#f59e0b') {
    return `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="10" width="28" height="20" fill="${c}" fill-opacity="0.1" stroke="${c}" stroke-width="2"/>
    </svg>`;
  }

  /** Dashed rectangle — used for AWS boundary shapes */
  function _awsBoundaryRect(color, label) {
    return `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="34" height="34" rx="2"
            fill="${color}" fill-opacity="0.12"
            stroke="${color}" stroke-width="1.8" stroke-dasharray="4 2"/>
      <text x="20" y="26" text-anchor="middle" font-size="7"
            fill="${color}" font-family="sans-serif" font-weight="600">${label}</text>
    </svg>`;
  }

  /** Solid rounded rect — used for inner resource shapes */
  function _awsSolidRect(color, label) {
    return `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="8" width="32" height="24" rx="3"
            fill="${color}" fill-opacity="0.18"
            stroke="${color}" stroke-width="1.8"/>
      <text x="20" y="24" text-anchor="middle" font-size="6.5"
            fill="${color}" font-family="sans-serif" font-weight="600">${label}</text>
    </svg>`;
  }

  /** Coming Soon placeholder */
  function _placeholderRect(color) {
    return `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="32" height="32" rx="4"
            fill="${color}" fill-opacity="0.06"
            stroke="${color}" stroke-width="1.4" stroke-dasharray="3 3"/>
      <text x="20" y="24" text-anchor="middle" font-size="5.5"
            fill="${color}" font-family="sans-serif">Soon</text>
    </svg>`;
  }

  // ── Category definitions ──────────────────────────────────────────────────

  const _categories = [
    {
      id:           'basic-shapes',
      name:         'Basic Shapes',
      icon:         _svgRectangle('#6366f1'),
      displayOrder: 0,
      isPlaceholder: false,
    },
    {
      id:           'aws',
      name:         'AWS',
      icon:         _awsBoundaryRect('#f59e0b', 'AWS'),
      displayOrder: 1,
      isPlaceholder: false,
    },
    {
      id:           'azure',
      name:         'Azure',
      icon:         _placeholderRect('#0ea5e9'),
      displayOrder: 2,
      isPlaceholder: true,
      placeholderMessage: 'Azure shapes — Coming Soon',
    },
    {
      id:           'gcp',
      name:         'GCP',
      icon:         _placeholderRect('#10b981'),
      displayOrder: 3,
      isPlaceholder: true,
      placeholderMessage: 'GCP shapes — Coming Soon',
    },
  ];

  // ── Items per category ────────────────────────────────────────────────────

  const _itemsByCategory = {

    // ── Basic Shapes ───────────────────────────────────────────────
    'basic-shapes': [
      {
        id:         'shape-line',
        type:       'line',
        label:      'Line',
        categoryId: 'basic-shapes',
        parentType: null,
        svgIcon:    _svgLine('#10b981'),
        defaultWidth:  80,
        defaultHeight: 0,
        fillColor:  '#10b981',
        strokeColor:'#10b981',
      },
      {
        id:         'shape-circle',
        type:       'circle',
        label:      'Circle',
        categoryId: 'basic-shapes',
        parentType: null,
        svgIcon:    _svgCircle('#6366f1'),
        defaultWidth:  80,
        defaultHeight: 80,
        fillColor:  '#6366f1',
        strokeColor:'#6366f1',
      },
      {
        id:         'shape-rectangle',
        type:       'rectangle',
        label:      'Rectangle',
        categoryId: 'basic-shapes',
        parentType: null,
        svgIcon:    _svgRectangle('#f59e0b'),
        defaultWidth:  100,
        defaultHeight: 60,
        fillColor:  '#f59e0b',
        strokeColor:'#f59e0b',
      },
    ],

    // ── AWS ────────────────────────────────────────────────────────
    'aws': [
      {
        id:         'aws-region',
        type:       'aws-region',
        label:      'Region',
        categoryId: 'aws',
        parentType: null,           // drops directly on canvas root
        svgIcon:    _awsBoundaryRect('#f59e0b', 'Region'),
        defaultWidth:  360,
        defaultHeight: 280,
        fillColor:  '#f59e0b',
        strokeColor:'#f59e0b',
      },
      {
        id:         'aws-vpc',
        type:       'aws-vpc',
        label:      'VPC',
        categoryId: 'aws',
        parentType: 'aws-region',  // must be inside a Region
        svgIcon:    _awsBoundaryRect('#6366f1', 'VPC'),
        defaultWidth:  280,
        defaultHeight: 220,
        fillColor:  '#6366f1',
        strokeColor:'#6366f1',
      },
      {
        id:         'aws-availability-zone',
        type:       'aws-availability-zone',
        label:      'Availability Zone',
        categoryId: 'aws',
        parentType: 'aws-vpc',     // must be inside a VPC
        svgIcon:    _awsBoundaryRect('#0ea5e9', 'AZ'),
        defaultWidth:  200,
        defaultHeight: 160,
        fillColor:  '#0ea5e9',
        strokeColor:'#0ea5e9',
      },
      {
        id:         'aws-route-table',
        type:       'aws-route-table',
        label:      'Route Table',
        categoryId: 'aws',
        parentType: 'aws-availability-zone', // must be inside an AZ
        svgIcon:    _awsSolidRect('#10b981', 'RT'),
        defaultWidth:  140,
        defaultHeight: 80,
        fillColor:  '#10b981',
        strokeColor:'#10b981',
      },
    ],

    // ── Azure (placeholder items) ────────────────────────────────
    'azure': [
      {
        id:         'azure-coming-soon',
        type:       'azure-placeholder',
        label:      'Coming Soon',
        categoryId: 'azure',
        parentType: null,
        isPlaceholder: true,
        svgIcon:    _placeholderRect('#0ea5e9'),
      },
    ],

    // ── GCP (placeholder items) ──────────────────────────────────
    'gcp': [
      {
        id:         'gcp-coming-soon',
        type:       'gcp-placeholder',
        label:      'Coming Soon',
        categoryId: 'gcp',
        parentType: null,
        isPlaceholder: true,
        svgIcon:    _placeholderRect('#10b981'),
      },
    ],
  };

  // ── Public API ────────────────────────────────────────────────────────────

  function loadShapeCategories() {
    return [..._categories].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  function getCategoryItems(categoryId) {
    if (!categoryId || typeof categoryId !== 'string') return [];
    return (_itemsByCategory[categoryId] || []).slice();
  }

  function getCategoryById(categoryId) {
    return _categories.find(c => c.id === categoryId) || null;
  }

  function getCategoryCount(categoryId) {
    // Don't count Coming Soon placeholders in the badge
    const items = (_itemsByCategory[categoryId] || []);
    return items.filter(i => !i.isPlaceholder).length;
  }

  function sortShapeCategories(categories) {
    return [...categories].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  /** Returns the item definition by its type string — used by drop validator */
  function getItemByType(type) {
    for (const items of Object.values(_itemsByCategory)) {
      const found = items.find(i => i.type === type);
      if (found) return found;
    }
    return null;
  }

  return {
    loadShapeCategories,
    getCategoryItems,
    getCategoryById,
    getCategoryCount,
    sortShapeCategories,
    getItemByType,
  };

})();
