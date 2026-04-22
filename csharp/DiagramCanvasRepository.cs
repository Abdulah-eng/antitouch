using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Antitouch.Models;
using Antitouch.Data;

namespace Antitouch.Services
{
    public interface IDiagramCanvasRepository
    {
        Task<DiagramCanvasModel?> GetCanvasByDiagramIdAsync(string diagramId);
        Task<IEnumerable<DiagramModel>> ListDiagramsAsync();
        Task<bool> SaveDiagramAsync(DiagramModel diagram, DiagramCanvasModel canvas);
        Task<DiagramModel?> GetDiagramByIdAsync(string diagramId);
    }

    /// <summary>
    /// BUG-12 fix: Real Entity Framework Core implementation.
    /// Replaces the stub that returned hardcoded data and never touched the database.
    /// 
    /// Uses SQL Server (connection string: "DiagramDb" from appsettings.json).
    /// SaveDiagramAsync performs an UPSERT: update if exists, insert if new.
    /// </summary>
    public class DiagramCanvasRepository : IDiagramCanvasRepository
    {
        private readonly DiagramDbContext _db;

        public DiagramCanvasRepository(DiagramDbContext db)
        {
            _db = db;
        }

        // ── GetCanvasByDiagramIdAsync ──────────────────────────────────────────

        /// <summary>
        /// Loads the DiagramCanvasModel for a given DiagramID.
        /// Returns null if not found.
        /// </summary>
        public async Task<DiagramCanvasModel?> GetCanvasByDiagramIdAsync(string diagramId)
        {
            if (string.IsNullOrEmpty(diagramId)) return null;

            return await _db.DiagramCanvases
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.DiagramID == diagramId);
        }

        // ── GetDiagramByIdAsync ───────────────────────────────────────────────

        /// <summary>
        /// Loads a DiagramModel with its Shapes by DiagramID.
        /// Returns null if not found.
        /// </summary>
        public async Task<DiagramModel?> GetDiagramByIdAsync(string diagramId)
        {
            if (string.IsNullOrEmpty(diagramId)) return null;

            return await _db.Diagrams
                .AsNoTracking()
                .Include(d => d.Shapes)
                .FirstOrDefaultAsync(d => d.DiagramID == diagramId);
        }

        // ── ListDiagramsAsync ─────────────────────────────────────────────────

        /// <summary>
        /// Returns a lightweight list of all non-deleted diagrams (no shapes loaded).
        /// Ordered by UpdatedAt descending so the most recently saved appears first.
        /// </summary>
        public async Task<IEnumerable<DiagramModel>> ListDiagramsAsync()
        {
            return await _db.Diagrams
                .AsNoTracking()
                .OrderByDescending(d => d.UpdatedAt)
                .ToListAsync();
        }

        // ── SaveDiagramAsync ─────────────────────────────────────────────────

