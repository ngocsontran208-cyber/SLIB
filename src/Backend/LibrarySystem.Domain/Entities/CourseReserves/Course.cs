using System.Collections.Generic;

namespace LibrarySystem.Domain.Entities.CourseReserves
{
    public class Course
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        
        public int InstructorId { get; set; }
        public Instructor Instructor { get; set; } = null!;

        public ICollection<CourseReserveList> ReserveLists { get; set; } = new List<CourseReserveList>();
    }
}
