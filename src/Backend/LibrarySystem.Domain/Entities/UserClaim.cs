namespace LibrarySystem.Domain.Entities
{
    public class UserClaim
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string ClaimType { get; set; } = string.Empty;
        public string ClaimValue { get; set; } = string.Empty;

        public User User { get; set; } = null!;
    }
}
