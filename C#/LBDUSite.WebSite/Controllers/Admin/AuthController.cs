using LBDUSite.Services;
using LBDUSite.ViewModels;
using LBDUSite.ViewModels.Admin;
using Microsoft.AspNetCore.Mvc;

namespace LBDUSite.Controllers.Admin
{
    [Route("Admin/Auth")]
    public class AuthController : Controller
    {
        private readonly IAdminAuthService _authService;

        public AuthController(IAdminAuthService authService)
        {
            _authService = authService;
        }

        // GET: /Admin/Auth/Login
        [HttpGet("/Admin/Login")]
        public IActionResult Login(string returnUrl = null)
        {
            var username = HttpContext.Session.GetString("AdminUsername");
            if (!string.IsNullOrEmpty(username))
            {
                return RedirectToAction("Index", "AdminDashboard");
            }

            ViewData["ReturnUrl"] = returnUrl;
            return View();
        }

        // POST: /Admin/Auth/Login
        [HttpPost("/Admin/Login")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(AdminLoginViewModel model, string returnUrl = null)
        {
            if (ModelState.IsValid)
            {
                var user = await _authService.ValidateUserAsync(model.Username, model.Password);

                if (user != null && user.IsActive)
                {
                    HttpContext.Session.SetString("AdminUsername", user.Username);
                    HttpContext.Session.SetString("AdminFullName", user.FullName);
                    HttpContext.Session.SetString("AdminRole", user.Role);
                    HttpContext.Session.SetInt32("AdminUserId", user.Id);

                    var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
                    await _authService.LogActivityAsync(user.Username, "Login", "Auth", "User logged in", ipAddress);

                    if (!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl))
                        return Redirect(returnUrl);

                    return RedirectToAction("Index", "AdminDashboard");
                }

                ModelState.AddModelError(string.Empty, "Username หรือ Password ไม่ถูกต้อง");
            }

            return View(model);
        }

        // GET: /Admin/Auth/Logout
        [HttpGet("/Admin/Logout")]
        public async Task<IActionResult> Logout()
        {
            var username = HttpContext.Session.GetString("AdminUsername");

            if (!string.IsNullOrEmpty(username))
            {
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
                await _authService.LogActivityAsync(username, "Logout", "Auth", "User logged out", ipAddress);
            }

            HttpContext.Session.Clear();
            return RedirectToAction("Login");
        }

        // GET: /Admin/Auth/Profile
        [HttpGet("Profile")]
        public IActionResult Profile()
        {
            var userId = HttpContext.Session.GetInt32("AdminUserId");
            if (!userId.HasValue)
                return RedirectToAction("Login");

            // TODO: Get user from database
            var user = new AdminUser
            {
                Id = userId.Value,
                Username = HttpContext.Session.GetString("AdminUsername"),
                FullName = HttpContext.Session.GetString("AdminFullName"),
                Role = HttpContext.Session.GetString("AdminRole")
            };

            return View(user);
        }

        // GET: /Admin/Auth/ChangePassword
        [HttpGet("ChangePassword")]
        public IActionResult ChangePassword()
        {
            return View();
        }

        // POST: /Admin/Auth/ChangePassword
        [HttpPost("ChangePassword")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ChangePassword(ChangePasswordViewModel model)
        {
            if (ModelState.IsValid)
            {
                var username = HttpContext.Session.GetString("AdminUsername");
                // TODO: Validate and update password

                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
                await _authService.LogActivityAsync(username, "ChangePassword", "Auth", "Password changed", ipAddress);

                TempData["SuccessMessage"] = "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว";
                return RedirectToAction("Profile");
            }

            return View(model);
        }

        // GET: /Admin/Auth/AccessDenied
        [HttpGet("/Admin/AccessDenied")]
        public IActionResult AccessDenied()
        {
            return View();
        }
    }
}