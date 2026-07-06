using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LibrarySystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddErmSushi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ElectronicResourceLicenses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VendorId = table.Column<int>(type: "int", nullable: false),
                    ResourceName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Cost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ConcurrentUsers = table.Column<int>(type: "int", nullable: false),
                    ValidFrom = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ValidTo = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SushiApiUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SushiApiKey = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RequestorId = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ElectronicResourceLicenses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ElectronicResourceLicenses_Vendors_VendorId",
                        column: x => x.VendorId,
                        principalTable: "Vendors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CounterStatistics",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LicenseId = table.Column<int>(type: "int", nullable: false),
                    ReportingMonth = table.Column<DateTime>(type: "datetime2", nullable: false),
                    MetricType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TotalRequests = table.Column<int>(type: "int", nullable: false),
                    SuccessfulArticleRequests = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CounterStatistics", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CounterStatistics_ElectronicResourceLicenses_LicenseId",
                        column: x => x.LicenseId,
                        principalTable: "ElectronicResourceLicenses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CounterStatistics_LicenseId",
                table: "CounterStatistics",
                column: "LicenseId");

            migrationBuilder.CreateIndex(
                name: "IX_ElectronicResourceLicenses_VendorId",
                table: "ElectronicResourceLicenses",
                column: "VendorId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CounterStatistics");

            migrationBuilder.DropTable(
                name: "ElectronicResourceLicenses");
        }
    }
}
