namespace LibrarySystem.Domain.Entities.CourseReserves
{
    public class CourseReserveItem
    {
        public int Id { get; set; }
        
        public int CourseReserveListId { get; set; }
        public CourseReserveList CourseReserveList { get; set; } = null!;

        public int PhysicalItemId { get; set; }
        public PhysicalItem PhysicalItem { get; set; } = null!;

        /// <summary>
        /// Ví dụ: "2 Hours", "24 Hours"
        /// </summary>
        public string ReservePolicy { get; set; } = "2 Hours"; 
    }
}
