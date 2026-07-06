using System;

namespace LibrarySystem.Domain.Entities
{
    public class BookLoan
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int PhysicalItemId { get; set; }
        public DateTime BorrowDate { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime? ReturnDate { get; set; }
        public string Status { get; set; } = "Borrowed"; // Borrowed, Returned, Overdue
        public decimal FineAmount { get; set; } = 0;
        
        public User User { get; set; } = null!;
        public PhysicalItem PhysicalItem { get; set; } = null!;
    }
}
