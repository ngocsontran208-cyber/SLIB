namespace LibrarySystem.Domain.Entities.Dam
{
    public class DigitalAssetValue
    {
        public int Id { get; set; }
        
        public int AssetId { get; set; }
        public DigitalAsset? Asset { get; set; }
        
        public int ConfigId { get; set; }
        public AssetMetadataConfig? Config { get; set; }
        
        public string Value { get; set; } = string.Empty;
    }
}
