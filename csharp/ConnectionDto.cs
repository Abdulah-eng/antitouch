using System;
using System.Collections.Generic;

namespace Antitouch.Models
{
    public class ConnectionDto
    {
        public string ConnectionID { get; set; } = string.Empty;
        public string DiagramID { get; set; } = string.Empty;
        public string SourceItemID { get; set; } = string.Empty;
        public string SourceItemKind { get; set; } = string.Empty;
        public string DestinationItemID { get; set; } = string.Empty;
        public string DestinationItemKind { get; set; } = string.Empty;
        public string ConnectionType { get; set; } = string.Empty;
        public bool IsDeleted { get; set; }
        
        public ConnectionDetailDto Detail { get; set; } = new ConnectionDetailDto();
    }

    public class ConnectionDetailDto
    {
        public string ConnectionDetailID { get; set; } = string.Empty;
        public string ConnectionRouteType { get; set; } = string.Empty;
        public string? SourceJunctionPointID { get; set; }
        public string? DestinationJunctionPointID { get; set; }
        public string LineType { get; set; } = string.Empty;
        public string LineColor { get; set; } = string.Empty;
        public double LineWidth { get; set; }
        public string? ThicknessName { get; set; }
        public string? SourceJunctionText { get; set; }
        public string? DestinationJunctionText { get; set; }
        public string? MiddleLineText { get; set; }
        public bool IsDirectional { get; set; }
    }

    public class ConnectionTypeLookupDto
    {
        public string SourceDeviceType { get; set; } = string.Empty;
        public string DestinationDeviceType { get; set; } = string.Empty;
        public List<string> PossibleConnections { get; set; } = new List<string>();
        public bool? IsDirectional { get; set; }
    }

    public class ConnectionStyleDefaultDto
    {
        public string ConnectionType { get; set; } = string.Empty;
        public string DefaultLineType { get; set; } = string.Empty;
        public string DefaultLineColor { get; set; } = string.Empty;
        public double DefaultLineWidth { get; set; }
        public string ThicknessName { get; set; } = string.Empty;
        public string? DefaultDashPattern { get; set; }
        public bool IsActive { get; set; }
    }
}