        /// <summary>
        /// UPSERT: Inserts a new diagram+canvas, or updates existing ones.
        /// Also syncs the Shapes collection (delete removed, add new).
        /// Returns true on success; false on database error.
        /// </summary>
        public async Task<bool> SaveDiagramAsync(DiagramModel diagram, DiagramCanvasModel canvas)
        {
            try
            {
                // ── Diagram row ─────────────────────────────────────────────
                var existingDiagram = await _db.Diagrams
                    .Include(d => d.Shapes)
                    .IgnoreQueryFilters()           // include soft-deleted to allow restore
                    .FirstOrDefaultAsync(d => d.DiagramID == diagram.DiagramID);

                if (existingDiagram == null)
                {
                    // New diagram — set creation timestamp
                    diagram.CreatedAt = DateTime.UtcNow;
                    diagram.UpdatedAt = DateTime.UtcNow;
                    _db.Diagrams.Add(diagram);
                }
                else
                {
                    // Update existing diagram metadata
                    existingDiagram.DiagramName    = diagram.DiagramName;
                    existingDiagram.DiagramVersion = diagram.DiagramVersion;
                    existingDiagram.CanvasID       = diagram.CanvasID;
                    existingDiagram.UpdatedAt      = DateTime.UtcNow;
                    existingDiagram.IsDeleted      = false;   // restore if soft-deleted

                    // Sync shapes: remove shapes not in the new set
                    var newShapeIds = diagram.Shapes.Select(s => s.ShapeID).ToHashSet();
                    var toRemove    = existingDiagram.Shapes
                        .Where(s => !newShapeIds.Contains(s.ShapeID))
                        .ToList();
                    _db.DiagramShapes.RemoveRange(toRemove);

                    // Add or update shapes
                    foreach (var newShape in diagram.Shapes)
                    {
                        var existing = existingDiagram.Shapes
                            .FirstOrDefault(s => s.ShapeID == newShape.ShapeID);
                        if (existing == null)
                        {
                            newShape.DiagramID = diagram.DiagramID;
                            _db.DiagramShapes.Add(newShape);
                        }
                        else
                        {
                            existing.Type    = newShape.Type;
                            existing.Label   = newShape.Label;
                            existing.WorldX  = newShape.WorldX;
                            existing.WorldY  = newShape.WorldY;
                            existing.Width   = newShape.Width;
                            existing.Height  = newShape.Height;
                            existing.Color   = newShape.Color;
                            existing.StrokeColor = newShape.StrokeColor;
                            existing.FillColor = newShape.FillColor;
                            existing.SvgIcon = newShape.SvgIcon;
                        }
                    }
                }

                // ── Canvas row ──────────────────────────────────────────────
                var existingCanvas = await _db.DiagramCanvases
                    .FirstOrDefaultAsync(c => c.DiagramID == canvas.DiagramID);

                if (existingCanvas == null)
                {
                    canvas.UpdatedAt = DateTime.UtcNow;
                    _db.DiagramCanvases.Add(canvas);
                }
                else
                {
                    // Update all canvas fields
                    existingCanvas.CanvasName           = canvas.CanvasName;
                    existingCanvas.BackgroundColor      = canvas.BackgroundColor;
                    existingCanvas.CoordinateSystemType = canvas.CoordinateSystemType;
                    existingCanvas.OriginDefinition     = canvas.OriginDefinition;
                    existingCanvas.AxisOrientationX     = canvas.AxisOrientationX;
                    existingCanvas.AxisOrientationY     = canvas.AxisOrientationY;
                    existingCanvas.AxisOrientationZ     = canvas.AxisOrientationZ;
                    existingCanvas.IsInfiniteX          = canvas.IsInfiniteX;
                    existingCanvas.IsInfiniteY          = canvas.IsInfiniteY;
                    existingCanvas.IsInfiniteZ          = canvas.IsInfiniteZ;
                    existingCanvas.ViewportCenterX      = canvas.ViewportCenterX;
                    existingCanvas.ViewportCenterY      = canvas.ViewportCenterY;
                    existingCanvas.ViewportWidth        = canvas.ViewportWidth;
                    existingCanvas.ViewportHeight       = canvas.ViewportHeight;
                    existingCanvas.ZoomScale            = canvas.ZoomScale;
                    existingCanvas.GridVisible          = canvas.GridVisible;
                    existingCanvas.GridColor            = canvas.GridColor;
                    existingCanvas.GridSpacingX         = canvas.GridSpacingX;
                    existingCanvas.GridSpacingY         = canvas.GridSpacingY;
                    existingCanvas.ShowOriginMarker     = canvas.ShowOriginMarker;
                    existingCanvas.ShowAxes             = canvas.ShowAxes;
                    existingCanvas.PanEnabled           = canvas.PanEnabled;
                    existingCanvas.ZoomEnabled          = canvas.ZoomEnabled;
                    existingCanvas.UpdatedAt            = DateTime.UtcNow;
                }

                await _db.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"[Repository] SaveDiagramAsync failed: {ex.Message}");
                return false;
            }
        }
    }
}
