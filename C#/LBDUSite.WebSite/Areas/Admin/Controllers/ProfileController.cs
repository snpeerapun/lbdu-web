using BCrypt.Net;
using LBDUSite.Areas.Admin.Models.ViewModels;
using LBDUSite.Models;
using LBDUSite.Repository.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;

namespace LBDUSite.Areas.Admin.Controllers
{
    public class ProfileController : AdminBaseController
    {
        public ProfileController(IRepositoryFactory repo) : base(repo)
        {
        }

        // GET: /Admin/Profile
        [HttpGet]
        public IActionResult Index()
        {
            try
            {
                if (CurrentAdminId == null)
                {
                    return RedirectToAction("Login", "Auth");
                }

                var admin = _repo.Fetch<AdminUser>()
                    .Where(new { Id = CurrentAdminId.Value })
                    .FirstOrDefault();

                if (admin == null)
                {
                    SetErrorMessage("ไม่พบข้อมูลผู้ใช้");
                    return RedirectToAction("Login", "Auth");
                }

                // Count activities
                var activityCount = _repo.Fetch<ActivityLog>()
                    .Where(new { UserId = CurrentAdminId.Value })
                    .Count();

                var viewModel = new ProfileViewModel
                {
                    Id = admin.Id,
                    Username = admin.Username,
                    FullName = admin.FullName,
                    Email = admin.Email,
                    Role = admin.Role,
                    ProfileImage = admin.ProfileImage,
                    CreatedAt = admin.CreatedAt,
                    LastLoginAt = admin.LastLoginAt,
                    TotalActivities = activityCount
                };

                return View(viewModel);
            }
            catch (Exception ex)
            {
                SetErrorMessage($"เกิดข้อผิดพลาด: {ex.Message}");
                return RedirectToAction("Index", "Dashboard");
            }
        }

        // GET: /Admin/Profile/Edit
        [HttpGet]
        public IActionResult Edit()
        {
            try
            {
                if (CurrentAdminId == null)
                {
                    return RedirectToAction("Login", "Auth");
                }

                var admin = _repo.Fetch<AdminUser>()
                    .Where(new { Id = CurrentAdminId.Value })
                    .FirstOrDefault();

                if (admin == null)
                {
                    SetErrorMessage("ไม่พบข้อมูลผู้ใช้");
                    return RedirectToAction("Login", "Auth");
                }

                var viewModel = new ProfileEditViewModel
                {
                    FullName = admin.FullName,
                    Email = admin.Email,
                    ProfileImage = admin.ProfileImage
                };

                return View(viewModel);
            }
            catch (Exception ex)
            {
                SetErrorMessage($"เกิดข้อผิดพลาด: {ex.Message}");
                return RedirectToAction("Index");
            }
        }

        // POST: /Admin/Profile/Edit
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Edit(ProfileEditViewModel model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    if (CurrentAdminId == null)
                    {
                        return RedirectToAction("Login", "Auth");
                    }

                    var admin = _repo.Fetch<AdminUser>()
                        .Where(new { Id = CurrentAdminId.Value })
                        .FirstOrDefault();

                    if (admin == null)
                    {
                        SetErrorMessage("ไม่พบข้อมูลผู้ใช้");
                        return RedirectToAction("Login", "Auth");
                    }

                    // ตรวจสอบ email ซ้ำ (ยกเว้นตัวเอง)
                    var existingEmail = _repo.Fetch<AdminUser>()
                        .Where($"Email = @Email AND Id != @Id",
                            new { Email = model.Email, Id = CurrentAdminId.Value })
                        .FirstOrDefault();

                    if (existingEmail != null)
                    {
                        ModelState.AddModelError("Email", "อีเมลนี้มีผู้ใช้งานแล้ว");
                        return View(model);
                    }

                    // Update
                    admin.FullName = model.FullName;
                    admin.Email = model.Email;
                    admin.UpdatedAt = DateTime.Now;

                    // TODO: Handle profile image upload
                    // if (model.ProfileImageFile != null)
                    // {
                    //     var fileName = await SaveProfileImage(model.ProfileImageFile);
                    //     admin.ProfileImage = fileName;
                    // }

                    // TODO: Update when Repository supports it
                    // _repo.Update(admin);

                    // Update session
                    HttpContext.Session.SetString("AdminFullName", admin.FullName ?? admin.Username);
                    HttpContext.Session.SetString("AdminEmail", admin.Email ?? "");

                    LogActivity("Update", "Profile", "แก้ไขข้อมูลโปรไฟล์");

                    SetSuccessMessage("บันทึกข้อมูลสำเร็จ");
                    return RedirectToAction("Index");
                }
                catch (Exception ex)
                {
                    SetErrorMessage($"เกิดข้อผิดพลาด: {ex.Message}");
                }
            }

