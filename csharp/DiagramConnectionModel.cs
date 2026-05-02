using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Antitouch.Models
{
    public class DiagramConnectionModel
    {
        [Key]
        [MaxLength(64)]
        public string ConnectionID { get; set; } = Guid.NewGuid().ToString();
        
        [MaxLength(64)]
        public string DiagramID { get; set; } = string.Empty;
        
        [MaxLength(64)]
        public string SourceItemID { get; set; } = string.Empty;
        
        [MaxLength(50)]
        public string SourceItemKind { get; set; } = string.Empty;
        
        [MaxLength(64)]
        public string DestinationItemID { get; set; } = string.Empty;
        
        [MaxLength(50)]
        public string DestinationItemKind { get; set; } = string.Empty;
        
        [MaxLength(100)]
        public string ConnectionType { get; set; } = string.Empty;
        
        public bool IsDeleted { get; set; } = false;

        public DiagramModel Diagram { get; set; } = null!;
        public DiagramConnectionDetailModel Detail { get; set; } = null!;
    }

    public class DiagramConnectionDetailModel
    {
        [Key]
        [MaxLength(64)]
        public string ConnectionDetailID { get; set; } = Guid.NewGuid().ToString();
        
        [MaxLength(64)]
        public string ConnectionID { get; set; } = string.Empty;
        
        [MaxLength(100)]
        public string ConnectionRouteType { get; set; } = string.Empty;
        
        [MaxLength(64)]
        public string? SourceJunctionPointID { get; set; }
        
        [MaxLength(64)]
        public string? DestinationJunctionPointID { get; set; }
        
        [MaxLength(50)]
        public string LineType { get; set; } = string.Empty;
        
        [MaxLength(50)]
        public string LineColor { get; set; } = string.Empty;
        
        public double LineWidth { get; set; }
        
        [MaxLength(50)]
        public string? ThicknessName { get; set; }
        
        [MaxLength(200)]
        public string? SourceJunctionText { get; set; }
        
        [MaxLength(200)]
        public string? DestinationJunctionText { get; set; }
        
        [MaxLength(200)]
        public string? MiddleLineText { get; set; }
        
        public bool IsDirectional { get; set; }
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("ConnectionID")]
        public DiagramConnectionModel Connection { get; set; } = null!;
    }

    public class ConnectionTypeLookupModel
    {
        [Key]
        public int LookupID { get; set; }
        
        [MaxLength(100)]
        public string SourceDeviceType { get; set; } = string.Empty;
        
        [MaxLength(100)]
        public string DestinationDeviceType { get; set; } = string.Empty;
        
        public string PossibleConnections { get; set; } = string.Empty;
        
        public bool? IsDirectional { get; set; }
    }

    public class ConnectionStyleDefaultModel
    {
        [Key]
        [MaxLength(100)]
        public string ConnectionType { get; set; } = string.Empty;
        
        [MaxLength(50)]
        public string DefaultLineType { get; set; } = string.Empty;
        
        [MaxLength(50)]
        public string DefaultLineColor { get; set; } = string.Empty;
        
        public double DefaultLineWidth { get; set; }
        
        [MaxLength(50)]
        public string ThicknessName { get; set; } = string.Empty;
        
        [MaxLength(200)]
        public string? DefaultDashPattern { get; set; }
        
        public bool IsActive { get; set; } = true;
    }
}
