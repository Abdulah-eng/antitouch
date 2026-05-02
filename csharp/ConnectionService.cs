using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Antitouch.Models
{
    public class ConnectionService
    {
        private readonly ConnectionRepository _repository;

        public ConnectionService(ConnectionRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<ConnectionDto>> GetConnectionsAsync(string diagramId)
        {
            var models = await _repository.GetConnectionsByDiagramIdAsync(diagramId);
            return models.Select(m => new ConnectionDto
            {
                ConnectionID = m.ConnectionID,
                DiagramID = m.DiagramID,
                SourceItemID = m.SourceItemID,
                SourceItemKind = m.SourceItemKind,
                DestinationItemID = m.DestinationItemID,
                DestinationItemKind = m.DestinationItemKind,
                ConnectionType = m.ConnectionType,
                IsDeleted = m.IsDeleted,
                Detail = m.Detail != null ? new ConnectionDetailDto
                {
                    ConnectionDetailID = m.Detail.ConnectionDetailID,
                    ConnectionRouteType = m.Detail.ConnectionRouteType,
                    SourceJunctionPointID = m.Detail.SourceJunctionPointID,
                    DestinationJunctionPointID = m.Detail.DestinationJunctionPointID,
                    LineType = m.Detail.LineType,
                    LineColor = m.Detail.LineColor,
                    LineWidth = m.Detail.LineWidth,
                    ThicknessName = m.Detail.ThicknessName,
                    SourceJunctionText = m.Detail.SourceJunctionText,
                    DestinationJunctionText = m.Detail.DestinationJunctionText,
                    MiddleLineText = m.Detail.MiddleLineText,
                    IsDirectional = m.Detail.IsDirectional
                } : new ConnectionDetailDto()
            }).ToList();
        }

        public async Task SaveConnectionsAsync(string diagramId, List<ConnectionDto> dtos)
        {
            var diagramExists = await _repository.DiagramExistsAsync(diagramId);
            if (!diagramExists)
            {
                throw new InvalidOperationException($"Cannot save connection. Diagram '{diagramId}' does not exist in the database. Save the diagram first.");
            }

            var models = dtos.Select(d => new DiagramConnectionModel
            {
                ConnectionID = string.IsNullOrEmpty(d.ConnectionID) ? Guid.NewGuid().ToString() : d.ConnectionID,
                DiagramID = diagramId,
                SourceItemID = d.SourceItemID,
                SourceItemKind = d.SourceItemKind,
                DestinationItemID = d.DestinationItemID,
                DestinationItemKind = d.DestinationItemKind,
                ConnectionType = d.ConnectionType,
                IsDeleted = d.IsDeleted,
                Detail = new DiagramConnectionDetailModel
                {
                    ConnectionDetailID = string.IsNullOrEmpty(d.Detail.ConnectionDetailID) ? Guid.NewGuid().ToString() : d.Detail.ConnectionDetailID,
                    ConnectionRouteType = d.Detail.ConnectionRouteType,
                    SourceJunctionPointID = d.Detail.SourceJunctionPointID,
                    DestinationJunctionPointID = d.Detail.DestinationJunctionPointID,
                    LineType = d.Detail.LineType,
                    LineColor = d.Detail.LineColor,
                    LineWidth = d.Detail.LineWidth,
                    ThicknessName = d.Detail.ThicknessName,
                    SourceJunctionText = d.Detail.SourceJunctionText,
                    DestinationJunctionText = d.Detail.DestinationJunctionText,
                    MiddleLineText = d.Detail.MiddleLineText,
                    IsDirectional = d.Detail.IsDirectional,
                    UpdatedAt = DateTime.UtcNow
                }
            }).ToList();

            foreach (var m in models)
            {
                m.Detail.ConnectionID = m.ConnectionID;
            }

            await _repository.SaveConnectionsAsync(models);
        }

        public async Task<List<ConnectionTypeLookupDto>> GetLookupsAsync()
        {
            var models = await _repository.GetLookupsAsync();
            return models.Select(m => new ConnectionTypeLookupDto
            {
                SourceDeviceType = m.SourceDeviceType,
                DestinationDeviceType = m.DestinationDeviceType,
                IsDirectional = m.IsDirectional,
                PossibleConnections = m.PossibleConnections.Split(new[] { " OR " }, StringSplitOptions.RemoveEmptyEntries).ToList()
            }).ToList();
        }

        public async Task<List<ConnectionStyleDefaultDto>> GetStyleDefaultsAsync()
        {
            var models = await _repository.GetStyleDefaultsAsync();
            return models.Select(m => new ConnectionStyleDefaultDto
            {
                ConnectionType = m.ConnectionType,
                DefaultLineType = m.DefaultLineType,
                DefaultLineColor = m.DefaultLineColor,
                DefaultLineWidth = m.DefaultLineWidth,
                ThicknessName = m.ThicknessName,
                DefaultDashPattern = m.DefaultDashPattern,
                IsActive = m.IsActive
            }).ToList();
        }

        public async Task SaveStyleDefaultsAsync(List<ConnectionStyleDefaultDto> dtos)
        {
            var models = dtos.Select(d => new ConnectionStyleDefaultModel
            {
                ConnectionType = d.ConnectionType,
                DefaultLineType = d.DefaultLineType,
                DefaultLineColor = d.DefaultLineColor,
                DefaultLineWidth = d.DefaultLineWidth,
                ThicknessName = d.ThicknessName,
                DefaultDashPattern = d.DefaultDashPattern,
                IsActive = d.IsActive
            }).ToList();

            await _repository.SaveStyleDefaultsAsync(models);
        }
    }
}
