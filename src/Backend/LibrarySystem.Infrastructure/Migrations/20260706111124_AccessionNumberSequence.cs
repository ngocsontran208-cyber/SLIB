using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LibrarySystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AccessionNumberSequence : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PhysicalItems_Catalogs_CatalogId",
                table: "PhysicalItems");

            migrationBuilder.CreateSequence<int>(
                name: "BarcodeSequence",
                startValue: 100000L);

            migrationBuilder.AlterColumn<int>(
                name: "CatalogId",
                table: "PhysicalItems",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "BibliographicRecordId",
                table: "PhysicalItems",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_PhysicalItems_BibliographicRecordId",
                table: "PhysicalItems",
                column: "BibliographicRecordId");

            migrationBuilder.AddForeignKey(
                name: "FK_PhysicalItems_BibliographicRecords_BibliographicRecordId",
                table: "PhysicalItems",
                column: "BibliographicRecordId",
                principalTable: "BibliographicRecords",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PhysicalItems_Catalogs_CatalogId",
                table: "PhysicalItems",
                column: "CatalogId",
                principalTable: "Catalogs",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PhysicalItems_BibliographicRecords_BibliographicRecordId",
                table: "PhysicalItems");

            migrationBuilder.DropForeignKey(
                name: "FK_PhysicalItems_Catalogs_CatalogId",
                table: "PhysicalItems");

            migrationBuilder.DropIndex(
                name: "IX_PhysicalItems_BibliographicRecordId",
                table: "PhysicalItems");

            migrationBuilder.DropColumn(
                name: "BibliographicRecordId",
                table: "PhysicalItems");

            migrationBuilder.DropSequence(
                name: "BarcodeSequence");

            migrationBuilder.AlterColumn<int>(
                name: "CatalogId",
                table: "PhysicalItems",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_PhysicalItems_Catalogs_CatalogId",
                table: "PhysicalItems",
                column: "CatalogId",
                principalTable: "Catalogs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
