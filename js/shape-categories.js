/**
 * shape-categories.js
 * ===================
 * Responsibility: Define static category and item data for M4.
 * Replaced basic categories with AWS, Azure, and GCP.
 */

'use strict';

const ShapeCategories = (() => {

  // AWS Icons
  function _svgAwsRegion() {
    return `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="32" height="32" rx="4" stroke="#e0e0e0" stroke-width="2" stroke-dasharray="4 2"/>
      <path d="M12 12 h16 v16 h-16 z" fill="#f19c38" opacity="0.8"/>
    </svg>`;
  }

  function _svgAwsVpc() {
    return `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="32" height="32" rx="2" stroke="#232f3e" stroke-width="2"/>
      <rect x="10" y="10" width="20" height="20" fill="#248814" opacity="0.8"/>
    </svg>`;
  }

  function _svgAwsAz() {
    return `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="32" height="32" stroke="#007cbc" stroke-width="2" stroke-dasharray="2 2"/>
      <circle cx="20" cy="20" r="8" fill="#007cbc" opacity="0.8"/>
    </svg>`;
  }

  function _svgAwsRouteTable() {
    return `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="28" height="28" fill="#e2e8f0" stroke="#64748b" stroke-width="2"/>
      <line x1="14" y1="6" x2="14" y2="34" stroke="#64748b" stroke-width="2"/>
      <line x1="26" y1="6" x2="26" y2="34" stroke="#64748b" stroke-width="2"/>
      <line x1="6" y1="14" x2="34" y2="14" stroke="#64748b" stroke-width="2"/>
      <line x1="6" y1="26" x2="34" y2="26" stroke="#64748b" stroke-width="2"/>
    </svg>`;
  }

  // Cloud Brand Icons for Tabs
  function _svgAwsBrand() {
    return `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 5 L35 15 L35 25 L20 35 L5 25 L5 15 Z" fill="#FF9900"/></svg>`;
  }

  function _svgAzureBrand() {
    return `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 5 L35 15 L35 25 L20 35 L5 25 L5 15 Z" fill="#0078D4"/></svg>`;
  }

  function _svgGcpBrand() {
    return `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 5 L35 15 L35 25 L20 35 L5 25 L5 15 Z" fill="#4285F4"/></svg>`;
  }

  // To ensure the basic primitives (Line, Circle, Rectangle) are still available for basic testing, 
  // we'll keep them as a "Primitives" category, but position them last.
  function _svgLine(c = '#10b981') {
    return `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="6" y1="20" x2="34" y2="20" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/></svg>`;
  }
  function _svgCircle(c = '#6366f1') {
    return `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="14" fill="${c}" opacity="0.1" stroke="${c}" stroke-width="2"/></svg>`;
  }
  function _svgRectangle(c = '#f59e0b') {
    return `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="10" width="28" height="20" fill="${c}" opacity="0.1" stroke="${c}" stroke-width="2"/></svg>`;
  }


  const _categories = [
    { id: 'aws',       name: 'AWS',       icon: _svgAwsBrand(),   displayOrder: 1 },
    { id: 'azure',     name: 'Azure',     icon: _svgAzureBrand(), displayOrder: 2 },
    { id: 'gcp',       name: 'GCP',       icon: _svgGcpBrand(),   displayOrder: 3 },
    { id: 'primitives',name: 'Primitives',icon: _svgRectangle('#64748b'), displayOrder: 4 },
  ];

  const _itemsByCategory = {
    'aws': [
      { id: 'aws-region',      type: 'Region',            label: 'Region',            categoryId: 'aws', svgIcon: _svgAwsRegion() },
      { id: 'aws-vpc',         type: 'VPC',               label: 'VPC',               categoryId: 'aws', svgIcon: _svgAwsVpc() },
      { id: 'aws-az',          type: 'Availability Zone', label: 'Availability Zone', categoryId: 'aws', svgIcon: _svgAwsAz() },
      { id: 'aws-route-table', type: 'Route Table',       label: 'Route Table',       categoryId: 'aws', svgIcon: _svgAwsRouteTable() },
    ],
    'azure': [
      { id: 'azure-coming-soon', type: 'placeholder', label: 'Coming Soon', categoryId: 'azure', svgIcon: _svgRectangle('#64748b') },
    ],
    'gcp': [
      { id: 'gcp-coming-soon', type: 'placeholder', label: 'Coming Soon', categoryId: 'gcp', svgIcon: _svgRectangle('#64748b') },
    ],
    'primitives': [
      { id: 'shape-line',      type: 'line',      label: 'Line',      categoryId: 'primitives', svgIcon: _svgLine('#10b981') },
      { id: 'shape-circle',    type: 'circle',    label: 'Circle',    categoryId: 'primitives', svgIcon: _svgCircle('#6366f1') },
      { id: 'shape-rectangle', type: 'rectangle', label: 'Rectangle', categoryId: 'primitives', svgIcon: _svgRectangle('#f59e0b') },
    ]
  };

  /** Returns all categories sorted by displayOrder */
  function loadShapeCategories() {
    return [..._categories].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  /** Returns items for a specific category */
  function getCategoryItems(categoryId) {
    if (!categoryId || typeof categoryId !== 'string') return [];
    return (_itemsByCategory[categoryId] || []).slice();
  }

  /** Returns a single category object by id, or null */
  function getCategoryById(categoryId) {
    return _categories.find(c => c.id === categoryId) || null;
  }

  /** Returns the item count for a given category id */
  function getCategoryCount(categoryId) {
    return (_itemsByCategory[categoryId] || []).length;
  }

  /** Sorts any category array by displayOrder */
  function sortShapeCategories(categories) {
    return [...categories].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  return {
    loadShapeCategories,
    getCategoryItems,
    getCategoryById,
    getCategoryCount,
    sortShapeCategories,
  };

})();
