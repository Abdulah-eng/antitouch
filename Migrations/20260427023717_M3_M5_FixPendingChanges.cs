using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Antitouch.Migrations
{
    /// <inheritdoc />
    public partial class M3_M5_FixPendingChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ParentID",
                table: "DiagramShapes");

            migrationBuilder.DropColumn(
                name: "CircleDefaultFill",
                table: "DiagramCanvases");

            migrationBuilder.DropColumn(
                name: "CircleDefaultStroke",
                table: "DiagramCanvases");

            migrationBuilder.DropColumn(
                name: "CircleHandleActive",
                table: "DiagramCanvases");

            migrationBuilder.DropColumn(
                name: "CircleHandleNormal",
                table: "DiagramCanvases");

            migrationBuilder.DropColumn(
                name: "CircleHoverRatio",
                table: "DiagramCanvases");

            migrationBuilder.DropColumn(
                name: "CircleProtectRatio",
                table: "DiagramCanvases");

            migrationBuilder.DropColumn(
                name: "HandleColorActive",
                table: "DiagramCanvases");

            migrationBuilder.DropColumn(
                name: "HandleColorNormal",
                table: "DiagramCanvases");

            migrationBuilder.DropColumn(
                name: "RectangleDefaultFill",
                table: "DiagramCanvases");

            migrationBuilder.DropColumn(
                name: "RectangleDefaultStroke",
                table: "DiagramCanvases");

            migrationBuilder.DropColumn(
                name: "RectangleHandleActive",
                table: "DiagramCanvases");

            migrationBuilder.DropColumn(
                name: "RectangleHandleNormal",
                table: "DiagramCanvases");

            migrationBuilder.DropColumn(
                name: "RectangleHoverRatio",
                table: "DiagramCanvases");

            migrationBuilder.DropColumn(
                name: "RectangleProtectRatio",
                table: "DiagramCanvases");

            migrationBuilder.AddColumn<double>(
                name: "HalfHeight",
                table: "DiagramShapes",
                type: "REAL",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "HalfWidth",
                table: "DiagramShapes",
                type: "REAL",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "HoverPaddingXRatio",
                table: "DiagramShapes",
                type: "REAL",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "HoverPaddingYRatio",
                table: "DiagramShapes",
                type: "REAL",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "ParentShapeId",
                table: "DiagramShapes",
                type: "TEXT",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "PreviousValidCenterX",
                table: "DiagramShapes",
                type: "REAL",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "PreviousValidCenterY",
                table: "DiagramShapes",
                type: "REAL",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "ProtectionPaddingXRatio",
                table: "DiagramShapes",
                type: "REAL",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "ProtectionPaddingYRatio",
                table: "DiagramShapes",
                type: "REAL",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.CreateTable(
                name: "ShapeHierarchyItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    DisplayName = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Category = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    ParentId = table.Column<int>(type: "INTEGER", nullable: true),
                    InvalidDropMessage = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShapeHierarchyItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ShapeHierarchyItems_ShapeHierarchyItems_ParentId",
                        column: x => x.ParentId,
                        principalTable: "ShapeHierarchyItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "ShapeHierarchyItems",
                columns: new[] { "Id", "Category", "DisplayName", "InvalidDropMessage", "Name", "ParentId" },
                values: new object[,]
                {
                    { 1, "AWS", "AWS Region", "", "Region", null },
                    { 2, "AWS", "VPC", "Please drop VPC within a Region.", "VPC", 1 },
                    { 3, "AWS", "Availability Zone", "Please drop the availability zone within a VPC. If VPC is not created, please create before creating availability zone.", "AvailabilityZone", 2 },
                    { 4, "AWS", "Route Table", "Please drop the route table within a VPC or Availability Zone. If none exists, please create the required parent first.", "RouteTable", 2 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_ShapeHierarchyItems_ParentId",
                table: "ShapeHierarchyItems",
                column: "ParentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ShapeHierarchyItems");

            migrationBuilder.DropColumn(
                name: "HalfHeight",
                table: "DiagramShapes");

            migrationBuilder.DropColumn(
                name: "HalfWidth",
                table: "DiagramShapes");

            migrationBuilder.DropColumn(
                name: "HoverPaddingXRatio",
                table: "DiagramShapes");

            migrationBuilder.DropColumn(
                name: "HoverPaddingYRatio",
                table: "DiagramShapes");

            migrationBuilder.DropColumn(
                name: "ParentShapeId",
                table: "DiagramShapes");

            migrationBuilder.DropColumn(
                name: "PreviousValidCenterX",
                table: "DiagramShapes");

            migrationBuilder.DropColumn(
                name: "PreviousValidCenterY",
                table: "DiagramShapes");

            migrationBuilder.DropColumn(
                name: "ProtectionPaddingXRatio",
                table: "DiagramShapes");

            migrationBuilder.DropColumn(
                name: "ProtectionPaddingYRatio",
                table: "DiagramShapes");

            migrationBuilder.AddColumn<string>(
                name: "ParentID",
                table: "DiagramShapes",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CircleDefaultFill",
                table: "DiagramCanvases",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CircleDefaultStroke",
                table: "DiagramCanvases",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CircleHandleActive",
                table: "DiagramCanvases",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CircleHandleNormal",
                table: "DiagramCanvases",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "CircleHoverRatio",
                table: "DiagramCanvases",
                type: "REAL",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "CircleProtectRatio",
                table: "DiagramCanvases",
                type: "REAL",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "HandleColorActive",
                table: "DiagramCanvases",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "HandleColorNormal",
                table: "DiagramCanvases",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "RectangleDefaultFill",
                table: "DiagramCanvases",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "RectangleDefaultStroke",
                table: "DiagramCanvases",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "RectangleHandleActive",
                table: "DiagramCanvases",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "RectangleHandleNormal",
                table: "DiagramCanvases",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "RectangleHoverRatio",
                table: "DiagramCanvases",
                type: "REAL",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "RectangleProtectRatio",
                table: "DiagramCanvases",
                type: "REAL",
                nullable: false,
                defaultValue: 0.0);
        }
    }
}
