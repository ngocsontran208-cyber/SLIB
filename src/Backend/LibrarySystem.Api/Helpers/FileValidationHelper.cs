using System.IO;
using System.Linq;
using System.Collections.Generic;

namespace LibrarySystem.Api.Helpers
{
    public static class FileValidationHelper
    {
        private static readonly Dictionary<string, byte[][]> FileSignatures = new Dictionary<string, byte[][]>
        {
            { ".pdf", new byte[][] { new byte[] { 0x25, 0x50, 0x44, 0x46 } } }, // %PDF
            { ".zip", new byte[][] { new byte[] { 0x50, 0x4B, 0x03, 0x04 }, new byte[] { 0x50, 0x4B, 0x4C, 0x49 }, new byte[] { 0x50, 0x4B, 0x53, 0x70 } } },
            { ".png", new byte[][] { new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A } } },
            { ".jpg", new byte[][] { new byte[] { 0xFF, 0xD8, 0xFF } } },
            { ".jpeg", new byte[][] { new byte[] { 0xFF, 0xD8, 0xFF } } },
        };

        public static bool IsValidSignature(string filePath, string expectedExtension)
        {
            expectedExtension = expectedExtension.ToLowerInvariant();
            if (!FileSignatures.ContainsKey(expectedExtension))
            {
                // Nếu không có signature định nghĩa, bỏ qua check hoặc cho phép
                return true; 
            }

            using (var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read))
            using (var reader = new BinaryReader(stream))
            {
                var signatures = FileSignatures[expectedExtension];
                var maxHeaderLength = signatures.Max(s => s.Length);
                
                // Read maximum required bytes
                var headerBytes = reader.ReadBytes(maxHeaderLength);
                
                return signatures.Any(signature => 
                    headerBytes.Take(signature.Length).SequenceEqual(signature));
            }
        }
    }
}
