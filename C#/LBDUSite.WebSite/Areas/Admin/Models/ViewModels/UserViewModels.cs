using System;
using System.ComponentModel.DataAnnotations;

namespace LBDUSite.Areas.Admin.Models.ViewModels
{
    public class AdminUserListViewModel
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public bool IsActive { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class AdminUserCreateViewModel
    {
        [Required(ErrorMessage = "กรุณากรอกชื่อผู้ใช้")]
        [StringLength(50, ErrorMessage = "ชื่อผู้ใช้ต้องมีความยาว 3-50 ตัวอักษร", MinimumLength = 3)]
        public string Username { get; set; }

        [Required(ErrorMessage = "กรุณากรอกรหัสผ่าน")]
        [StringLength(100, ErrorMessage = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร", MinimumLength = 6)]
        [DataType(DataType.Password)]
        public string Password { get; set; }

        [Required(ErrorMessage = "กรุณายืนยันรหัสผ่าน")]
        [Compare("Password", ErrorMessage = "รหัสผ่านไม่ตรงกัน")]
        [DataType(DataType.Password)]
        public string ConfirmPassword { get; set; }

        [Required(ErrorMessage = "กรุณากรอกชื่อเต็ม")]
        [StringLength(100)]
        public string FullName { get; set; }

        [Required(ErrorMessage = "กรุณากรอกอีเมล")]
        [EmailAddress(ErrorMessage = "รูปแบบอีเมลไม่ถูกต้อง")]
        [StringLength(100)]
        public string Email { get; set; }

        [Required(ErrorMessage = "กรุณาเลือกบทบาท")]
        public string Role { get; set; }

        public bool IsActive { get; set; } = true;
    }

    public class AdminUserEditViewModel
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "กรุณากรอกชื่อผู้ใช้")]
        [StringLength(50, MinimumLength = 3)]
        public string Username { get; set; }

        [StringLength(100, ErrorMessage = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร", MinimumLength = 6)]
        [DataType(DataType.Password)]
        public string Password { get; set; }

        [Compare("Password", ErrorMessage = "รหัสผ่านไม่ตรงกัน")]
        [DataType(DataType.Password)]
        public string ConfirmPassword { get; set; }

        [Required(ErrorMessage = "กรุณากรอกชื่อเต็ม")]
        [StringLength(100)]
        public string FullName { get; set; }

        [Required(ErrorMessage = "กรุณากรอกอีเมล")]
        [EmailAddress(ErrorMessage = "รูปแบบอีเมลไม่ถูกต้อง")]
        [StringLength(100)]
        public string Email { get; set; }

        [Required(ErrorMessage = "กรุณาเลือกบทบาท")]
        public string Role { get; set; }

        public bool IsActive { get; set; }
        public string ProfileImage { get; set; }
    }

    public class AdminUserDetailsViewModel
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public bool IsActive { get; set; }
        public string ProfileImage { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; }
        public int TotalActivityLogs { get; set; }
    }
}
