using System.ComponentModel.DataAnnotations;

namespace LBDUSite.ViewModels.Admin
{
    public class AdminLoginViewModel
    {
        [Required(ErrorMessage = "กรุณากรอก Username")]
        [Display(Name = "Username")]
        public string Username { get; set; }

        [Required(ErrorMessage = "กรุณากรอก Password")]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; }

        [Display(Name = "จดจำฉัน")]
        public bool RememberMe { get; set; }
    }

    public class AdminDashboardViewModel
    {
        public string UserName { get; set; }
        public string Role { get; set; }
        public int TotalUsers { get; set; }
        public int ActiveUsers { get; set; }
        public int TodayLogins { get; set; }
        public List<ActivityLog> RecentActivities { get; set; }
        public Dictionary<string, int> UsersByRole { get; set; }
    }

    public class AdminUserListViewModel
    {
        public List<AdminUser> Users { get; set; }
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public string SearchTerm { get; set; }
        public string RoleFilter { get; set; }
    }

    public class AdminUserFormViewModel
    {
        public int? Id { get; set; }

        [Required(ErrorMessage = "กรุณากรอก Username")]
        public string Username { get; set; }

        [Required(ErrorMessage = "กรุณากรอกชื่อ-นามสกุล")]
        public string FullName { get; set; }

        [Required(ErrorMessage = "กรุณากรอก Email")]
        [EmailAddress(ErrorMessage = "รูปแบบ Email ไม่ถูกต้อง")]
        public string Email { get; set; }

        [Required(ErrorMessage = "กรุณาเลือก Role")]
        public string Role { get; set; }

        [DataType(DataType.Password)]
        public string Password { get; set; }

        [DataType(DataType.Password)]
        [Compare("Password", ErrorMessage = "Password ไม่ตรงกัน")]
        public string ConfirmPassword { get; set; }

        public bool IsActive { get; set; } = true;
    }

    public class ChangePasswordViewModel
    {
        [Required(ErrorMessage = "กรุณากรอก Password เดิม")]
        [DataType(DataType.Password)]
        public string CurrentPassword { get; set; }

        [Required(ErrorMessage = "กรุณากรอก Password ใหม่")]
        [DataType(DataType.Password)]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Password ต้องมีความยาวอย่างน้อย 6 ตัวอักษร")]
        public string NewPassword { get; set; }

        [Required(ErrorMessage = "กรุณายืนยัน Password ใหม่")]
        [DataType(DataType.Password)]
        [Compare("NewPassword", ErrorMessage = "Password ไม่ตรงกัน")]
        public string ConfirmPassword { get; set; }
    }

    public class RolePermissionsViewModel
    {
        public string Role { get; set; }
        public List<PermissionGroup> PermissionGroups { get; set; }
    }

    public class PermissionGroup
    {
        public string Module { get; set; }
        public List<PermissionItem> Permissions { get; set; }
    }

    public class PermissionItem
    {
        public int Id { get; set; }
        public string Action { get; set; }
        public string Description { get; set; }
        public bool IsGranted { get; set; }
    }
}