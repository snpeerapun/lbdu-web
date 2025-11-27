using Microsoft.AspNetCore.Mvc;
using LBDUSite.Models;
using LBDUSite.Repository.Interfaces;
using LBDUSite.Areas.Admin.Models.ViewModels;
using System;
using System.Linq;
using BCrypt.Net;

namespace LBDUSite.Areas.Admin.Controllers
{
    [Area("Admin")]
    public class AuthController : Controller
    {
        private readonly IRepositoryFactory _repo;

        public AuthController(IRepositoryFactory repo)
        {
            _repo = repo ?? throw new ArgumentNullException(nameof(repo));
        }

        #region Login

        // GET: /Admin/Auth/Login
        [HttpGet]
        public IActionResult Login(string returnUrl = null)
        {
            // ถ้า login แล้วให้ redirect ไป Dashboard
            if (HttpContext.Session.GetString("AdminId") != null)
            {
                return RedirectToAction("Index", "Dashboard");
            }

            ViewData["ReturnUrl"] = returnUrl;
            return View();
        }

        // POST: /Admin/Auth/Login
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Login(LoginViewModel model, string returnUrl = null)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    // ค้นหา Admin User
                    var admin = _repo.Fetch<AdminUser>()
                        .Where(new { Username = model.Username })
                        .FirstOrDefault();

                    if (admin == null)
                    {
                        ModelState.AddModelError("", "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
                        return View(model);
                    }

                    // ตรวจสอบว่า account ถูกระงับหรือไม่
                    if (!admin.IsActive)
                    {
                        ModelState.AddModelError("", "บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ");
                        return View(model);
                    }

                    // ตรวจสอบรหัสผ่าน
                    //if (!BCrypt.Net.BCrypt.Verify(model.Password, admin.PasswordHash))
                    //{
                    //     ModelState.AddModelError("", "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
                    //    return View(model);
                    //}

                    // Update LastLoginAt
                    admin.LastLoginAt = DateTime.Now;
                    // TODO: _repo.Update(admin) when implemented

                    // Set Session
                    HttpContext.Session.SetString("AdminId", admin.Id.ToString());
                    HttpContext.Session.SetString("AdminUsername", admin.Username);
                    HttpContext.Session.SetString("AdminFullName", admin.FullName ?? admin.Username);
                    HttpContext.Session.SetString("AdminRole", admin.Role ?? "Viewer");
                    HttpContext.Session.SetString("AdminEmail", admin.Email ?? "");

                    // Log activity
                    LogActivity(admin.Id, admin.Username, "Login", "Auth", "เข้าสู่ระบบสำเร็จ");

                    // Remember Me
                    if (model.RememberMe)
                    {
                        // Set cookie for 30 days
                        Response.Cookies.Append("AdminRememberMe", admin.Username, new Microsoft.AspNetCore.Http.CookieOptions
                        {
                            Expires = DateTimeOffset.Now.AddDays(30),
                            HttpOnly = true,
                            Secure = true,
                            SameSite = Microsoft.AspNetCore.Http.SameSiteMode.Strict
                        });
                    }

                    // Redirect
                    if (!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl))
                    {
                        return Redirect(returnUrl);
                    }

