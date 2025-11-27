using System;
using System.ComponentModel.DataAnnotations;

namespace LBDUSite.Areas.Admin.Models.ViewModels
{
    public class FundListViewModel
    {
        public int Id { get; set; }
        public string ProjId { get; set; }
        public string ProjAbbrName { get; set; }
        public string ProjNameTH { get; set; }
        public string AMCName { get; set; }
        public string FundStatus { get; set; }
        public string RiskSpectrum { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsPopular { get; set; }
        public decimal? LatestNAV { get; set; }
        public DateTime? LastUpdatedFromAPI { get; set; }
    }

    public class FundCreateViewModel
    {
        [Required(ErrorMessage = "กรุณากรอกรหัสโครงการ")]
        [StringLength(50)]
        public string ProjId { get; set; }

        [Required(ErrorMessage = "กรุณากรอกชื่อโครงการ (ไทย)")]
        [StringLength(500)]
        public string ProjNameTH { get; set; }

        [StringLength(500)]
        public string ProjNameEN { get; set; }

        [Required(ErrorMessage = "กรุณากรอกชื่อย่อ")]
        [StringLength(100)]
        public string ProjAbbrName { get; set; }

        [Required(ErrorMessage = "กรุณาเลือกบริษัทจัดการ")]
        public int AMCId { get; set; }

        [StringLength(50)]
        public string FundStatus { get; set; }

        public string PolicyDesc { get; set; }
        
        [StringLength(50)]
        public string ManagementStyle { get; set; }

        [StringLength(50)]
        public string RiskSpectrum { get; set; }

        [StringLength(200)]
        public string RiskSpectrumDesc { get; set; }

        public bool IsActive { get; set; } = true;
        public bool IsPopular { get; set; } = false;
        public bool IsRecommended { get; set; } = false;
    }

    public class FundEditViewModel
    {
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string ProjId { get; set; }

        [Required]
        [StringLength(500)]
        public string ProjNameTH { get; set; }

        [StringLength(500)]
        public string ProjNameEN { get; set; }

        [Required]
        [StringLength(100)]
        public string ProjAbbrName { get; set; }

        [Required]
        public int AMCId { get; set; }

        [StringLength(50)]
        public string FundStatus { get; set; }

        public string PolicyDesc { get; set; }
        
        [StringLength(50)]
        public string ManagementStyle { get; set; }

        [StringLength(50)]
        public string RiskSpectrum { get; set; }

        [StringLength(200)]
        public string RiskSpectrumDesc { get; set; }

        public bool IsActive { get; set; }
        public bool IsPopular { get; set; }
        public bool IsRecommended { get; set; }
    }

    public class FundDetailsViewModel
    {
        public int Id { get; set; }
        public string ProjId { get; set; }
        public string ProjAbbrName { get; set; }
        public string ProjNameTH { get; set; }
        public string ProjNameEN { get; set; }
        public string AMCName { get; set; }
        public string FundStatus { get; set; }
        public string PolicyDesc { get; set; }
        public string ManagementStyle { get; set; }
        public string RiskSpectrum { get; set; }
        public string RiskSpectrumDesc { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsPopular { get; set; }
        public bool? IsRecommended { get; set; }
        public DateTime? RegisDate { get; set; }
        public DateTime? LastUpdatedFromAPI { get; set; }
        public DateTime? CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public int TotalClasses { get; set; }
        public decimal? LatestNAV { get; set; }
        public DateTime? LatestNAVDate { get; set; }
    }
}
