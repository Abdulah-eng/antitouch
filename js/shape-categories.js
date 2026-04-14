/**
 * shape-categories.js
 * ===================
 * Responsibility: Define static category and item data for basic shapes.
 * Provides loadShapeCategories and getCategoryItems functions.
 * Pure data layer — no DOM access, no state mutation.
 */

'use strict';

const ShapeCategories = (() => {

  function _svgLine(c = '#10b981') {
    return `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="6" y1="20" x2="34" y2="20" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`;
  }

  function _svgCircle(c = '#6366f1') {
    return `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="14" fill="${c}" opacity="0.1" stroke="${c}" stroke-width="2"/>
    </svg>`;
  }

  function _svgRectangle(c = '#f59e0b') {
    return `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="10" width="28" height="20" rx="2" fill="${c}" opacity="0.1" stroke="${c}" stroke-width="2"/>
    </svg>`;
  }

  const _categories = [
    { id: 'basic-shapes',    name: 'Basic Shapes',    icon: _svgRectangle('#6366f1'), displayOrder: 1 },
    { id: 'advanced-shapes', name: 'Advanced Shapes', icon: _svgRectangle('#3b82f6'), displayOrder: 2 },
    { id: 'premium-shapes',  name: 'Premium Shapes',  icon: _svgRectangle('#a855f7'), displayOrder: 3 },
  ];

  const _itemsByCategory = {
    'basic-shapes': [
      { id: 'shape-line',      type: 'line',      label: 'Line',      categoryId: 'basic-shapes', svgIcon: _svgLine('#10b981') },
      { id: 'shape-circle',    type: 'circle',    label: 'Circle',    categoryId: 'basic-shapes', svgIcon: _svgCircle('#6366f1') },
      { id: 'shape-rectangle', type: 'rectangle', label: 'Rectangle', categoryId: 'basic-shapes', svgIcon: _svgRectangle('#f59e0b') },
    ],
    'advanced-shapes': [
      { id: 'adv-line',      type: 'line',      label: 'Advanced Line',  categoryId: 'advanced-shapes', svgIcon: _svgLine('#3b82f6') },
      { id: 'adv-circle',    type: 'circle',    label: 'Advanced Circle',categoryId: 'advanced-shapes', svgIcon: _svgCircle('#06b6d4') },
      { id: 'adv-rectangle', type: 'rectangle', label: 'Advanced Rect',  categoryId: 'advanced-shapes', svgIcon: _svgRectangle('#14b8a6') },
    ],
    'premium-shapes': [
      { id: 'prem-line',      type: 'line',      label: 'Premium Line',  categoryId: 'premium-shapes', svgIcon: _svgLine('#a855f7') },
      { id: 'prem-circle',    type: 'circle',    label: 'Premium Circle',categoryId: 'premium-shapes', svgIcon: _svgCircle('#ec4899') },
      { id: 'prem-rectangle', type: 'rectangle', label: 'Premium Rect',  categoryId: 'premium-shapes', svgIcon: _svgRectangle('#f43f5e') },
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
