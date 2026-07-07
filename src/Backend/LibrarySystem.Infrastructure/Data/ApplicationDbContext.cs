using LibrarySystem.Domain.Entities;
using LibrarySystem.Domain.Entities.Dam;
using Microsoft.EntityFrameworkCore;

namespace LibrarySystem.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public virtual DbSet<User> Users { get; set; } = null!;
        public virtual DbSet<Catalog> Catalogs { get; set; } = null!;
        public virtual DbSet<Policy> LibraryPolicies { get; set; } = null!;
        public virtual DbSet<PhysicalItem> PhysicalItems { get; set; } = null!;
        public virtual DbSet<BookLoan> BookLoans { get; set; } = null!;
        public virtual DbSet<Role> Roles { get; set; } = null!;
        public virtual DbSet<UserRole> UserRoles { get; set; } = null!;
        public virtual DbSet<UserClaim> UserClaims { get; set; } = null!;
        public virtual DbSet<RefreshToken> RefreshTokens { get; set; } = null!;
        public virtual DbSet<MarcDictionary> MarcDictionaries { get; set; } = null!;
        public virtual DbSet<MarcTemplate> MarcTemplates { get; set; } = null!;
        public virtual DbSet<TemplateFieldConfig> TemplateFieldConfigs { get; set; } = null!;
        public virtual DbSet<BibliographicRecord> BibliographicRecords { get; set; } = null!;
        public virtual DbSet<SruTarget> SruTargets { get; set; } = null!;

        // Bổ sung các DbSet cho phân hệ Bổ sung (Acquisition)
        public virtual DbSet<Fund> Funds { get; set; } = null!;
        public virtual DbSet<Vendor> Vendors { get; set; } = null!;
        public virtual DbSet<PurchaseOrder> PurchaseOrders { get; set; } = null!;
        public virtual DbSet<PurchaseOrderLine> PurchaseOrderLines { get; set; } = null!;
        public virtual DbSet<Piece> Pieces { get; set; } = null!;
        public virtual DbSet<Invoice> Invoices { get; set; } = null!;
        public virtual DbSet<InvoiceLine> InvoiceLines { get; set; } = null!;

        // Bổ sung các DbSet cho phân hệ Quản trị Tài nguyên Điện tử (ERM)
        public virtual DbSet<ElectronicResourceLicense> ElectronicResourceLicenses { get; set; } = null!;
        public virtual DbSet<CounterStatistic> CounterStatistics { get; set; } = null!;
        public DbSet<Sip2Device> Sip2Devices { get; set; } = null!;

        // Bổ sung các DbSet cho phân hệ Ấn phẩm định kỳ (Serials Management)
        public virtual DbSet<SerialSubscription> SerialSubscriptions { get; set; } = null!;
        public virtual DbSet<PredictionPattern> PredictionPatterns { get; set; } = null!;
        public virtual DbSet<SerialIssue> SerialIssues { get; set; } = null!;

        // Bổ sung các DbSet cho phân hệ Kiểm soát chuẩn (Authority Control)
        public virtual DbSet<AuthorityRecord> AuthorityRecords { get; set; } = null!;
        public virtual DbSet<BibAuthorityLink> BibAuthorityLinks { get; set; } = null!;

        // Bổ sung các DbSet cho phân hệ Tài liệu dự khóa (Course Reserves)
        public virtual DbSet<LibrarySystem.Domain.Entities.CourseReserves.Instructor> Instructors { get; set; } = null!;
        public virtual DbSet<LibrarySystem.Domain.Entities.CourseReserves.Course> Courses { get; set; } = null!;
        public virtual DbSet<LibrarySystem.Domain.Entities.CourseReserves.CourseReserveList> CourseReserveLists { get; set; } = null!;
        public virtual DbSet<LibrarySystem.Domain.Entities.CourseReserves.CourseReserveItem> CourseReserveItems { get; set; } = null!;

        // Bổ sung các DbSet cho phân hệ Kiểm kê (Inventory)
        public virtual DbSet<LibrarySystem.Domain.Entities.Inventory.StocktakeSession> StocktakeSessions { get; set; } = null!;
        public virtual DbSet<LibrarySystem.Domain.Entities.Inventory.StocktakeScan> StocktakeScans { get; set; } = null!;

        // Bổ sung các DbSet cho phân hệ ILL (Mượn liên thư viện)
        public virtual DbSet<LibrarySystem.Domain.Entities.Ill.IllPartner> IllPartners { get; set; } = null!;
        public virtual DbSet<LibrarySystem.Domain.Entities.Ill.IllRequest> IllRequests { get; set; } = null!;

        // Notification Templates (Email/ZPL)
        public DbSet<NotificationTemplate> NotificationTemplates { get; set; }

        // Digital Asset Management (DAM)
        public DbSet<DigitalAsset> DigitalAssets { get; set; }
        public DbSet<DrmPolicy> DrmPolicies { get; set; }
        public DbSet<AssetAccessLog> AssetAccessLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Cấu hình Temporal Tables cho các bảng Tài chính và Mua sắm (Audit Trail)
            modelBuilder.Entity<Fund>().ToTable("Funds", t => t.IsTemporal());
            modelBuilder.Entity<PurchaseOrder>().ToTable("PurchaseOrders", t => t.IsTemporal());
            modelBuilder.Entity<Invoice>().ToTable("Invoices", t => t.IsTemporal());

            // Cấu hình quan hệ cho Acquisition
            modelBuilder.Entity<PurchaseOrderLine>()
                .HasOne(pol => pol.PurchaseOrder)
                .WithMany(po => po.OrderLines)
                .HasForeignKey(pol => pol.PurchaseOrderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PurchaseOrderLine>()
                .HasOne(pol => pol.Fund)
                .WithMany(f => f.PurchaseOrderLines)
                .HasForeignKey(pol => pol.FundId)
                .OnDelete(DeleteBehavior.Restrict);

            // Cấu hình Acquisition (Bổ sung) - Temporal Tables (Chỉ áp dụng nếu là SQL Server)
            if (this.Database.ProviderName == "Microsoft.EntityFrameworkCore.SqlServer")
            {
                modelBuilder.Entity<Fund>()
                    .ToTable("Funds", t => t.IsTemporal());

                modelBuilder.Entity<PurchaseOrder>()
                    .ToTable("PurchaseOrders", t => t.IsTemporal());

                modelBuilder.Entity<Invoice>()
                    .ToTable("Invoices", t => t.IsTemporal());

                // Cấu hình MARC 21 JSON Mapping (EF Core 9)
                modelBuilder.Entity<BibliographicRecord>()
                    .OwnsMany(b => b.Fields, builder =>
                    {
                        builder.ToJson();
                        builder.OwnsMany(f => f.Subfields);
                    });

                modelBuilder.Entity<AuthorityRecord>()
                    .OwnsMany(b => b.Fields, builder =>
                    {
                        builder.ToJson();
                        builder.OwnsMany(f => f.Subfields);
                    });
            }
            else
            {
                // Cho SQLite/InMemory (Testing)
                modelBuilder.Entity<BibliographicRecord>()
                    .OwnsMany(b => b.Fields, builder => 
                    {
                        builder.OwnsMany(f => f.Subfields);
                    });

                modelBuilder.Entity<AuthorityRecord>()
                    .OwnsMany(b => b.Fields, builder => 
                    {
                        builder.OwnsMany(f => f.Subfields);
                    });
            }

            modelBuilder.Entity<Piece>()
                .HasOne(p => p.PurchaseOrderLine)
                .WithMany(pol => pol.Pieces)
                .HasForeignKey(p => p.PurchaseOrderLineId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<InvoiceLine>()
                .HasOne(il => il.Invoice)
                .WithMany(i => i.InvoiceLines)
                .HasForeignKey(il => il.InvoiceId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<InvoiceLine>()
                .HasOne(il => il.PurchaseOrderLine)
                .WithMany(pol => pol.InvoiceLines)
                .HasForeignKey(il => il.PurchaseOrderLineId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<BibliographicRecord>()
                .HasOne(br => br.Template)
                .WithMany(t => t.BibliographicRecords)
                .HasForeignKey(br => br.TemplateId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TemplateFieldConfig>()
                .HasOne(tfc => tfc.Template)
                .WithMany(t => t.FieldConfigs)
                .HasForeignKey(tfc => tfc.TemplateId)
                .OnDelete(DeleteBehavior.Cascade);

            // Cấu hình ERM
            modelBuilder.Entity<ElectronicResourceLicense>()
                .HasOne(e => e.Vendor)
                .WithMany()
                .HasForeignKey(e => e.VendorId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CounterStatistic>()
                .HasOne(c => c.License)
                .WithMany(e => e.CounterStatistics)
                .HasForeignKey(c => c.LicenseId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // Cấu hình Serials Management
            modelBuilder.Entity<SerialSubscription>()
                .HasOne(s => s.BibliographicRecord)
                .WithMany()
                .HasForeignKey(s => s.BibliographicRecordId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SerialSubscription>()
                .HasOne(s => s.PurchaseOrderLine)
                .WithMany()
                .HasForeignKey(s => s.PurchaseOrderLineId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<PredictionPattern>()
                .HasOne(p => p.SerialSubscription)
                .WithMany(s => s.PredictionPatterns)
                .HasForeignKey(p => p.SerialSubscriptionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SerialIssue>()
                .HasOne(i => i.SerialSubscription)
                .WithMany(s => s.Issues)
                .HasForeignKey(i => i.SerialSubscriptionId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SerialIssue>()
                .HasOne(i => i.PhysicalItem)
                .WithMany()
                .HasForeignKey(i => i.PhysicalItemId)
                .OnDelete(DeleteBehavior.SetNull);

            // Cấu hình Authority Control
            modelBuilder.Entity<BibAuthorityLink>()
                .HasOne(link => link.BibliographicRecord)
                .WithMany()
                .HasForeignKey(link => link.BibliographicRecordId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<BibAuthorityLink>()
                .HasOne(link => link.AuthorityRecord)
                .WithMany(auth => auth.LinkedBibliographics)
                .HasForeignKey(link => link.AuthorityRecordId)
                .OnDelete(DeleteBehavior.Cascade);
                
            // Cấu hình Course Reserves
            modelBuilder.Entity<LibrarySystem.Domain.Entities.CourseReserves.Course>()
                .HasOne(c => c.Instructor)
                .WithMany()
                .HasForeignKey(c => c.InstructorId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<LibrarySystem.Domain.Entities.CourseReserves.CourseReserveList>()
                .HasOne(l => l.Course)
                .WithMany(c => c.ReserveLists)
                .HasForeignKey(l => l.CourseId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<LibrarySystem.Domain.Entities.CourseReserves.CourseReserveItem>()
                .HasOne(i => i.CourseReserveList)
                .WithMany(l => l.Items)
                .HasForeignKey(i => i.CourseReserveListId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<LibrarySystem.Domain.Entities.CourseReserves.CourseReserveItem>()
                .HasOne(i => i.PhysicalItem)
                .WithMany()
                .HasForeignKey(i => i.PhysicalItemId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // Cấu hình Inventory
            modelBuilder.Entity<LibrarySystem.Domain.Entities.Inventory.StocktakeScan>()
                .HasOne(s => s.Session)
                .WithMany(session => session.Scans)
                .HasForeignKey(s => s.SessionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<LibrarySystem.Domain.Entities.Inventory.StocktakeScan>()
                .HasOne(s => s.PhysicalItem)
                .WithMany()
                .HasForeignKey(s => s.PhysicalItemId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // Cấu hình ILL
            modelBuilder.Entity<LibrarySystem.Domain.Entities.Ill.IllRequest>()
                .HasOne(r => r.Patron)
                .WithMany()
                .HasForeignKey(r => r.PatronId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<LibrarySystem.Domain.Entities.Ill.IllRequest>()
                .HasOne(r => r.Partner)
                .WithMany()
                .HasForeignKey(r => r.PartnerId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // Cấu hình DAM
            modelBuilder.Entity<DigitalAsset>()
                .HasOne(da => da.DrmPolicy)
                .WithMany(p => p.Assets)
                .HasForeignKey(da => da.DrmPolicyId)
                .OnDelete(DeleteBehavior.SetNull);



            modelBuilder.Entity<AssetAccessLog>()
                .HasOne(log => log.Asset)
                .WithMany()
                .HasForeignKey(log => log.DigitalAssetId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // Cấu hình Fluent API cho BookLoan
            modelBuilder.Entity<BookLoan>()
                .HasOne(bl => bl.User)
                .WithMany(u => u.Loans)
                .HasForeignKey(bl => bl.UserId);

            modelBuilder.Entity<BookLoan>()
                .HasOne(bl => bl.PhysicalItem)
                .WithMany(p => p.Loans)
                .HasForeignKey(bl => bl.PhysicalItemId);

            // Cấu hình PhysicalItem (RowVersion cho Optimistic Concurrency)
            modelBuilder.Entity<PhysicalItem>()
                .Property(p => p.RowVersion)
                .IsRowVersion();

            modelBuilder.Entity<PhysicalItem>()
                .HasOne(p => p.BibliographicRecord)
                .WithMany()
                .HasForeignKey(p => p.BibliographicRecordId);

            // Cấu hình Sequence cấp phát Mã ĐKCB (Barcode)
            modelBuilder.HasSequence<int>("BarcodeSequence")
                .StartsAt(100000)
                .IncrementsBy(1);

            // Cấu hình bảng UserRoles (Khóa chính kép)
            modelBuilder.Entity<UserRole>()
                .HasKey(ur => new { ur.UserId, ur.RoleId });

            modelBuilder.Entity<UserRole>()
                .HasOne(ur => ur.User)
                .WithMany(u => u.UserRoles)
                .HasForeignKey(ur => ur.UserId);

            modelBuilder.Entity<UserRole>()
                .HasOne(ur => ur.Role)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(ur => ur.RoleId);

            // Seeding Data
            var adminRole = new Role { Id = 1, Name = "Admin", Description = "System Administrator" };
            var librarianRole = new Role { Id = 2, Name = "Librarian", Description = "Librarian Staff" };
            var studentRole = new Role { Id = 3, Name = "Student", Description = "Library Patron" };

            modelBuilder.Entity<Role>().HasData(adminRole, librarianRole, studentRole);

            var adminUser = new User
            {
                Id = 1,
                Username = "admin",
                PasswordHash = "admin", // Demo purposes: store plain text
                FullName = "System Admin",
                Email = "admin@slib.edu",
                Role = "Admin",
                CreatedAt = new System.DateTime(2026, 1, 1, 0, 0, 0, System.DateTimeKind.Utc),
                IsActive = true
            };

            var librarianUser = new User
            {
                Id = 2,
                Username = "librarian",
                PasswordHash = "librarian",
                FullName = "Library Staff",
                Email = "librarian@slib.edu",
                Role = "Librarian",
                CreatedAt = new System.DateTime(2026, 1, 1, 0, 0, 0, System.DateTimeKind.Utc),
                IsActive = true
            };

            var studentUser = new User
            {
                Id = 3,
                Username = "student",
                PasswordHash = "student",
                FullName = "Student Patron",
                Email = "student@slib.edu",
                Role = "Student",
                CreatedAt = new System.DateTime(2026, 1, 1, 0, 0, 0, System.DateTimeKind.Utc),
                IsActive = true
            };

            modelBuilder.Entity<User>().HasData(adminUser, librarianUser, studentUser);

            modelBuilder.Entity<UserRole>().HasData(
                new UserRole { UserId = 1, RoleId = 1 },
                new UserRole { UserId = 2, RoleId = 2 },
                new UserRole { UserId = 3, RoleId = 3 }
            );
        }
    }
}
