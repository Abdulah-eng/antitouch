using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Antitouch.Models;

namespace Antitouch.Services
{
    public interface IDiagramCanvasService
    {
        Task<DiagramCanvasDto?> SaveDiagramAsync(DiagramCanvasDto dto);
        Task<DiagramCanvasDto?> GetDiagramAsync(string diagramId);
        Task<IEnumerable<DiagramSummaryDto>> ListDiagramsAsync();
    }

    public class DiagramCanvasService : IDiagramCanvasService
    {
        private readonly IDiagramCanvasRepository _repository;

        public DiagramCanvasService(IDiagramCanvasRepository repository)
        {
            _repository = repository;
        }

        public async Task<DiagramCanvasDto?> SaveDiagramAsync(DiagramCanvasDto dto)
        {
            // 1. Validate DTO
            if (string.IsNullOrEmpty(dto.DiagramName)) return null;

            // 2. Map DTO to Models
            var diagram = new DiagramModel
            {
                DiagramID = string.IsNullOrEmpty(dto.DiagramID) ? Guid.NewGuid().ToString() : dto.DiagramID,
                DiagramName = dto.DiagramName,
                DiagramVersion = dto.DiagramVersion + 1,
                CanvasID = string.IsNullOrEmpty(dto.CanvasID) ? Guid.NewGuid().ToString() : dto.CanvasID
            };

            var canvas = new DiagramCanvasModel
            {
                CanvasID = diagram.CanvasID,
                DiagramID = diagram.DiagramID,
                CanvasName = dto.CanvasName,
                BackgroundColor = dto.BackgroundColor,
                ViewportCenterX = dto.ViewportCenterX,
                ViewportCenterY = dto.ViewportCenterY,
                ViewportWidth = dto.ViewportWidth,
                ViewportHeight = dto.ViewportHeight,
                ZoomScale = dto.ZoomScale,
                GridVisible = dto.GridVisible,
                GridColor = dto.GridColor,
                GridSpacingX = dto.GridSpacingX,
                GridSpacingY = dto.GridSpacingY,
                ShowOriginMarker = dto.ShowOriginMarker,
                ShowAxes = dto.ShowAxes,
                PanEnabled = dto.PanEnabled,
                ZoomEnabled = dto.ZoomEnabled
            };

            // 2.5 Map Shapes
            if (dto.Shapes != null)
            {
                foreach (var sDto in dto.Shapes)
                {
                    diagram.Shapes.Add(new DiagramShapeModel
                    {
                        ShapeID = string.IsNullOrEmpty(sDto.ShapeID) ? Guid.NewGuid().ToString() : sDto.ShapeID,
                        DiagramID = diagram.DiagramID,
                        Type = sDto.Type,
                        Label = sDto.Label,
                        WorldX = sDto.WorldX,
                        WorldY = sDto.WorldY,
                        Width = sDto.Width,
                        Height = sDto.Height,
                        Color = sDto.Color,
                        StrokeColor = sDto.StrokeColor,
                        FillColor = sDto.FillColor,
                        SvgIcon = sDto.SvgIcon,
                        Radius = sDto.Radius,
                        ZOrder = sDto.ZOrder,
                        FillType = sDto.FillType,
                        LineType = sDto.LineType,
                        LineWidth = sDto.LineWidth,
                        HoverPaddingRadiusRatio = sDto.HoverPaddingRadiusRatio,
                        HoverPaddingColor = sDto.HoverPaddingColor,
                        ProtectionPaddingRadiusRatio = sDto.ProtectionPaddingRadiusRatio,
                        ProtectionPaddingColor = sDto.ProtectionPaddingColor,
                        ParentContainerID = sDto.ParentContainerID
                    });
                }
            }

            // 2.6 Map Connections
            if (dto.Connections != null)
            {
                foreach (var cDto in dto.Connections)
                {
                    diagram.Connections.Add(new DiagramConnectionModel
                    {
                        ConnectionID = string.IsNullOrEmpty(cDto.ConnectionID) ? Guid.NewGuid().ToString() : cDto.ConnectionID,
                        DiagramID = diagram.DiagramID,
                        SourceItemID = cDto.SourceItemID,
                        SourceItemKind = cDto.SourceItemKind,
                        DestinationItemID = cDto.DestinationItemID,
                        DestinationItemKind = cDto.DestinationItemKind,
                        ConnectionType = cDto.ConnectionType,
                        Detail = cDto.Detail != null ? new DiagramConnectionDetailModel
                        {
                            ConnectionRouteType = cDto.Detail.ConnectionRouteType,
                            SourceJunctionPointID = cDto.Detail.SourceJunctionPointID,
                            DestinationJunctionPointID = cDto.Detail.DestinationJunctionPointID,
                            LineType = cDto.Detail.LineType,
                            LineColor = cDto.Detail.LineColor,
                            LineWidth = cDto.Detail.LineWidth,
                            ThicknessName = cDto.Detail.ThicknessName,
                            SourceJunctionText = cDto.Detail.SourceJunctionText,
                            DestinationJunctionText = cDto.Detail.DestinationJunctionText,
                            MiddleLineText = cDto.Detail.MiddleLineText,
                            IsDirectional = cDto.Detail.IsDirectional
                        } : new DiagramConnectionDetailModel()
                    });
                }
            }

            // 3. Persist
            bool success = await _repository.SaveDiagramAsync(diagram, canvas);
            if (!success) return null;

            // 4. Return updated DTO
            dto.DiagramID = diagram.DiagramID;
            dto.CanvasID = canvas.CanvasID;
            dto.DiagramVersion = diagram.DiagramVersion;
            
            return dto;
        }

