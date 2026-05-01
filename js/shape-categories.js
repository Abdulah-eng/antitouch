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

  // ── AWS Icons ──────────────────────────────────────────────────────────────

  function _svgAwsRegion(color) {
    return `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="34" height="34" rx="2" fill="${color}" fill-opacity="0.12" stroke="${color}" stroke-width="1.8" stroke-dasharray="4 2"/>
      <!-- Globe -->
      <circle cx="20" cy="18" r="7" fill="none" stroke="${color}" stroke-width="1.5"/>
      <ellipse cx="20" cy="18" rx="3" ry="7" fill="none" stroke="${color}" stroke-width="1.5"/>
      <line x1="13" y1="18" x2="27" y2="18" stroke="${color}" stroke-width="1.5"/>
      <text x="20" y="32" text-anchor="middle" font-size="6.5" fill="${color}" font-family="sans-serif" font-weight="600">Region</text>
    </svg>`;
  }

  function _svgAwsVpc(color) {
    return `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="34" height="34" rx="2" fill="${color}" fill-opacity="0.12" stroke="${color}" stroke-width="1.8" stroke-dasharray="4 2"/>
      <!-- Cloud -->
      <path d="M 13 21 C 13 17 18 16 19 14 C 21 11 26 12 27 15 C 31 16 31 22 27 24 L 15 24 C 11 24 11 22 13 21 Z" fill="none" stroke="${color}" stroke-width="1.5"/>
      <text x="20" y="32" text-anchor="middle" font-size="6.5" fill="${color}" font-family="sans-serif" font-weight="600">VPC</text>
    </svg>`;
  }

  function _svgAwsAz(color) {
    return `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="34" height="34" rx="2" fill="${color}" fill-opacity="0.12" stroke="${color}" stroke-width="1.8" stroke-dasharray="4 2"/>
      <!-- Grid pattern -->
      <line x1="14" y1="14" x2="26" y2="14" stroke="${color}" stroke-width="1.2" stroke-dasharray="2 1"/>
      <line x1="14" y1="18" x2="26" y2="18" stroke="${color}" stroke-width="1.2" stroke-dasharray="2 1"/>
      <line x1="14" y1="22" x2="26" y2="22" stroke="${color}" stroke-width="1.2" stroke-dasharray="2 1"/>
      <text x="20" y="32" text-anchor="middle" font-size="6.5" fill="${color}" font-family="sans-serif" font-weight="600">AZ</text>
    </svg>`;
  }

  function _svgAwsRouteTable(color) {
    return `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="6" width="32" height="28" rx="3" fill="${color}" fill-opacity="0.18" stroke="${color}" stroke-width="1.8"/>
      <!-- Table rows -->
      <line x1="8" y1="14" x2="32" y2="14" stroke="${color}" stroke-width="1"/>
      <line x1="8" y1="20" x2="32" y2="20" stroke="${color}" stroke-width="1"/>
      <!-- Arrows -->
      <path d="M 12 17 L 16 17 M 16 17 L 14 15 M 16 17 L 14 19" stroke="${color}" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M 28 23 L 24 23 M 24 23 L 26 21 M 24 23 L 26 25" stroke="${color}" stroke-width="1.2" stroke-linecap="round"/>
      <text x="20" y="31" text-anchor="middle" font-size="6.5" fill="${color}" font-family="sans-serif" font-weight="600">Route Table</text>
    </svg>`;
  }

  function _svgAwsEc2(color) {
    return `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="28" height="28" rx="4" fill="${color}" fill-opacity="0.18" stroke="${color}" stroke-width="2"/>
      <rect x="14" y="14" width="12" height="12" rx="2" fill="${color}" fill-opacity="0.3" stroke="${color}" stroke-width="1.5"/>
      <text x="20" y="31" text-anchor="middle" font-size="6.5" fill="${color}" font-family="sans-serif" font-weight="600">EC2</text>
    </svg>`;
  }

  function _svgAwsIgw(color) {
    return `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 6 16 L 20 6 L 34 16 L 34 32 L 6 32 Z" fill="${color}" fill-opacity="0.18" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M 12 24 L 28 24 M 20 16 L 20 28" stroke="${color}" stroke-width="1.5"/>
      <text x="20" y="29" text-anchor="middle" font-size="6.5" fill="${color}" font-family="sans-serif" font-weight="600">IGW</text>
    </svg>`;
  }

  function _svgAwsNat(color) {
    return `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 20 6 L 34 20 L 20 34 L 6 20 Z" fill="${color}" fill-opacity="0.18" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M 14 20 L 26 20 M 23 17 L 26 20 L 23 23" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="20" y="27" text-anchor="middle" font-size="6.5" fill="${color}" font-family="sans-serif" font-weight="600">NAT</text>
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
      icon:         _svgAwsRegion('#f59e0b'),
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
        parentType: null,           // overridden by CSV
        svgIcon:    _svgAwsRegion('#f59e0b'),
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
        parentType: null,  // overridden by CSV
        svgIcon:    _svgAwsVpc('#6366f1'),
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
        parentType: null,     // overridden by CSV
        svgIcon:    _svgAwsAz('#0ea5e9'),
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
        parentType: null, // overridden by CSV
        svgIcon:    _svgAwsRouteTable('#10b981'),
        defaultWidth:  140,
        defaultHeight: 80,
        fillColor:  '#10b981',
        strokeColor:'#10b981',
      },
      {
        id:         'aws-ec2',
        type:       'aws-ec2',
        label:      'EC2',
        categoryId: 'aws',
        parentType: null, // overridden by CSV
        svgIcon:    _svgAwsEc2('#f59e0b'),
        defaultWidth:  60,
        defaultHeight: 60,
        fillColor:  '#f59e0b',
        strokeColor:'#f59e0b',
      },
      {
        id:         'aws-igw',
        type:       'aws-igw',
        label:      'Internet Gateway',
        categoryId: 'aws',
        parentType: null, // overridden by CSV
        svgIcon:    _svgAwsIgw('#8b5cf6'), // Purple
        defaultWidth:  60,
        defaultHeight: 60,
        fillColor:  '#8b5cf6',
        strokeColor:'#8b5cf6',
      },
      {
        id:         'aws-nat',
        type:       'aws-nat',
        label:      'NAT Gateway',
        categoryId: 'aws',
        parentType: null, // overridden by CSV
        svgIcon:    _svgAwsNat('#10b981'), // Green
        defaultWidth:  60,
        defaultHeight: 60,
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

  function getAllItems() {
    let all = [];
    for (const items of Object.values(_itemsByCategory)) {
      all = all.concat(items);
    }
    return all;
  }

  return {
    loadShapeCategories,
    getCategoryItems,
    getCategoryById,
    getCategoryCount,
    sortShapeCategories,
    getItemByType,
    getAllItems,
  };

})();
