namespace LibrarySystem.Domain.Entities
{
    public class PredictionPattern
    {
        public int Id { get; set; }
        
        public int SerialSubscriptionId { get; set; }
        public SerialSubscription SerialSubscription { get; set; } = null!;

        // Ví dụ: 853 20 $a v. $b no. $u 12 $v r $i (year) $j (month) $w m
        public string MarcPattern { get; set; } = string.Empty;
        
        // Bóc tách nhanh
        public string Frequency { get; set; } = string.Empty; // m, w, q, a
        public string VolumeCaption { get; set; } = string.Empty;
        public string IssueCaption { get; set; } = string.Empty;
    }
}