        public async Task<DiagramCanvasDto?> GetDiagramAsync(string diagramId)
        {
            var diagram = await _repository.GetDiagramByIdAsync(diagramId);
            var canvas = await _repository.GetCanvasByDiagramIdAsync(diagramId);

            if (diagram == null || canvas == null) return null;

            return new DiagramCanvasDto
            {
                DiagramID = diagram.DiagramID,
                DiagramName = diagram.DiagramName,
                DiagramVersion = diagram.DiagramVersion,
                CanvasID = canvas.CanvasID,
                CanvasName = canvas.CanvasName,
                BackgroundColor = canvas.BackgroundColor,
                ViewportCenterX = canvas.ViewportCenterX,
                ViewportCenterY = canvas.ViewportCenterY,
                ViewportWidth = canvas.ViewportWidth,
                ViewportHeight = canvas.ViewportHeight,
                ZoomScale = canvas.ZoomScale,
                GridVisible = canvas.GridVisible,
                GridColor = canvas.GridColor,
                GridSpacingX = canvas.GridSpacingX,
                GridSpacingY = canvas.GridSpacingY,
                ShowOriginMarker = canvas.ShowOriginMarker, // BUG-13 fix: was missing
                ShowAxes = canvas.ShowAxes,
                PanEnabled = canvas.PanEnabled,
                ZoomEnabled = canvas.ZoomEnabled,
                Shapes = diagram.Shapes?.Select(s => new DiagramShapeDto
                {
                    ShapeID = s.ShapeID,
                    DiagramID = s.DiagramID,
                    Type = s.Type,
                    Label = s.Label,
                    WorldX = s.WorldX,
                    WorldY = s.WorldY,
                    Width = s.Width,
                    Height = s.Height,
                    Color = s.Color,
                    StrokeColor = s.StrokeColor,
                    FillColor = s.FillColor,
                    SvgIcon = s.SvgIcon,
                    Radius = s.Radius,
                    ZOrder = s.ZOrder,
                    FillType = s.FillType,
                    LineType = s.LineType,
                    LineWidth = s.LineWidth,
                    HoverPaddingRadiusRatio = s.HoverPaddingRadiusRatio,
                    HoverPaddingColor = s.HoverPaddingColor,
                    ProtectionPaddingRadiusRatio = s.ProtectionPaddingRadiusRatio,
                    ProtectionPaddingColor = s.ProtectionPaddingColor,
                    ParentContainerID = s.ParentContainerID
                }).ToList() ?? new List<DiagramShapeDto>(),
                Connections = diagram.Connections?.Select(c => new ConnectionDto
                {
                    ConnectionID = c.ConnectionID,
                    DiagramID = c.DiagramID,
                    SourceItemID = c.SourceItemID,
                    SourceItemKind = c.SourceItemKind,
                    DestinationItemID = c.DestinationItemID,
                    DestinationItemKind = c.DestinationItemKind,
                    ConnectionType = c.ConnectionType,
                    IsDeleted = c.IsDeleted,
                    Detail = c.Detail != null ? new ConnectionDetailDto
                    {
                        ConnectionDetailID = c.Detail.ConnectionDetailID,
                        ConnectionRouteType = c.Detail.ConnectionRouteType,
                        SourceJunctionPointID = c.Detail.SourceJunctionPointID,
                        DestinationJunctionPointID = c.Detail.DestinationJunctionPointID,
                        LineType = c.Detail.LineType,
                        LineColor = c.Detail.LineColor,
                        LineWidth = c.Detail.LineWidth,
                        ThicknessName = c.Detail.ThicknessName,
                        SourceJunctionText = c.Detail.SourceJunctionText,
                        DestinationJunctionText = c.Detail.DestinationJunctionText,
                        MiddleLineText = c.Detail.MiddleLineText,
                        IsDirectional = c.Detail.IsDirectional
                    } : new ConnectionDetailDto()
                }).ToList() ?? new List<ConnectionDto>()
            };
        }

        public async Task<IEnumerable<DiagramSummaryDto>> ListDiagramsAsync()
        {
            var diagrams = await _repository.ListDiagramsAsync();
            return diagrams.Select(d => new DiagramSummaryDto
            {
                DiagramID = d.DiagramID,
                DiagramName = d.DiagramName,
                DiagramVersion = d.DiagramVersion,
                UpdatedAt = d.UpdatedAt,
                CanvasID = d.CanvasID
            });
        }
    }
}
