using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Antitouch.Data;
using Antitouch.Models;

namespace Antitouch.Services
{
    /// <summary>
    /// ShapeHierarchyRepository
    /// =========================
    /// Milestone 3 — Loads and provides the parent-child hierarchy rules
    /// for shape type validation.
    ///
    /// Used by:
    ///   - The API controller to expose hierarchy rules to the JS frontend.
    ///   - The drop-handler JS validator (parent-drop-validator.js) consumes
    ///     the JSON response from /api/DiagramCanvas/hierarchy.
    /// </summary>
    public interface IShapeHierarchyRepository
    {
        Task<IEnumerable<ShapeHierarchyModel>> GetAllAsync();
        Task<IEnumerable<ShapeHierarchyModel>> GetByProviderAsync(string provider);
        Task<bool> SeedDefaultHierarchyAsync();
    }

    public class ShapeHierarchyRepository : IShapeHierarchyRepository
    {
        private readonly DiagramDbContext _db;

        public ShapeHierarchyRepository(DiagramDbContext db)
        {
            _db = db;
        }

        public async Task<IEnumerable<ShapeHierarchyModel>> GetAllAsync()
        {
            return await _db.ShapeHierarchies
                .AsNoTracking()
                .Where(h => h.IsActive)
                .OrderBy(h => h.CloudProvider)
                .ThenBy(h => h.SortOrder)
                .ToListAsync();
        }

        public async Task<IEnumerable<ShapeHierarchyModel>> GetByProviderAsync(string provider)
        {
            return await _db.ShapeHierarchies
                .AsNoTracking()
                .Where(h => h.IsActive && h.CloudProvider == provider)
                .OrderBy(h => h.SortOrder)
                .ToListAsync();
        }

        /// <summary>
        /// Seeds the default AWS Region → VPC → AZ → Route Table hierarchy.
        /// Idempotent — only inserts if table is empty.
        /// </summary>
        public async Task<bool> SeedDefaultHierarchyAsync()
        {
            if (await _db.ShapeHierarchies.AnyAsync()) return true; // already seeded

            var seed = new List<ShapeHierarchyModel>
            {
                // ── AWS ──────────────────────────────────────────────────────────
                new ShapeHierarchyModel
                {
                    ShapeType     = "aws-region",
                    Label         = "AWS Region",
                    ParentType    = null,           // root-level: can be dropped on canvas
                    CloudProvider = "AWS",
                    SortOrder     = 1,
                },
                new ShapeHierarchyModel
                {
                    ShapeType     = "aws-vpc",
                    Label         = "VPC",
                    ParentType    = "aws-region",   // must be inside a Region
                    CloudProvider = "AWS",
                    SortOrder     = 2,
                },
                new ShapeHierarchyModel
                {
                    ShapeType     = "aws-availability-zone",
                    Label         = "Availability Zone",
                    ParentType    = "aws-vpc",      // must be inside a VPC
                    CloudProvider = "AWS",
                    SortOrder     = 3,
                },
                new ShapeHierarchyModel
                {
                    ShapeType     = "aws-route-table",
                    Label         = "Route Table",
                    ParentType    = "aws-availability-zone", // must be inside an AZ
                    CloudProvider = "AWS",
                    SortOrder     = 4,
                },

                // ── Azure (placeholders) ──────────────────────────────────────────
                new ShapeHierarchyModel
                {
                    ShapeType     = "azure-region",
                    Label         = "Azure Region",
                    ParentType    = null,
                    CloudProvider = "Azure",
                    SortOrder     = 1,
                },
                new ShapeHierarchyModel
                {
                    ShapeType     = "azure-vnet",
                    Label         = "Virtual Network",
                    ParentType    = "azure-region",
                    CloudProvider = "Azure",
                    SortOrder     = 2,
                },

                // ── GCP (placeholders) ────────────────────────────────────────────
                new ShapeHierarchyModel
                {
                    ShapeType     = "gcp-region",
                    Label         = "GCP Region",
                    ParentType    = null,
                    CloudProvider = "GCP",
                    SortOrder     = 1,
                },
                new ShapeHierarchyModel
                {
                    ShapeType     = "gcp-vpc",
                    Label         = "GCP VPC",
                    ParentType    = "gcp-region",
                    CloudProvider = "GCP",
                    SortOrder     = 2,
                },
            };

            await _db.ShapeHierarchies.AddRangeAsync(seed);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
