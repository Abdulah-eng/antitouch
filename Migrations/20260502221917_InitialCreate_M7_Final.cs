using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Antitouch.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate_M7_Final : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ConnectionStyleDefaults",
                columns: table => new
                {
                    ConnectionType = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    DefaultLineType = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    DefaultLineColor = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    DefaultLineWidth = table.Column<double>(type: "REAL", nullable: false),
                    ThicknessName = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    DefaultDashPattern = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConnectionStyleDefaults", x => x.ConnectionType);
                });

            migrationBuilder.CreateTable(
                name: "ConnectionTypeLookups",
                columns: table => new
                {
                    LookupID = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    SourceDeviceType = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    DestinationDeviceType = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    PossibleConnections = table.Column<string>(type: "TEXT", nullable: false),
                    IsDirectional = table.Column<bool>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConnectionTypeLookups", x => x.LookupID);
                });

            migrationBuilder.CreateTable(
                name: "DiagramCanvases",
                columns: table => new
                {
                    CanvasID = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    DiagramID = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    CanvasName = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    BackgroundColor = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    CoordinateSystemType = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    OriginDefinition = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    AxisOrientationX = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    AxisOrientationY = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    AxisOrientationZ = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    IsInfiniteX = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsInfiniteY = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsInfiniteZ = table.Column<bool>(type: "INTEGER", nullable: false),
                    ViewportCenterX = table.Column<double>(type: "REAL", nullable: false),
                    ViewportCenterY = table.Column<double>(type: "REAL", nullable: false),
                    ViewportWidth = table.Column<double>(type: "REAL", nullable: false),
                    ViewportHeight = table.Column<double>(type: "REAL", nullable: false),
                    ZoomScale = table.Column<double>(type: "REAL", nullable: false),
                    GridVisible = table.Column<bool>(type: "INTEGER", nullable: false),
                    GridColor = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    GridSpacingX = table.Column<double>(type: "REAL", nullable: false),
                    GridSpacingY = table.Column<double>(type: "REAL", nullable: false),
                    ShowOriginMarker = table.Column<bool>(type: "INTEGER", nullable: false),
                    ShowAxes = table.Column<bool>(type: "INTEGER", nullable: false),
                    PanEnabled = table.Column<bool>(type: "INTEGER", nullable: false),
                    ZoomEnabled = table.Column<bool>(type: "INTEGER", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DiagramCanvases", x => x.CanvasID);
                });

            migrationBuilder.CreateTable(
                name: "Diagrams",
                columns: table => new
                {
                    DiagramID = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    DiagramName = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    DiagramVersion = table.Column<int>(type: "INTEGER", nullable: false),
                    CanvasID = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Diagrams", x => x.DiagramID);
                });

            migrationBuilder.CreateTable(
                name: "ShapeHierarchies",
                columns: table => new
                {
                    HierarchyID = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ShapeType = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Label = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    ParentType = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    CloudProvider = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    SortOrder = table.Column<int>(type: "INTEGER", nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShapeHierarchies", x => x.HierarchyID);
                });

            migrationBuilder.CreateTable(
                name: "DiagramConnections",
                columns: table => new
                {
                    ConnectionID = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    DiagramID = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    SourceItemID = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    SourceItemKind = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    DestinationItemID = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    DestinationItemKind = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    ConnectionType = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false),
                    DiagramModelDiagramID = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DiagramConnections", x => x.ConnectionID);
                    table.ForeignKey(
                        name: "FK_DiagramConnections_Diagrams_DiagramID",
                        column: x => x.DiagramID,
                        principalTable: "Diagrams",
                        principalColumn: "DiagramID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DiagramConnections_Diagrams_DiagramModelDiagramID",
                        column: x => x.DiagramModelDiagramID,
                        principalTable: "Diagrams",
                        principalColumn: "DiagramID");
                });

            migrationBuilder.CreateTable(
                name: "DiagramShapes",
                columns: table => new
                {
                    ShapeID = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    Type = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Label = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    WorldX = table.Column<double>(type: "REAL", nullable: false),
                    WorldY = table.Column<double>(type: "REAL", nullable: false),
                    Width = table.Column<double>(type: "REAL", nullable: false),
                    Height = table.Column<double>(type: "REAL", nullable: false),
                    Color = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    StrokeColor = table.Column<string>(type: "TEXT", nullable: false),
                    FillColor = table.Column<string>(type: "TEXT", nullable: false),
                    SvgIcon = table.Column<string>(type: "TEXT", nullable: false),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false),
                    Radius = table.Column<double>(type: "REAL", nullable: true),
                    ZOrder = table.Column<int>(type: "INTEGER", nullable: false),
                    FillType = table.Column<string>(type: "TEXT", nullable: true),
                    LineType = table.Column<string>(type: "TEXT", nullable: true),
                    LineWidth = table.Column<double>(type: "REAL", nullable: true),
                    HoverPaddingRadiusRatio = table.Column<double>(type: "REAL", nullable: true),
                    HoverPaddingColor = table.Column<string>(type: "TEXT", nullable: true),
                    ProtectionPaddingRadiusRatio = table.Column<double>(type: "REAL", nullable: true),
                    ProtectionPaddingColor = table.Column<string>(type: "TEXT", nullable: true),
                    ParentContainerID = table.Column<string>(type: "TEXT", nullable: true),
                    DiagramID = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DiagramShapes", x => x.ShapeID);
                    table.ForeignKey(
                        name: "FK_DiagramShapes_Diagrams_DiagramID",
                        column: x => x.DiagramID,
                        principalTable: "Diagrams",
                        principalColumn: "DiagramID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DiagramConnectionDetails",
                columns: table => new
                {
                    ConnectionDetailID = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    ConnectionID = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    ConnectionRouteType = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    SourceJunctionPointID = table.Column<string>(type: "TEXT", maxLength: 64, nullable: true),
                    DestinationJunctionPointID = table.Column<string>(type: "TEXT", maxLength: 64, nullable: true),
                    LineType = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    LineColor = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    LineWidth = table.Column<double>(type: "REAL", nullable: false),
                    ThicknessName = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    SourceJunctionText = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    DestinationJunctionText = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    MiddleLineText = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    IsDirectional = table.Column<bool>(type: "INTEGER", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DiagramConnectionDetails", x => x.ConnectionDetailID);
                    table.ForeignKey(
                        name: "FK_DiagramConnectionDetails_DiagramConnections_ConnectionID",
                        column: x => x.ConnectionID,
                        principalTable: "DiagramConnections",
                        principalColumn: "ConnectionID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DiagramCanvases_DiagramID",
                table: "DiagramCanvases",
                column: "DiagramID",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DiagramConnectionDetails_ConnectionID",
                table: "DiagramConnectionDetails",
                column: "ConnectionID",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DiagramConnections_DiagramID",
                table: "DiagramConnections",
                column: "DiagramID");

            migrationBuilder.CreateIndex(
                name: "IX_DiagramConnections_DiagramModelDiagramID",
                table: "DiagramConnections",
                column: "DiagramModelDiagramID");

            migrationBuilder.CreateIndex(
                name: "IX_DiagramShapes_DiagramID",
                table: "DiagramShapes",
                column: "DiagramID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ConnectionStyleDefaults");

            migrationBuilder.DropTable(
                name: "ConnectionTypeLookups");

            migrationBuilder.DropTable(
                name: "DiagramCanvases");

            migrationBuilder.DropTable(
                name: "DiagramConnectionDetails");

            migrationBuilder.DropTable(
                name: "DiagramShapes");

            migrationBuilder.DropTable(
                name: "ShapeHierarchies");

            migrationBuilder.DropTable(
                name: "DiagramConnections");

            migrationBuilder.DropTable(
                name: "Diagrams");
        }
    }
}
