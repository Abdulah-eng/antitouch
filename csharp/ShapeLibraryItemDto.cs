/*
 * ShapeLibraryItemDto.cs
 * =======================
 * Responsibility: Shared data transfer object for a single
 * draggable library item inside a shape category.
 * Used for persistence, API serialization, or future
 * server-side item loading.
 *
 * C# owns model definitions only — rendering, drag behaviour,
 * and filtering remain in JavaScript.
 *
 * Phase Coverage: 1.2 (shared model)
 */

namespace DiagramEngine.Models
{
    /// <summary>
    /// Represents a single library item (shape) that can be
    /// dragged from the Shapes Panel onto the DiagramCanvas.
    /// </summary>
    public class ShapeLibraryItemDto
    {
        /// <summary>Unique identifier for the item (e.g. "web-server").</summary>
        public string Id { get; set; } = string.Empty;

        /// <summary>Shape type key used by the rendering engine (e.g. "web-server").</summary>
        public string Type { get; set; } = string.Empty;

        /// <summary>Display label shown beneath the item icon.</summary>
        public string Label { get; set; } = string.Empty;

        /// <summary>Identifier of the parent category this item belongs to.</summary>
        public string CategoryId { get; set; } = string.Empty;

        /// <summary>Inline SVG icon markup for the item thumbnail.</summary>
        public string SvgIcon { get; set; } = string.Empty;

        /// <summary>Optional keywords for search filtering (comma-separated).</summary>
        public string SearchKeywords { get; set; } = string.Empty;

        /// <summary>Sort order within the category (ascending).</summary>
        public int DisplayOrder { get; set; }
    }
}
