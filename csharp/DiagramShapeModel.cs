using System.ComponentModel.DataAnnotations;

namespace Antitouch.Models
{
    /// <summary>
    /// DiagramShapeModel
    /// ==================
    /// Milestone 5 additions:
    ///  - HalfWidth / HalfHeight for center-based world-space geometry
    ///  - HoverPaddingXRatio / HoverPaddingYRatio (default 0.1)
    ///  - ProtectionPaddingXRatio / ProtectionPaddingYRatio (default 0.2)
    ///  - PreviousValidCenterX / PreviousValidCenterY for overlap rollback
    ///  - ParentShapeId for container hierarchy (Milestone 4)
    /// </summary>
    public class DiagramShapeModel
    {
        [Key]
        public string ShapeID { get; set; } = string.Empty;

        public string Type  { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;

        // ── World-space center position ───────────────────────────
        public double WorldX { get; set; }
        public double WorldY { get; set; }

        // ── Legacy size (kept for backward compat) ────────────────
        public double Width  { get; set; }
        public double Height { get; set; }

        // ── Center-based canonical geometry (Milestone 5) ─────────
        public double HalfWidth  { get; set; }
        public double HalfHeight { get; set; }

        // ── Hover Padding (default 0.1) ───────────────────────────
        public double HoverPaddingXRatio { get; set; } = 0.1;
        public double HoverPaddingYRatio { get; set; } = 0.1;

        // ── Protection Padding (default 0.2) ──────────────────────
        public double ProtectionPaddingXRatio { get; set; } = 0.2;
        public double ProtectionPaddingYRatio { get; set; } = 0.2;

        // ── Previous valid center for rollback on invalid move ─────
        public double PreviousValidCenterX { get; set; }
        public double PreviousValidCenterY { get; set; }

        // ── Appearance ────────────────────────────────────────────
        public string Color       { get; set; } = "#6366f1";
        public string StrokeColor { get; set; } = "#6366f1";
        public string FillColor   { get; set; } = "#6366f1";
        public string SvgIcon     { get; set; } = string.Empty;

        // ── Containment (Milestone 4) ─────────────────────────────
        /// <summary>
        /// ParentShapeId is the ShapeID of the parent container shape.
        /// NULL = root-level (no parent).
        /// </summary>
        public string? ParentShapeId { get; set; }

        // ── Soft delete ───────────────────────────────────────────
        public bool IsDeleted { get; set; } = false;

        // ── Foreign Key ───────────────────────────────────────────
        public string DiagramID { get; set; } = string.Empty;
        public DiagramModel? Diagram { get; set; }
    }
}
