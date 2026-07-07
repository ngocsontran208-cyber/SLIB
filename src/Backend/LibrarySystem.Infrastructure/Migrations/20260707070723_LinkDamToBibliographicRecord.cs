using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LibrarySystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class LinkDamToBibliographicRecord : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DigitalAssetValues");

            migrationBuilder.DropTable(
                name: "AssetMetadataConfigs");

            migrationBuilder.AddColumn<int>(
                name: "BibliographicRecordId",
                table: "DigitalAssets",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_DigitalAssets_BibliographicRecordId",
                table: "DigitalAssets",
                column: "BibliographicRecordId");

            migrationBuilder.AddForeignKey(
                name: "FK_DigitalAssets_BibliographicRecords_BibliographicRecordId",
                table: "DigitalAssets",
                column: "BibliographicRecordId",
                principalTable: "BibliographicRecords",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DigitalAssets_BibliographicRecords_BibliographicRecordId",
                table: "DigitalAssets");

            migrationBuilder.DropIndex(
                name: "IX_DigitalAssets_BibliographicRecordId",
                table: "DigitalAssets");

            migrationBuilder.DropColumn(
                name: "BibliographicRecordId",
                table: "DigitalAssets");

            migrationBuilder.CreateTable(
                name: "AssetMetadataConfigs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AssetType = table.Column<int>(type: "int", nullable: false),
                    DataType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FieldName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsRequired = table.Column<bool>(type: "bit", nullable: false),
                    IsSearchable = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssetMetadataConfigs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DigitalAssetValues",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AssetId = table.Column<int>(type: "int", nullable: false),
                    ConfigId = table.Column<int>(type: "int", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DigitalAssetValues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DigitalAssetValues_AssetMetadataConfigs_ConfigId",
                        column: x => x.ConfigId,
                        principalTable: "AssetMetadataConfigs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DigitalAssetValues_DigitalAssets_AssetId",
                        column: x => x.AssetId,
                        principalTable: "DigitalAssets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DigitalAssetValues_AssetId",
                table: "DigitalAssetValues",
                column: "AssetId");

            migrationBuilder.CreateIndex(
                name: "IX_DigitalAssetValues_ConfigId",
                table: "DigitalAssetValues",
                column: "ConfigId");
        }
    }
}