            return View(model);
        }

        // GET: /Admin/Profile/ChangePassword
        [HttpGet]
        public IActionResult ChangePassword()
        {
            return View();
        }

        // POST: /Admin/Profile/ChangePassword
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult ChangePassword(ChangePasswordViewModel model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    if (CurrentAdminId == null)
                    {
                        return RedirectToAction("Login", "Auth");
                    }

                    var admin = _repo.Fetch<AdminUser>()
                        .Where(new { Id = CurrentAdminId.Value })
                        .FirstOrDefault();

                    if (admin == null)
                    {
                        SetErrorMessage("ไม่พบข้อมูลผู้ใช้");
                        return RedirectToAction("Login", "Auth");
                    }

                    // ตรวจสอบรหัสผ่านเดิม
                    if (!BCrypt.Net.BCrypt.Verify(model.CurrentPassword, admin.PasswordHash))
                    {
                        ModelState.AddModelError("CurrentPassword", "รหัสผ่านเดิมไม่ถูกต้อง");
                        return View(model);
                    }

                    // ตรวจสอบว่ารหัสผ่านใหม่ไม่ซ้ำกับรหัสผ่านเดิม
                    if (BCrypt.Net.BCrypt.Verify(model.NewPassword, admin.PasswordHash))
                    {
                        ModelState.AddModelError("NewPassword", "รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม");
                        return View(model);
                    }

                    // Update password
                    admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(model.NewPassword);
                    admin.UpdatedAt = DateTime.Now;

                    // TODO: Update when Repository supports it
                    // _repo.Update(admin);

                    LogActivity("ChangePassword", "Profile", "เปลี่ยนรหัสผ่านสำเร็จ");

                    SetSuccessMessage("เปลี่ยนรหัสผ่านสำเร็จ");
                    return RedirectToAction("Index");
                }
                catch (Exception ex)
                {
                    SetErrorMessage($"เกิดข้อผิดพลาด: {ex.Message}");
                }
            }

            return View(model);
        }

        // GET: /Admin/Profile/Activities
        [HttpGet]
        public IActionResult Activities(int page = 1, int pageSize = 20)
        {
            try
            {
                if (CurrentAdminId == null)
                {
                    return RedirectToAction("Login", "Auth");
                }

                var query = _repo.Fetch<ActivityLog>()
                    .Where(new { UserId = CurrentAdminId.Value });

                var totalCount = query.Count();

                var activities = query
                    .OrderByDescending("CreatedAt")
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                var viewModels = activities.Select(x => new ActivityLogViewModel
                {
                    Action = x.Action,
                    Module = x.Module,
                    Details = x.Details,
                    IpAddress = x.IpAddress,
                    CreatedAt = x.CreatedAt
                }).ToList();

                var result = new LBDUSite.Areas.Admin.Models.PagedResult<ActivityLogViewModel>(
                    viewModels,
                    totalCount,
                    page,
                    pageSize
                );

                return View(result);
            }
            catch (Exception ex)
            {
                SetErrorMessage($"เกิดข้อผิดพลาด: {ex.Message}");
                return RedirectToAction("Index");
            }
        }
    }
}