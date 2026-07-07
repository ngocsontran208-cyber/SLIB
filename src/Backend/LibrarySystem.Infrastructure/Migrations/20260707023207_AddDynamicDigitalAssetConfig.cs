using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LibrarySystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDynamicDigitalAssetConfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AssetMetadataConfigs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AssetType = table.Column<int>(type: "int", nullable: false),
                    FieldName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsRequired = table.Column<bool>(type: "bit", nullable: false),
                    IsSearchable = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssetMetadataConfigs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AuthorityRecords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AuthorityType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MainEntry = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Fields = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuthorityRecords", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DrmPolicies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PolicyName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AllowDownload = table.Column<bool>(type: "bit", nullable: false),
                    WatermarkText = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MaxPreviewPages = table.Column<int>(type: "int", nullable: false),
                    ExpirationDays = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DrmPolicies", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "IllPartners",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ContactPerson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ApiEndpoint = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IllPartners", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Instructors",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Department = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Instructors", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NotificationTemplates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DefaultVariables = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationTemplates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SerialSubscriptions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BibliographicRecordId = table.Column<int>(type: "int", nullable: false),
                    PurchaseOrderLineId = table.Column<int>(type: "int", nullable: true),
                    Source = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ISSN = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SerialSubscriptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SerialSubscriptions_BibliographicRecords_BibliographicRecordId",
                        column: x => x.BibliographicRecordId,
                        principalTable: "BibliographicRecords",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SerialSubscriptions_PurchaseOrderLines_PurchaseOrderLineId",
                        column: x => x.PurchaseOrderLineId,
                        principalTable: "PurchaseOrderLines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "StocktakeSessions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StartTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StocktakeSessions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BibAuthorityLinks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BibliographicRecordId = table.Column<int>(type: "int", nullable: false),
                    AuthorityRecordId = table.Column<int>(type: "int", nullable: false),
                    LinkedTag = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BibAuthorityLinks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BibAuthorityLinks_AuthorityRecords_AuthorityRecordId",
                        column: x => x.AuthorityRecordId,
                        principalTable: "AuthorityRecords",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BibAuthorityLinks_BibliographicRecords_BibliographicRecordId",
                        column: x => x.BibliographicRecordId,
                        principalTable: "BibliographicRecords",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DigitalAssets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FilePath = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    MimeType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Checksum = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DrmPolicyId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DigitalAssets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DigitalAssets_DrmPolicies_DrmPolicyId",
                        column: x => x.DrmPolicyId,
                        principalTable: "DrmPolicies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "IllRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PatronId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Author = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PartnerId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RequestedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpectedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IllRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IllRequests_IllPartners_PartnerId",
                        column: x => x.PartnerId,
                        principalTable: "IllPartners",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_IllRequests_Users_PatronId",
                        column: x => x.PatronId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Courses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    InstructorId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Courses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Courses_Instructors_InstructorId",
                        column: x => x.InstructorId,
                        principalTable: "Instructors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PredictionPatterns",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SerialSubscriptionId = table.Column<int>(type: "int", nullable: false),
                    MarcPattern = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Frequency = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    VolumeCaption = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IssueCaption = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PredictionPatterns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PredictionPatterns_SerialSubscriptions_SerialSubscriptionId",
                        column: x => x.SerialSubscriptionId,
                        principalTable: "SerialSubscriptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SerialIssues",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SerialSubscriptionId = table.Column<int>(type: "int", nullable: false),
                    Enumeration = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Chronology = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExpectedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PhysicalItemId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SerialIssues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SerialIssues_PhysicalItems_PhysicalItemId",
                        column: x => x.PhysicalItemId,
                        principalTable: "PhysicalItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_SerialIssues_SerialSubscriptions_SerialSubscriptionId",
                        column: x => x.SerialSubscriptionId,
                        principalTable: "SerialSubscriptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "StocktakeScans",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SessionId = table.Column<int>(type: "int", nullable: false),
                    PhysicalItemId = table.Column<int>(type: "int", nullable: false),
                    ScannedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpectedStatus = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ResultColor = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StocktakeScans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StocktakeScans_PhysicalItems_PhysicalItemId",
                        column: x => x.PhysicalItemId,
                        principalTable: "PhysicalItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StocktakeScans_StocktakeSessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "StocktakeSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
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

            migrationBuilder.CreateTable(
                name: "CourseReserveLists",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Term = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ActiveFrom = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ActiveTo = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CourseId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseReserveLists", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CourseReserveLists_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CourseReserveItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CourseReserveListId = table.Column<int>(type: "int", nullable: false),
                    PhysicalItemId = table.Column<int>(type: "int", nullable: false),
                    ReservePolicy = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseReserveItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CourseReserveItems_CourseReserveLists_CourseReserveListId",
                        column: x => x.CourseReserveListId,
                        principalTable: "CourseReserveLists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CourseReserveItems_PhysicalItems_PhysicalItemId",
                        column: x => x.PhysicalItemId,
                        principalTable: "PhysicalItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BibAuthorityLinks_AuthorityRecordId",
                table: "BibAuthorityLinks",
                column: "AuthorityRecordId");

            migrationBuilder.CreateIndex(
                name: "IX_BibAuthorityLinks_BibliographicRecordId",
                table: "BibAuthorityLinks",
                column: "BibliographicRecordId");

            migrationBuilder.CreateIndex(
                name: "IX_CourseReserveItems_CourseReserveListId",
                table: "CourseReserveItems",
                column: "CourseReserveListId");

            migrationBuilder.CreateIndex(
                name: "IX_CourseReserveItems_PhysicalItemId",
                table: "CourseReserveItems",
                column: "PhysicalItemId");

            migrationBuilder.CreateIndex(
                name: "IX_CourseReserveLists_CourseId",
                table: "CourseReserveLists",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_Courses_InstructorId",
                table: "Courses",
                column: "InstructorId");

            migrationBuilder.CreateIndex(
                name: "IX_DigitalAssets_DrmPolicyId",
                table: "DigitalAssets",
                column: "DrmPolicyId");

            migrationBuilder.CreateIndex(
                name: "IX_DigitalAssetValues_AssetId",
                table: "DigitalAssetValues",
                column: "AssetId");

            migrationBuilder.CreateIndex(
                name: "IX_DigitalAssetValues_ConfigId",
                table: "DigitalAssetValues",
                column: "ConfigId");

            migrationBuilder.CreateIndex(
                name: "IX_IllRequests_PartnerId",
                table: "IllRequests",
                column: "PartnerId");

            migrationBuilder.CreateIndex(
                name: "IX_IllRequests_PatronId",
                table: "IllRequests",
                column: "PatronId");

            migrationBuilder.CreateIndex(
                name: "IX_PredictionPatterns_SerialSubscriptionId",
                table: "PredictionPatterns",
                column: "SerialSubscriptionId");

            migrationBuilder.CreateIndex(
                name: "IX_SerialIssues_PhysicalItemId",
                table: "SerialIssues",
                column: "PhysicalItemId");

            migrationBuilder.CreateIndex(
                name: "IX_SerialIssues_SerialSubscriptionId",
                table: "SerialIssues",
                column: "SerialSubscriptionId");

            migrationBuilder.CreateIndex(
                name: "IX_SerialSubscriptions_BibliographicRecordId",
                table: "SerialSubscriptions",
                column: "BibliographicRecordId");

            migrationBuilder.CreateIndex(
                name: "IX_SerialSubscriptions_PurchaseOrderLineId",
                table: "SerialSubscriptions",
                column: "PurchaseOrderLineId");

            migrationBuilder.CreateIndex(
                name: "IX_StocktakeScans_PhysicalItemId",
                table: "StocktakeScans",
                column: "PhysicalItemId");

            migrationBuilder.CreateIndex(
                name: "IX_StocktakeScans_SessionId",
                table: "StocktakeScans",
                column: "SessionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BibAuthorityLinks");

            migrationBuilder.DropTable(
                name: "CourseReserveItems");

            migrationBuilder.DropTable(
                name: "DigitalAssetValues");

            migrationBuilder.DropTable(
                name: "IllRequests");

            migrationBuilder.DropTable(
                name: "NotificationTemplates");

            migrationBuilder.DropTable(
                name: "PredictionPatterns");

            migrationBuilder.DropTable(
                name: "SerialIssues");

            migrationBuilder.DropTable(
                name: "StocktakeScans");

            migrationBuilder.DropTable(
                name: "AuthorityRecords");

            migrationBuilder.DropTable(
                name: "CourseReserveLists");

            migrationBuilder.DropTable(
                name: "AssetMetadataConfigs");

            migrationBuilder.DropTable(
                name: "DigitalAssets");

            migrationBuilder.DropTable(
                name: "IllPartners");

            migrationBuilder.DropTable(
                name: "SerialSubscriptions");

            migrationBuilder.DropTable(
                name: "StocktakeSessions");

            migrationBuilder.DropTable(
                name: "Courses");

            migrationBuilder.DropTable(
                name: "DrmPolicies");

            migrationBuilder.DropTable(
                name: "Instructors");
        }
    }
}
