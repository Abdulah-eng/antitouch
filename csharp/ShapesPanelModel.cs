/*
 * ShapesPanelModel.cs
 * ====================
 * Responsibility: Aggregate model representing the full Shapes
 * Panel state contract. Contains the complete category list
 * and configuration options that may be loaded from a backend
 * or persistence layer in future milestones.
 *
 * C# owns model definitions only — panel rendering and
 * interaction behaviour remain in JavaScript.
 *
 * Phase Coverage: 1.1 (shared model)
 */

using System.Collections.Generic;

namespace DiagramEngine.Models
{
    /// <summary>
    /// Aggregate model for the Shapes Panel. Mirrors the
    /// JavaScript ShapesPanelState for server-side scenarios
    /// such as pre-rendering or API responses.
    /// </summary>
    public class ShapesPanelModel
    {
        // ── Identity ─────────────────────────────────────────
        /// <summary>Panel DOM identifier.</summary>
        public string ShapesPanelId { get; set; } = "ShapesPanel";

        /// <summary>Human-readable panel name.</summary>
        public string ShapesPanelName { get; set; } = "Shapes Panel";

        // ── Visibility / State ───────────────────────────────
        public bool IsShapesPanelVisible { get; set; } = true;

        public bool IsShapesPanelCollapsed { get; set; }

        // ── Header ───────────────────────────────────────────
        public string ShapesPanelTitleText { get; set; } = "SHAPES";

        // ── Search ───────────────────────────────────────────
        public string SearchPlaceholderText { get; set; } = "Search shapes…";

        public bool SearchEnabled { get; set; } = true;

        // ── Category List ────────────────────────────────────
        public bool CategoryListVisible { get; set; } = true;

        public bool CategorySelectionEnabled { get; set; } = true;

        public string? ActiveShapeCategoryId { get; set; }

        public string? ActiveShapeCategoryName { get; set; }

        public int CategoryAreaHeight { get; set; } = 220;

        /// <summary>Full list of available shape categories.</summary>
        public List<ShapeCategoryDto> ShapeCategories { get; set; } = new();

        // ── Items Area ───────────────────────────────────────
        public bool ItemsBoxVisible { get; set; } = true;

        public bool DragFromLibraryEnabled { get; set; } = true;

        // ── Splitter ─────────────────────────────────────────
        public bool SplitterEnabled { get; set; } = true;

        public int MinCategoryAreaHeight { get; set; } = 72;

        public int MinItemsAreaHeight { get; set; } = 80;
    }
}