                    return RedirectToAction("Index", "Dashboard");
                }
                catch (Exception ex)
                {
                    ModelState.AddModelError("", $"เกิดข้อผิดพลาด: {ex.Message}");
                }
            }

            return View(model);
        }

        #endregion

        #region Logout

        // GET: /Admin/Auth/Logout
        [HttpGet]
        public IActionResult Logout()
        {
            var username = HttpContext.Session.GetString("AdminUsername");
            var userId = HttpContext.Session.GetString("AdminId");

            // Log activity
            if (!string.IsNullOrEmpty(userId) && int.TryParse(userId, out int id))
            {
                LogActivity(id, username, "Logout", "Auth", "ออกจากระบบ");
            }

            // Clear Session
            HttpContext.Session.Clear();

            // Clear Remember Me cookie
            Response.Cookies.Delete("AdminRememberMe");

            TempData["InfoMessage"] = "คุณได้ออกจากระบบเรียบร้อยแล้ว";
            return RedirectToAction("Login");
        }

        #endregion

        #region Forgot Password

        // GET: /Admin/Auth/ForgotPassword
        [HttpGet]
        public IActionResult ForgotPassword()
        {
            return View();
        }

        // POST: /Admin/Auth/ForgotPassword
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult ForgotPassword(ForgotPasswordViewModel model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    // ค้นหา Admin User จาก Email
                    var admin = _repo.Fetch<AdminUser>()
                        .Where(new { Email = model.Email })
                        .FirstOrDefault();

                    if (admin != null && admin.IsActive)
                    {
                        // สร้าง Reset Token
                        var resetToken = Guid.NewGuid().ToString("N");
                        var resetTokenExpiry = DateTime.Now.AddHours(24);

                        // TODO: บันทึก resetToken และ resetTokenExpiry ใน database
                        // admin.PasswordResetToken = resetToken;
                        // admin.PasswordResetTokenExpiry = resetTokenExpiry;
                        // _repo.Update(admin);

                        // TODO: ส่งอีเมล์พร้อม reset link
                        // var resetLink = Url.Action("ResetPassword", "Auth", 
                        //     new { token = resetToken }, Request.Scheme);
                        // await _emailService.SendPasswordResetEmail(admin.Email, resetLink);

                        // Log activity
                        LogActivity(admin.Id, admin.Username, "ForgotPassword", "Auth",
                            $"ขอรีเซ็ตรหัสผ่านสำหรับ {admin.Email}");
                    }

                    // แสดงข้อความเดียวกันเสมอ (เพื่อความปลอดภัย)
                    TempData["SuccessMessage"] = "หากอีเมล์นี้มีอยู่ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมล์ของคุณแล้ว";
                    return RedirectToAction("Login");
                }
                catch (Exception ex)
                {
                    ModelState.AddModelError("", $"เกิดข้อผิดพลาด: {ex.Message}");
                }
            }

            return View(model);
        }

        #endregion

        #region Reset Password

        // GET: /Admin/Auth/ResetPassword?token=xxx
        [HttpGet]
        public IActionResult ResetPassword(string token)
        {
            if (string.IsNullOrEmpty(token))
            {
                TempData["ErrorMessage"] = "Token ไม่ถูกต้อง";
                return RedirectToAction("Login");
            }

            // TODO: ตรวจสอบ token
            // var admin = _repo.Fetch<AdminUser>()
            //     .Where(new { PasswordResetToken = token })
            //     .FirstOrDefault();
            //
            // if (admin == null || admin.PasswordResetTokenExpiry < DateTime.Now)
            // {
            //     TempData["ErrorMessage"] = "Token หมดอายุหรือไม่ถูกต้อง";
            //     return RedirectToAction("Login");
            // }

            var model = new ResetPasswordViewModel
            {
                Token = token
            };

            return View(model);
        }

        // POST: /Admin/Auth/ResetPassword
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult ResetPassword(ResetPasswordViewModel model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    // TODO: ค้นหา admin จาก token
                    // var admin = _repo.Fetch<AdminUser>()
                    //     .Where(new { PasswordResetToken = model.Token })
                    //     .FirstOrDefault();
                    //
                    // if (admin == null || admin.PasswordResetTokenExpiry < DateTime.Now)
                    // {
                    //     ModelState.AddModelError("", "Token หมดอายุหรือไม่ถูกต้อง");
                    //     return View(model);
                    // }

                    // TODO: Update password
                    // admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(model.NewPassword);
                    // admin.PasswordResetToken = null;
                    // admin.PasswordResetTokenExpiry = null;
                    // admin.UpdatedAt = DateTime.Now;
                    // _repo.Update(admin);

                    // Log activity
                    // LogActivity(admin.Id, admin.Username, "ResetPassword", "Auth", "รีเซ็ตรหัสผ่านสำเร็จ");

                    TempData["SuccessMessage"] = "รีเซ็ตรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่";
                    return RedirectToAction("Login");
                }
                catch (Exception ex)
                {
                    ModelState.AddModelError("", $"เกิดข้อผิดพลาด: {ex.Message}");
                }
            }

            return View(model);
        }

        #endregion

        #region Helper Methods

        private void LogActivity(int? userId, string username, string action, string module, string details)
        {
            try
            {
                var log = new ActivityLog
                {
                    UserId = userId,
                    Username = username,
                    Action = action,
                    Module = module,
                    Details = details,
                    IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
                    UserAgent = HttpContext.Request.Headers["User-Agent"].ToString(),
                    RequestUrl = HttpContext.Request.Path,
                    StatusCode = 200,
                    CreatedAt = DateTime.Now
                };

                // TODO: Insert log when Repository supports it
                // _repo.Insert(log);
            }
            catch
            {
                // Ignore logging errors
            }
        }

        #endregion
    }
}