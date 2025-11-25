using System.ComponentModel.DataAnnotations;

namespace LBDUSite.ViewModels
{
    public class ContactViewModel
    {
        [Required(ErrorMessage = "กรุณากรอกชื่อ-นามสกุล")]
        [Display(Name = "ชื่อ-นามสกุล")]
        public string FullName { get; set; }

        [Required(ErrorMessage = "กรุณากรอกอีเมล")]
        [EmailAddress(ErrorMessage = "รูปแบบอีเมลไม่ถูกต้อง")]
        [Display(Name = "อีเมล")]
        public string Email { get; set; }

        [Required(ErrorMessage = "กรุณากรอกเบอร์โทรศัพท์")]
        [Phone(ErrorMessage = "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง")]
        [Display(Name = "เบอร์โทรศัพท์")]
        public string Phone { get; set; }

        [Required(ErrorMessage = "กรุณาเลือกหัวข้อ")]
        [Display(Name = "หัวข้อ")]
        public string Subject { get; set; }

        [Required(ErrorMessage = "กรุณากรอกข้อความ")]
        [Display(Name = "ข้อความ")]
        [MinLength(10, ErrorMessage = "ข้อความต้องมีความยาวอย่างน้อย 10 ตัวอักษร")]
        public string Message { get; set; }
    }

    public class ContactInfoViewModel
    {
        public string CompanyName { get; set; } = "LBDU Fund Platform";
        public string Address { get; set; } = "123 ถนนพระราม 4 แขวงปทุมวัน เขตปทุมวัน กรุงเทพมหานคร 10330";
        public string Phone { get; set; } = "02-123-4567";
        public string Email { get; set; } = "info@lbdufund.com";
        public string FacebookUrl { get; set; } = "https://facebook.com/lbdufund";
        public string LineId { get; set; } = "@lbdufund";
        public string WorkingHours { get; set; } = "จันทร์ - ศุกร์ 09:00 - 18:00 น.";
    }
}