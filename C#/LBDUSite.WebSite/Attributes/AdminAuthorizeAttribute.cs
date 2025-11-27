using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Http;

namespace LBDUAdmin.Filters
{
    /// <summary>
    /// Custom Authorization Attribute สำหรับตรวจสอบ Admin Session
    /// ใช้งาน: [AdminAuthorize]
    /// </summary>
    public class AdminAuthorizeAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            var session = context.HttpContext.Session;
            var adminId = session.GetString("AdminId");

            // ตรวจสอบว่ามี session หรือไม่
            if (string.IsNullOrEmpty(adminId))
            {
                // ถ้าไม่มี session ให้ redirect ไปหน้า login
                context.Result = new RedirectToActionResult("Login", "Auth", null);
                return;
            }

            base.OnActionExecuting(context);
        }
    }

    /// <summary>
    /// Authorization Attribute พร้อมกับตรวจสอบ Role
    /// ใช้งาน: [AdminAuthorize(Roles = "Super Administrator,Administrator")]
    /// </summary>
    public class AdminAuthorizeWithRoleAttribute : ActionFilterAttribute
    {
        public string Roles { get; set; }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            var session = context.HttpContext.Session;
            var adminId = session.GetString("AdminId");
            var adminRole = session.GetString("AdminRole");

            // ตรวจสอบว่ามี session หรือไม่
            if (string.IsNullOrEmpty(adminId))
            {
                context.Result = new RedirectToActionResult("Login", "Auth", null);
                return;
            }

            // ตรวจสอบ Role (ถ้ามีการระบุ)
            if (!string.IsNullOrEmpty(Roles))
            {
                var allowedRoles = Roles.Split(',');
                var hasRole = false;

                foreach (var role in allowedRoles)
                {
                    if (adminRole == role.Trim())
                    {
                        hasRole = true;
                        break;
                    }
                }

                if (!hasRole)
                {
                    // ถ้าไม่มีสิทธิ์ ให้ redirect ไป Access Denied
                    context.Result = new RedirectToActionResult("AccessDenied", "Error", null);
                    return;
                }
            }

            base.OnActionExecuting(context);
        }
    }
}