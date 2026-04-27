using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Antitouch.Migrations
{
    /// <inheritdoc />
    public partial class M3_ShapeHierarchy_M5_ShapeFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
                    CircleDefaultStroke = table.Column<string>(type: "TEXT", nullable: false),
                    CircleDefaultFill = table.Column<string>(type: "TEXT", nullable: false),
                    CircleHoverRatio = table.Column<double>(type: "REAL", nullable: false),
                    CircleProtectRatio = table.Column<double>(type: "REAL", nullable: false),
                    RectangleDefaultStroke = table.Column<string>(type: "TEXT", nullable: false),
                    RectangleDefaultFill = table.Column<string>(type: "TEXT", nullable: false),
                    RectangleHoverRatio = table.Column<double>(type: "REAL", nullable: false),
                    RectangleProtectRatio = table.Column<double>(type: "REAL", nullable: false),
                    CircleHandleNormal = table.Column<string>(type: "TEXT", nullable: false),
                    CircleHandleActive = table.Column<string>(type: "TEXT", nullable: false),
                    RectangleHandleNormal = table.Column<string>(type: "TEXT", nullable: false),
                    RectangleHandleActive = table.Column<string>(type: "TEXT", nullable: false),
                    HandleColorNormal = table.Column<string>(type: "TEXT", nullable: false),
                    HandleColorActive = table.Column<string>(type: "TEXT", nullable: false),
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
                    ParentID = table.Column<string>(type: "TEXT", nullable: false),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false),
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

            migrationBuilder.CreateIndex(
                name: "IX_DiagramCanvases_DiagramID",
                table: "DiagramCanvases",
                column: "DiagramID",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DiagramShapes_DiagramID",
                table: "DiagramShapes",
                column: "DiagramID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DiagramCanvases");

            migrationBuilder.DropTable(
                name: "DiagramShapes");

            migrationBuilder.DropTable(
                name: "Diagrams");
        }
    }
}
