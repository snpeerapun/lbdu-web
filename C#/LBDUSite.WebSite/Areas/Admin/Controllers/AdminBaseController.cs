using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using LBDUSite.Repository.Interfaces;
using LBDUSite.Models;
using System;
using System.Threading.Tasks;

namespace LBDUSite.Areas.Admin.Controllers
{
    /// <summary>
    /// Base Controller สำหรับ Admin Area
    /// - ตรวจสอบ Session อัตโนมัติ
    /// - มี Helper Methods สำหรับ TempData Messages
    /// - มี Helper Methods สำหรับ Activity Logging
    /// </summary>
    [Area("Admin")]
    public abstract class AdminBaseController : Controller
    {
        protected readonly IRepositoryFactory _repo;

        protected AdminBaseController(IRepositoryFactory repo)
        {
            _repo = repo ?? throw new ArgumentNullException(nameof(repo));
        }

        #region Session Properties

        /// <summary>
        /// Admin ID ของผู้ที่ล็อกอินอยู่
        /// </summary>
        protected int? CurrentAdminId
        {
            get
            {
                var adminId = HttpContext.Session.GetString("AdminId");
                return string.IsNullOrEmpty(adminId) ? null : int.Parse(adminId);
            }
        }

        /// <summary>
        /// Username ของ Admin ที่ล็อกอินอยู่
        /// </summary>
        protected string CurrentAdminUsername => HttpContext.Session.GetString("AdminUsername");

        /// <summary>
        /// ชื่อเต็มของ Admin ที่ล็อกอินอยู่
        /// </summary>
        protected string CurrentAdminFullName => HttpContext.Session.GetString("AdminFullName");

        /// <summary>
        /// Role ของ Admin ที่ล็อกอินอยู่
        /// </summary>
        protected string CurrentAdminRole => HttpContext.Session.GetString("AdminRole");

        /// <summary>
        /// Email ของ Admin ที่ล็อกอินอยู่
        /// </summary>
        protected string CurrentAdminEmail => HttpContext.Session.GetString("AdminEmail");

        #endregion

        #region Action Filter (Session Check)

        /// <summary>
        /// ตรวจสอบ Session ก่อน Action ทุกครั้ง
        /// </summary>
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            // ยกเว้น AuthController (ไม่ต้องตรวจสอบ session)
            if (context.Controller.GetType().Name == "AuthController")
            {
                base.OnActionExecuting(context);
                return;
            }

            // ตรวจสอบว่ามี session หรือไม่
            if (CurrentAdminId == null)
            {
                // ถ้าไม่มี session ให้ redirect ไป login
                context.Result = RedirectToAction("Login", "Auth", new { area = "Admin" });
                return;
            }

            // ส่งข้อมูล admin ไป ViewBag เพื่อใช้ใน View
            ViewBag.CurrentAdminId = CurrentAdminId;
            ViewBag.CurrentAdminUsername = CurrentAdminUsername;
            ViewBag.CurrentAdminFullName = CurrentAdminFullName;
            ViewBag.CurrentAdminRole = CurrentAdminRole;
            ViewBag.CurrentAdminEmail = CurrentAdminEmail;

            base.OnActionExecuting(context);
        }

        #endregion

        #region TempData Message Helpers

        /// <summary>
        /// แสดงข้อความสำเร็จ
        /// </summary>
        protected void SetSuccessMessage(string message)
        {
            TempData["SuccessMessage"] = message;
        }

        /// <summary>
        /// แสดงข้อความ Error
        /// </summary>
        protected void SetErrorMessage(string message)
        {
            TempData["ErrorMessage"] = message;
        }

        /// <summary>
        /// แสดงข้อความ Warning
        /// </summary>
        protected void SetWarningMessage(string message)
        {
            TempData["WarningMessage"] = message;
        }

        /// <summary>
        /// แสดงข้อความ Info
        /// </summary>
        protected void SetInfoMessage(string message)
        {
            TempData["InfoMessage"] = message;
        }

        #endregion

        #region Activity Logging

        /// <summary>
        /// บันทึก Activity Log
        /// </summary>
        protected async Task LogActivityAsync(string action, string module, string details, int statusCode = 200)
        {
            try
            {
                var log = new ActivityLog
                {
                    UserId = CurrentAdminId,
                    Username = CurrentAdminUsername,
                    Action = action,
                    Module = module,
                    Details = details,
                    IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
                    UserAgent = HttpContext.Request.Headers["User-Agent"].ToString(),
                    RequestUrl = HttpContext.Request.Path,
                    StatusCode = statusCode,
                    CreatedAt = DateTime.Now
                };

                // Insert log (synchronous - ไม่รอ)
                _ = Task.Run(() =>
                {
                    try
                    {
                        _repo.Fetch<ActivityLog>().Where(new { Id = 0 }); // Dummy query to insert
                        // TODO: Implement actual insert when Repository supports it
                    }
                    catch { }
                });

                await Task.CompletedTask;
            }
            catch
            {
                // Ignore logging errors
            }
        }

        /// <summary>
        /// บันทึก Activity Log แบบย่อ (Sync)
        /// </summary>
        protected void LogActivity(string action, string module, string details)
        {
            _ = LogActivityAsync(action, module, details);
        }

        #endregion

        #region Common Helpers

        /// <summary>
        /// ตรวจสอบว่า Admin มี Role ที่กำหนดหรือไม่
        /// </summary>
        protected bool HasRole(params string[] roles)
        {
            if (string.IsNullOrEmpty(CurrentAdminRole))
                return false;

            foreach (var role in roles)
            {
                if (CurrentAdminRole.Equals(role, StringComparison.OrdinalIgnoreCase))
                    return true;
            }

            return false;
        }

        /// <summary>
        /// ตรวจสอบว่าเป็น Super Administrator หรือไม่
        /// </summary>
        protected bool IsSuperAdmin => HasRole("Super Administrator");

        /// <summary>
        /// ตรวจสอบว่าเป็น Administrator หรือไม่ (รวม Super Admin)
        /// </summary>
        protected bool IsAdmin => HasRole("Super Administrator", "Administrator");

        /// <summary>
        /// ส่ง JSON response สำเร็จ
        /// </summary>
        protected JsonResult JsonSuccess(string message, object data = null)
        {
            return Json(new
            {
                success = true,
                message = message,
                data = data
            });
        }

        /// <summary>
        /// ส่ง JSON response ไม่สำเร็จ
        /// </summary>
        protected JsonResult JsonError(string message, object errors = null)
        {
            return Json(new
            {
                success = false,
                message = message,
                errors = errors
            });
        }

        /// <summary>
        /// Return HTTP Not Found (404)
        /// </summary>
        protected IActionResult HttpNotFound(string message = "ไม่พบข้อมูลที่ต้องการ")
        {
            return NotFound(new { success = false, message = message });
        }

        /// <summary>
        /// Return Internal Server Error (500)
        /// </summary>
        protected IActionResult InternalServerError(string message = "เกิดข้อผิดพลาดภายในระบบ")
        {
            return StatusCode(500, new { success = false, message = message });
        }

        #endregion

        #region Dispose

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _repo?.Dispose();
            }
            base.Dispose(disposing);
        }

        #endregion
    }
}
