using System.ComponentModel.DataAnnotations;

namespace Antitouch.Models
{
    /// <summary>
    /// ShapeHierarchyModel
    /// ====================
    /// Milestone 3 — Defines valid parent-child relationships between AWS/Azure/GCP
    /// shape types on the diagram canvas.
    ///
    /// Example hierarchy for AWS:
    ///   Region → VPC → Availability Zone → Route Table
    ///
    /// ParentType = null means the shape can be placed at the root canvas level.
    /// </summary>
    public class ShapeHierarchyModel
    {
        [Key]
        public int HierarchyID { get; set; }

        /// <summary>The child shape type (e.g. "aws-vpc")</summary>
        [Required]
        [MaxLength(100)]
        public string ShapeType { get; set; } = string.Empty;

        /// <summary>Human-readable label (e.g. "VPC")</summary>
        [MaxLength(200)]
        public string Label { get; set; } = string.Empty;

        /// <summary>
        /// The shape type that is the valid parent for this shape.
        /// NULL means the shape is allowed directly on the root canvas.
        /// </summary>
        [MaxLength(100)]
        public string? ParentType { get; set; }

        /// <summary>Cloud provider: "AWS", "Azure", "GCP"</summary>
        [MaxLength(20)]
        public string CloudProvider { get; set; } = "AWS";

        /// <summary>Display order within its level (lower = rendered first / outer)</summary>
        public int SortOrder { get; set; } = 0;

        public bool IsActive { get; set; } = true;
    }
}
