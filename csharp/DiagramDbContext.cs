/**
 * DiagramDbContext.cs
 * ====================
 * Entity Framework Core DbContext for the DiagramEngine.
 *
 * Milestone 3: Added ShapeHierarchyItems DbSet and seed data for the AWS hierarchy.
 * Milestone 5: Updated DiagramShapes configuration for new M5 fields.
 */

using Microsoft.EntityFrameworkCore;
using Antitouch.Models;

namespace Antitouch.Data
{
    public class DiagramDbContext : DbContext
    {
        public DiagramDbContext(DbContextOptions<DiagramDbContext> options)
            : base(options) { }

        public DbSet<DiagramModel>        Diagrams            { get; set; } = null!;
        public DbSet<DiagramCanvasModel>  DiagramCanvases     { get; set; } = null!;
        public DbSet<DiagramShapeModel>   DiagramShapes       { get; set; } = null!;
        public DbSet<ShapeHierarchyModel> ShapeHierarchyItems { get; set; } = null!;

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

                entity.HasQueryFilter(d => !d.IsDeleted);

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

                entity.HasIndex(c => c.DiagramID).IsUnique();
                entity.Ignore(c => c.Shapes);
            });

            // ── DiagramShapes (M5: added HalfWidth, HalfHeight, padding ratios) ──
            modelBuilder.Entity<DiagramShapeModel>(entity =>
            {
                entity.HasKey(s => s.ShapeID);
                entity.Property(s => s.ShapeID).HasMaxLength(64);
                entity.Property(s => s.DiagramID).HasMaxLength(64);
                entity.Property(s => s.Type).HasMaxLength(100);
                entity.Property(s => s.Label).HasMaxLength(500);
                entity.Property(s => s.Color).HasMaxLength(50);
                entity.Property(s => s.StrokeColor).HasMaxLength(50);
                entity.Property(s => s.FillColor).HasMaxLength(50);
                entity.Property(s => s.ParentShapeId).HasMaxLength(64);
                entity.Property(s => s.SvgIcon);

                entity.HasQueryFilter(s => !s.IsDeleted);
            });

            // ── ShapeHierarchy (M3 seed) ──────────────────────────────
            modelBuilder.Entity<ShapeHierarchyModel>(entity =>
            {
                entity.HasKey(h => h.Id);
                entity.Property(h => h.Name).HasMaxLength(100).IsRequired();
                entity.Property(h => h.DisplayName).HasMaxLength(200);
                entity.Property(h => h.Category).HasMaxLength(100);
                entity.Property(h => h.InvalidDropMessage).HasMaxLength(500);

                // Self-referential FK: ParentId -> Id
                entity.HasOne(h => h.Parent)
                      .WithMany(h => h.AllowedParents)
                      .HasForeignKey(h => h.ParentId)
                      .IsRequired(false)
                      .OnDelete(DeleteBehavior.Restrict);

                // Seed data — AWS hierarchy
                entity.HasData(
                    new ShapeHierarchyModel
                    {
                        Id              = 1,
                        Name            = "Region",
                        DisplayName     = "AWS Region",
                        Category        = "AWS",
                        ParentId        = null,
                        InvalidDropMessage = ""
                    },
                    new ShapeHierarchyModel
                    {
                        Id              = 2,
                        Name            = "VPC",
                        DisplayName     = "VPC",
                        Category        = "AWS",
                        ParentId        = 1, // parent = Region
                        InvalidDropMessage = "Please drop VPC within a Region."
                    },
                    new ShapeHierarchyModel
                    {
                        Id              = 3,
                        Name            = "AvailabilityZone",
                        DisplayName     = "Availability Zone",
                        Category        = "AWS",
                        ParentId        = 2, // parent = VPC
                        InvalidDropMessage = "Please drop the availability zone within a VPC. If VPC is not created, please create before creating availability zone."
                    },
                    new ShapeHierarchyModel
                    {
                        Id              = 4,
                        Name            = "RouteTable",
                        DisplayName     = "Route Table",
                        Category        = "AWS",
                        ParentId        = 2, // primary parent = VPC (also accepts AZ — enforced in JS)
                        InvalidDropMessage = "Please drop the route table within a VPC or Availability Zone. If none exists, please create the required parent first."
                    }
                );
            });
        }
    }
}
