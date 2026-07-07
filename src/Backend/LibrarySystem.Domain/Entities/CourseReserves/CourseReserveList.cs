using System;
using System.Collections.Generic;

namespace LibrarySystem.Domain.Entities.CourseReserves
{
    public class CourseReserveList
    {
        public int Id { get; set; }
        public string Term { get; set; } = string.Empty; // e.g., "Fall 2026"
        public string Status { get; set; } = "Active"; // Active, Inactive

        public DateTime ActiveFrom { get; set; }
        public DateTime ActiveTo { get; set; }

        public int CourseId { get; set; }
        public Course Course { get; set; } = null!;

        public ICollection<CourseReserveItem> Items { get; set; } = new List<CourseReserveItem>();
    }
}
