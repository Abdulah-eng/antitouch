using System;

namespace Antitouch.Models
{
    public class DiagramSummaryDto
    {
        public string DiagramID { get; set; } = string.Empty;
        public string DiagramName { get; set; } = string.Empty;
        public int DiagramVersion { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string CanvasID { get; set; } = string.Empty;
    }
}
