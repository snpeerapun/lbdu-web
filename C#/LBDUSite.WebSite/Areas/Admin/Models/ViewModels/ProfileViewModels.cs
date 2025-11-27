using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace LBDUSite.Areas.Admin.Models.ViewModels
{
    /// <summary>
    /// ViewModel สำหรับแสดงข้อมูลโปรไฟล์
    /// </summary>
    public class ProfileViewModel
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public string ProfileImage { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public int TotalActivities { get; set; }
    }

    /// <summary>
    /// ViewModel สำหรับแก้ไขโปรไฟล์
    /// </summary>
    public class ProfileEditViewModel
    {
        [Required(ErrorMessage = "กรุณากรอกชื่อเต็ม")]
        [StringLength(200, ErrorMessage = "ชื่อเต็มต้องไม่เกิน 200 ตัวอักษร")]
        [Display(Name = "ชื่อเต็ม")]
        public string FullName { get; set; }

        [Required(ErrorMessage = "กรุณากรอกอีเมล")]
        [EmailAddress(ErrorMessage = "รูปแบบอีเมลไม่ถูกต้อง")]
        [StringLength(200, ErrorMessage = "อีเมลต้องไม่เกิน 200 ตัวอักษร")]
        [Display(Name = "อีเมล")]
        public string Email { get; set; }

        [Display(Name = "รูปโปรไฟล์")]
        public string ProfileImage { get; set; }

        [Display(Name = "อัพโหลดรูปโปรไฟล์")]
        public IFormFile ProfileImageFile { get; set; }
    }

    /// <summary>
    /// ViewModel สำหรับแสดง Activity Log
    /// </summary>
    public class ActivityLogViewModel
    {
        public string Action { get; set; }
        public string Module { get; set; }
        public string Details { get; set; }
        public string IpAddress { get; set; }
        public DateTime CreatedAt { get; set; }

        public string ActionBadgeClass
        {
            get
            {
                return Action?.ToLower() switch
                {
                    "create" => "badge-success",
                    "update" => "badge-warning",
                    "delete" => "badge-danger",
                    "login" => "badge-info",
                    "logout" => "badge-secondary",
                    _ => "badge-primary"
                };
            }
        }

        public string ActionDisplayText
        {
            get
            {
                return Action?.ToLower() switch
                {
                    "create" => "สร้าง",
                    "update" => "แก้ไข",
                    "delete" => "ลบ",
                    "login" => "เข้าสู่ระบบ",
                    "logout" => "ออกจากระบบ",
                    _ => Action
                };
            }
        }
    }
}
