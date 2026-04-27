using System.ComponentModel.DataAnnotations;

namespace Antitouch.Models
{
    /// <summary>
    /// ShapeHierarchyModel
    /// ====================
    /// Milestone 3: Defines the parent-child hierarchy for cloud diagram shapes.
    /// Each item has a single optional parent (NULL = root level).
    ///
    /// Hierarchy:
    ///   Region           parent = NULL     (root)
    ///   VPC              parent = Region
    ///   Availability Zone parent = VPC
    ///   Route Table      parent = VPC or Availability Zone
    /// </summary>
    public class ShapeHierarchyModel
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(200)]
        public string DisplayName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Category { get; set; } = "AWS"; // AWS | Azure | GCP

        /// <summary>
        /// ParentId is NULL for root-level shapes (e.g. Region).
        /// A shape may have at most one parent at a time.
        /// </summary>
        public int? ParentId { get; set; }

        // Self-referential navigation
        public ShapeHierarchyModel? Parent { get; set; }
        public ICollection<ShapeHierarchyModel> AllowedParents { get; set; } = new List<ShapeHierarchyModel>();

        [MaxLength(500)]
        public string InvalidDropMessage { get; set; } = string.Empty;
    }
}
