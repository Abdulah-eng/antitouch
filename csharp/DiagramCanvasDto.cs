using System;

namespace Antitouch.Models
{
    public class DiagramCanvasDto
    {
        public string CanvasID { get; set; } = string.Empty;
        public string CanvasName { get; set; } = string.Empty;
        public string BackgroundColor { get; set; } = "#FFFFFF";
        public string CoordinateSystemType { get; set; } = "CenterBasedWorld";
        public string OriginDefinition { get; set; } = "Center";
        public string AxisOrientationX { get; set; } = "RightPositive";
        public string AxisOrientationY { get; set; } = "UpPositive";
        public string AxisOrientationZ { get; set; } = "FrontPositive";
        public bool IsInfiniteX { get; set; } = true;
        public bool IsInfiniteY { get; set; } = true;
        public bool IsInfiniteZ { get; set; } = true;
        public double ViewportCenterX { get; set; }
        public double ViewportCenterY { get; set; }
        public double ViewportWidth { get; set; } = 1000;
        public double ViewportHeight { get; set; } = 800;
        public double ZoomScale { get; set; } = 1.0;
        public bool GridVisible { get; set; } = true;
        public string GridColor { get; set; } = "#D0D0D0";
        public double GridSpacingX { get; set; } = 20;
        public double GridSpacingY { get; set; } = 20;
        public bool ShowOriginMarker { get; set; } = true;
        public bool ShowAxes { get; set; } = true;
        public bool PanEnabled { get; set; } = true;
        public bool ZoomEnabled { get; set; } = true;

        // Meta and Content
        public string DiagramID { get; set; } = string.Empty;
        public string DiagramName { get; set; } = string.Empty;
        public int DiagramVersion { get; set; }

        public List<DiagramShapeDto> Shapes { get; set; } = new List<DiagramShapeDto>();
    }
}
