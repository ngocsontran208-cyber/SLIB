using System;
using System.Collections.Generic;

namespace LibrarySystem.Domain.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = "Student"; // Student, Librarian, Admin
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; } = true;
        
        public ICollection<BookLoan> Loans { get; set; } = new List<BookLoan>();
        
        public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
        public ICollection<UserClaim> UserClaims { get; set; } = new List<UserClaim>();
        public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    }
}
