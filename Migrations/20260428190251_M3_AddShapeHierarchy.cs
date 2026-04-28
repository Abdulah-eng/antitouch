using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Antitouch.Migrations
{
    /// <inheritdoc />
    public partial class M3_AddShapeHierarchy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ShapeHierarchyItems_ShapeHierarchyItems_ParentId",
                table: "ShapeHierarchyItems");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ShapeHierarchyItems",
                table: "ShapeHierarchyItems");

            migrationBuilder.DropIndex(
                name: "IX_ShapeHierarchyItems_ParentId",
                table: "ShapeHierarchyItems");

            migrationBuilder.DeleteData(
                table: "ShapeHierarchyItems",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "ShapeHierarchyItems",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "ShapeHierarchyItems",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "ShapeHierarchyItems",
                keyColumn: "Id",
                keyValue: 1);

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

            migrationBuilder.DropColumn(
                name: "Category",
                table: "ShapeHierarchyItems");

            migrationBuilder.DropColumn(
                name: "DisplayName",
                table: "ShapeHierarchyItems");

            migrationBuilder.DropColumn(
                name: "InvalidDropMessage",
                table: "ShapeHierarchyItems");

            migrationBuilder.DropColumn(
                name: "ParentId",
                table: "ShapeHierarchyItems");

            migrationBuilder.RenameTable(
                name: "ShapeHierarchyItems",
                newName: "ShapeHierarchies");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "ShapeHierarchies",
                newName: "ShapeType");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "ShapeHierarchies",
                newName: "SortOrder");

            migrationBuilder.AlterColumn<int>(
                name: "SortOrder",
                table: "ShapeHierarchies",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .OldAnnotation("Sqlite:Autoincrement", true);

            migrationBuilder.AddColumn<string>(
                name: "HierarchyID",
                table: "ShapeHierarchies",
                type: "TEXT",
                maxLength: 64,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "AllowedParentType",
                table: "ShapeHierarchies",
                type: "TEXT",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DisplayLabel",
                table: "ShapeHierarchies",
                type: "TEXT",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IconKey",
                table: "ShapeHierarchies",
                type: "TEXT",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "ShapeHierarchies",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Provider",
                table: "ShapeHierarchies",
                type: "TEXT",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ShapeHierarchies",
                table: "ShapeHierarchies",
                column: "HierarchyID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_ShapeHierarchies",
                table: "ShapeHierarchies");

            migrationBuilder.DropColumn(
                name: "HierarchyID",
                table: "ShapeHierarchies");

            migrationBuilder.DropColumn(
                name: "AllowedParentType",
                table: "ShapeHierarchies");

            migrationBuilder.DropColumn(
                name: "DisplayLabel",
                table: "ShapeHierarchies");

            migrationBuilder.DropColumn(
                name: "IconKey",
                table: "ShapeHierarchies");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "ShapeHierarchies");

            migrationBuilder.DropColumn(
                name: "Provider",
                table: "ShapeHierarchies");

            migrationBuilder.RenameTable(
                name: "ShapeHierarchies",
                newName: "ShapeHierarchyItems");

            migrationBuilder.RenameColumn(
                name: "ShapeType",
                table: "ShapeHierarchyItems",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "SortOrder",
                table: "ShapeHierarchyItems",
                newName: "Id");

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

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "ShapeHierarchyItems",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Sqlite:Autoincrement", true);

            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "ShapeHierarchyItems",
                type: "TEXT",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DisplayName",
                table: "ShapeHierarchyItems",
                type: "TEXT",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "InvalidDropMessage",
                table: "ShapeHierarchyItems",
                type: "TEXT",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "ParentId",
                table: "ShapeHierarchyItems",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_ShapeHierarchyItems",
                table: "ShapeHierarchyItems",
                column: "Id");

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

            migrationBuilder.AddForeignKey(
                name: "FK_ShapeHierarchyItems_ShapeHierarchyItems_ParentId",
                table: "ShapeHierarchyItems",
                column: "ParentId",
                principalTable: "ShapeHierarchyItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
