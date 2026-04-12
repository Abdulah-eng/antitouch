/*
 * ShapeCategoryDto.cs
 * ====================
 * Responsibility: Shared data transfer object for a single
 * shape category definition. Used for persistence, API
 * serialization, or future backend loading of categories.
 *
 * C# owns model definitions only — panel rendering, selection,
 * and interaction behaviour remain in JavaScript.
 *
 * Phase Coverage: 1.2 (shared model)
 */

namespace DiagramEngine.Models
{
    /// <summary>
    /// Represents a single category in the Shapes Panel library.
    /// Maps to a ShapeCategoryItem in the UI.
    /// </summary>
    public class ShapeCategoryDto
    {
        /// <summary>Unique identifier for the category (e.g. "rack-mounted-servers").</summary>
        public string Id { get; set; } = string.Empty;

        /// <summary>Display name shown in the Shapes Panel category list.</summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>Inline SVG icon markup for the category.</summary>
        public string Icon { get; set; } = string.Empty;

        /// <summary>Sort order for display in the category list (ascending).</summary>
        public int DisplayOrder { get; set; }

        /// <summary>Number of library items in this category.</summary>
        public int ItemCount { get; set; }

        /// <summary>Whether this category is currently selected (UI state, not persisted).</summary>
        public bool IsSelected { get; set; }
    }
}
