namespace LibrarySystem.Domain.Entities
{
    public class SruTarget
    {
        public int Id { get; set; }
        
        /// <summary>
        /// Tên thư viện đối tác (Ví dụ: Library of Congress)
        /// </summary>
        public string Name { get; set; } = string.Empty;
        
        /// <summary>
        /// Đường dẫn cơ sở của dịch vụ SRU (Ví dụ: https://lx2.loc.gov:210/LCDB)
        /// </summary>
        public string BaseUrl { get; set; } = string.Empty;
        
        /// <summary>
        /// Trạng thái hoạt động
        /// </summary>
        public bool IsActive { get; set; } = true;
    }
}
