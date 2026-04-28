/**
 * DiagramDbContext.cs
 * ====================
 * Entity Framework Core DbContext for the DiagramEngine.
 * Defines DbSets for Diagrams, DiagramCanvas, and DiagramShapes.
 *
 * BUG-12 fix: This DbContext replaces the stub repository pattern.
 * It is registered in Program.cs and injected into DiagramCanvasRepository.
 */

using Microsoft.EntityFrameworkCore;
using Antitouch.Models;

namespace Antitouch.Data
{
    public class DiagramDbContext : DbContext
    {
        public DiagramDbContext(DbContextOptions<DiagramDbContext> options)
            : base(options) { }

        public DbSet<DiagramModel>          Diagrams          { get; set; } = null!;
        public DbSet<DiagramCanvasModel>     DiagramCanvases   { get; set; } = null!;
        public DbSet<DiagramShapeModel>      DiagramShapes     { get; set; } = null!;
        public DbSet<ShapeHierarchyModel>    ShapeHierarchies  { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ── Diagrams ──────────────────────────────────────────────
            modelBuilder.Entity<DiagramModel>(entity =>
            {
                entity.HasKey(d => d.DiagramID);
                entity.Property(d => d.DiagramID).HasMaxLength(64);
                entity.Property(d => d.DiagramName).HasMaxLength(200).IsRequired();
                entity.Property(d => d.CanvasID).HasMaxLength(64);

                // Soft delete filter
                entity.HasQueryFilter(d => !d.IsDeleted);

                // Owned shapes collection
                entity.HasMany(d => d.Shapes)
                      .WithOne(s => s.Diagram)
                      .HasForeignKey(s => s.DiagramID)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // ── DiagramCanvas ─────────────────────────────────────────
            modelBuilder.Entity<DiagramCanvasModel>(entity =>
            {
                entity.HasKey(c => c.CanvasID);
                entity.Property(c => c.CanvasID).HasMaxLength(64);
                entity.Property(c => c.DiagramID).HasMaxLength(64);
                entity.Property(c => c.CanvasName).HasMaxLength(200);
                entity.Property(c => c.BackgroundColor).HasMaxLength(50);
                entity.Property(c => c.GridColor).HasMaxLength(50);
                entity.Property(c => c.CoordinateSystemType).HasMaxLength(100);
                entity.Property(c => c.OriginDefinition).HasMaxLength(100);
                entity.Property(c => c.AxisOrientationX).HasMaxLength(100);
                entity.Property(c => c.AxisOrientationY).HasMaxLength(100);
                entity.Property(c => c.AxisOrientationZ).HasMaxLength(100);

                // One-to-one relationship: one canvas per diagram
                entity.HasIndex(c => c.DiagramID).IsUnique();

                // Ignore in-memory navigation (Shapes lives on DiagramModel)
                entity.Ignore(c => c.Shapes);
            });

            // ── DiagramShapes ─────────────────────────────────────────
            modelBuilder.Entity<DiagramShapeModel>(entity =>
            {
                entity.HasKey(s => s.ShapeID);
                entity.Property(s => s.ShapeID).HasMaxLength(64);
                entity.Property(s => s.DiagramID).HasMaxLength(64);
                entity.Property(s => s.Type).HasMaxLength(100);
                entity.Property(s => s.Label).HasMaxLength(500);
                entity.Property(s => s.Color).HasMaxLength(50);
                entity.Property(s => s.SvgIcon);

                // Soft delete filter
                entity.HasQueryFilter(s => !s.IsDeleted);
            });
            // ── ShapeHierarchies ──────────────────────────────────────────
            modelBuilder.Entity<ShapeHierarchyModel>(entity =>
            {
                entity.HasKey(h => h.HierarchyID);
                entity.Property(h => h.ShapeType).HasMaxLength(100).IsRequired();
                entity.Property(h => h.Label).HasMaxLength(200);
                entity.Property(h => h.ParentType).HasMaxLength(100);
                entity.Property(h => h.CloudProvider).HasMaxLength(20);
                // Only active entries participate in drop validation
                entity.HasQueryFilter(h => h.IsActive);
            });
        }
    }
}
