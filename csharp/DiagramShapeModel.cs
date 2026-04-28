using System.ComponentModel.DataAnnotations;

namespace Antitouch.Models
{
    public class DiagramShapeModel
    {
        [Key]
        public string ShapeID { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        
        public double WorldX { get; set; }
        public double WorldY { get; set; }
        public double Width { get; set; }
        public double Height { get; set; }
        
        public string Color { get; set; } = "#6366f1";
        public string StrokeColor { get; set; } = "#6366f1";
        public string FillColor { get; set; } = "#6366f1";
        public string SvgIcon { get; set; } = string.Empty;
        public bool IsDeleted { get; set; } = false;

        // Foreign Key
        public string DiagramID { get; set; } = string.Empty;
        public DiagramModel? Diagram { get; set; }
    }
}
