namespace Antitouch.Models
{
    public class DiagramShapeDto
    {
        public string ShapeID { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // e.g. "RECT", "CIRCLE"
        public string Label { get; set; } = string.Empty;
        
        public double WorldX { get; set; }
        public double WorldY { get; set; }
        public double Width { get; set; }
        public double Height { get; set; }
        
        public string Color { get; set; } = "#6366f1";
        public string StrokeColor { get; set; } = "#6366f1";
        public string FillColor { get; set; } = "#6366f1";
        public string SvgIcon { get; set; } = string.Empty;
        
        // Links back to the diagram
        public string DiagramID { get; set; } = string.Empty;
    }
}
