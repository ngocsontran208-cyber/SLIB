namespace LibrarySystem.Domain.Entities.Ill
{
    public class IllPartner
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string ContactPerson { get; set; } = string.Empty;
        public string ApiEndpoint { get; set; } = string.Empty;
    }
}
