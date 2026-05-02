using System;
using System.ComponentModel.DataAnnotations;

namespace Antitouch.Models
{
    public class DiagramCanvasModel
    {
        [Key]
        public string CanvasID { get; set; } = Guid.NewGuid().ToString();
        public string DiagramID { get; set; } = string.Empty;
        public string CanvasName { get; set; } = "MainCanvas";
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

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public List<DiagramShapeModel> Shapes { get; set; } = new List<DiagramShapeModel>();
    }

    public class DiagramModel
    {
        [Key]
        public string DiagramID { get; set; } = Guid.NewGuid().ToString();
        [Required]
        [MaxLength(200)]
        public string DiagramName { get; set; } = "New Diagram";
        public int DiagramVersion { get; set; } = 1;
        public string CanvasID { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public bool IsDeleted { get; set; } = false;

        public List<DiagramShapeModel> Shapes { get; set; } = new List<DiagramShapeModel>();
        public List<DiagramConnectionModel> Connections { get; set; } = new List<DiagramConnectionModel>();
    }
}
