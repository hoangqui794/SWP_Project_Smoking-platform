using System.ComponentModel.DataAnnotations;

namespace Smoking.API.Models.Admin
{
    namespace Smoking.API.Models.Admin
    {
        public class AdminCreatePackageDto
        {
            [Required, MaxLength(255)]
            public string PackageName { get; set; }

            [Required, MaxLength(50)]
            public string PackageType { get; set; }

            public string? Description { get; set; }

            [Required]
            [Range(0, 100000000)]
            public decimal Price { get; set; }

            [Required]
            [Range(1, 120)]
            public int Duration { get; set; } // tháng
        }
    }
}
