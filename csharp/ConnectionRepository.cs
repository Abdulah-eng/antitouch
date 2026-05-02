using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Antitouch.Data;

namespace Antitouch.Models
{
    public class ConnectionRepository
    {
        private readonly DiagramDbContext _context;

        public ConnectionRepository(DiagramDbContext context)
        {
            _context = context;
        }

        public async Task<List<DiagramConnectionModel>> GetConnectionsByDiagramIdAsync(string diagramId)
        {
            return await _context.DiagramConnections
                .Include(c => c.Detail)
                .Where(c => c.DiagramID == diagramId && !c.IsDeleted)
                .ToListAsync();
        }

        public async Task<bool> DiagramExistsAsync(string diagramId)
        {
            return await _context.Diagrams.AnyAsync(d => d.DiagramID == diagramId);
        }

        public async Task SaveConnectionsAsync(List<DiagramConnectionModel> connections)
        {
            foreach (var conn in connections)
            {
                var existing = await _context.DiagramConnections
                    .Include(c => c.Detail)
                    .FirstOrDefaultAsync(c => c.ConnectionID == conn.ConnectionID);

                if (existing == null)
                {
                    _context.DiagramConnections.Add(conn);
                }
                else
                {
                    _context.Entry(existing).CurrentValues.SetValues(conn);
                    if (existing.Detail != null && conn.Detail != null)
                    {
                        _context.Entry(existing.Detail).CurrentValues.SetValues(conn.Detail);
                    }
                    else if (existing.Detail == null && conn.Detail != null)
                    {
                        conn.Detail.ConnectionID = existing.ConnectionID;
                        existing.Detail = conn.Detail;
                    }
                }
            }
            await _context.SaveChangesAsync();
        }

        public async Task<List<ConnectionTypeLookupModel>> GetLookupsAsync()
        {
            return await _context.ConnectionTypeLookups.ToListAsync();
        }

        public async Task<List<ConnectionStyleDefaultModel>> GetStyleDefaultsAsync()
        {
            return await _context.ConnectionStyleDefaults.Where(s => s.IsActive).ToListAsync();
        }

        public async Task SaveStyleDefaultsAsync(List<ConnectionStyleDefaultModel> styles)
        {
            foreach (var style in styles)
            {
                var existing = await _context.ConnectionStyleDefaults
                    .FirstOrDefaultAsync(s => s.ConnectionType == style.ConnectionType);

                if (existing == null)
                {
                    _context.ConnectionStyleDefaults.Add(style);
                }
                else
                {
                    _context.Entry(existing).CurrentValues.SetValues(style);
                }
            }
            await _context.SaveChangesAsync();
        }

        public async Task SaveLookupsAsync(List<ConnectionTypeLookupModel> lookups)
        {
            foreach (var lookup in lookups)
            {
                var existing = await _context.ConnectionTypeLookups
                    .FirstOrDefaultAsync(l => l.SourceDeviceType == lookup.SourceDeviceType && l.DestinationDeviceType == lookup.DestinationDeviceType);

                if (existing == null)
                {
                    _context.ConnectionTypeLookups.Add(lookup);
                }
                else
                {
                    _context.Entry(existing).CurrentValues.SetValues(lookup);
                }
            }
            await _context.SaveChangesAsync();
        }
    }
}
