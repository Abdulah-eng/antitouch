/**
 * ShapeHierarchyModel.cs
 * ======================
 * M3: Defines the allowed parent-child hierarchy for shape types.
 * Supports AWS cloud shape containment rules (Region > VPC > AZ > RouteTable).
 *
 * Used by the drop validator on the frontend and optionally enforced server-side.
 */

using System.ComponentModel.DataAnnotations;

namespace Antitouch.Models
{
    /// <summary>
    /// One record = "ShapeType X is allowed inside ShapeType Y".
    /// A null AllowedParentType means the shape is a top-level (root) shape.
    /// </summary>
    public class ShapeHierarchyModel
    {
        [Key]
        [MaxLength(64)]
        public string HierarchyID { get; set; } = Guid.NewGuid().ToString();

        /// <summary>The child shape type label (e.g. "VPC").</summary>
        [Required, MaxLength(100)]
        public string ShapeType { get; set; } = string.Empty;

        /// <summary>
        /// The parent shape type that must contain this child.
        /// Null = can be placed anywhere (top-level).
        /// </summary>
        [MaxLength(100)]
        public string? AllowedParentType { get; set; }

        /// <summary>Friendly display label for the UI.</summary>
        [MaxLength(200)]
        public string? DisplayLabel { get; set; }

        /// <summary>Icon / SVG identifier for the shape in the library.</summary>
        [MaxLength(500)]
        public string? IconKey { get; set; }

        /// <summary>Display order within the library panel.</summary>
        public int SortOrder { get; set; } = 0;

        /// <summary>Cloud provider grouping (AWS / Azure / GCP).</summary>
        [MaxLength(50)]
        public string Provider { get; set; } = "AWS";

        public bool IsDeleted { get; set; } = false;
    }
}
