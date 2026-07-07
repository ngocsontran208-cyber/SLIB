using System.Collections.Generic;

namespace LibrarySystem.Domain.Entities.Dam
{
    public enum AssetType { PDF, Video, Audio, Image, Other }
    
    public class AssetMetadataConfig
    {
        public int Id { get; set; }
        public AssetType AssetType { get; set; }
        public string FieldName { get; set; } = string.Empty;
        public string DataType { get; set; } = "String"; // String, Date, Number, Boolean
        public bool IsRequired { get; set; } = false;
        public bool IsSearchable { get; set; } = true;
        
        public ICollection<DigitalAssetValue> Values { get; set; } = new List<DigitalAssetValue>();
    }
}
