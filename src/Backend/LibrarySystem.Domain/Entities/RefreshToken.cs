using System;

namespace LibrarySystem.Domain.Entities
{
    public class RefreshToken
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Token { get; set; } = string.Empty;
        public string JwtId { get; set; } = string.Empty;
        public DateTime CreationDate { get; set; }
        public DateTime ExpiryDate { get; set; }
        public bool IsRevoked { get; set; }

        public User User { get; set; } = null!;
    }
}
