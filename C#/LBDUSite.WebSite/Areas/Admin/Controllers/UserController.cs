using Microsoft.AspNetCore.Mvc;
using LBDUSite.Models;
using LBDUSite.Repository.Interfaces;
using LBDUSite.Areas.Admin.Models;
using LBDUSite.Areas.Admin.Models.ViewModels;
using System;
using System.Linq;
using System.Threading.Tasks;
using BCrypt.Net;

namespace LBDUSite.Areas.Admin.Controllers
{
    public class UserController : AdminBaseController
    {
        public UserController(IRepositoryFactory repo) : base(repo)
        {
        }

        // GET: Admin/AdminUser
        public IActionResult Index(PagingParameters parameters)
        {
            try
            {
                // Build query
                var query = _repo.Fetch<AdminUser>();

                // Apply search filter
                if (!string.IsNullOrEmpty(parameters.Search))
                {
                    query = query.Where(
                        "(Username LIKE @Search OR FullName LIKE @Search OR Email LIKE @Search)",
                        new { Search = $"%{parameters.Search}%" }
                    );
                }

                // Count total
                var totalCount = query.Count();

                // Apply sorting
                var sortBy = parameters.SortBy ?? "CreatedAt";
                if (parameters.SortOrder == "desc")
                {
                    query = query.OrderByDescending(sortBy);
                }
                else
                {
                    query = query.OrderBy(sortBy);
                }

                // Apply pagination
                var items = query
                    .Skip((parameters.Page - 1) * parameters.PageSize)
                    .Take(parameters.PageSize)
                    .ToList();

                // Map to ViewModel
                var viewModels = items.Select(x => new AdminUserListViewModel
                {
                    Id = x.Id,
                    Username = x.Username,
                    FullName = x.FullName,
                    Email = x.Email,
                    Role = x.Role,
                    IsActive = x.IsActive,
                    LastLoginAt = x.LastLoginAt,
                    CreatedAt = x.CreatedAt
                }).ToList();

                var result = new PagedResult<AdminUserListViewModel>(
                    items: viewModels,
                    totalCount: totalCount,
                    currentPage: parameters.Page,
                    pageSize: parameters.PageSize,
                    sortBy: parameters.SortBy,
                    sortOrder: parameters.SortOrder,
                    search: parameters.Search
                );

                ViewBag.SearchTerm = parameters.Search;
                return View(result);
            }
            catch (Exception ex)
            {
                SetErrorMessage($"เกิดข้อผิดพลาด: {ex.Message}");
                return View(new PagedResult<AdminUserListViewModel>());
            }
        }

        // GET: Admin/AdminUser/Details/5
        public IActionResult Details(int id)
        {
            try
            {
                var adminUser = _repo.Fetch<AdminUser>()
                    .Where(new { Id = id })
                    .FirstOrDefault();

                if (adminUser == null)
                {
                    SetErrorMessage("ไม่พบข้อมูลผู้ใช้");
                    return RedirectToAction(nameof(Index));
                }

                // Count activity logs
                var activityCount = _repo.Fetch<ActivityLog>()
                    .Where(new { UserId = id })
                    .Count();

                var viewModel = new AdminUserDetailsViewModel
                {
                    Id = adminUser.Id,
                    Username = adminUser.Username,
                    FullName = adminUser.FullName,
                    Email = adminUser.Email,
                    Role = adminUser.Role,
                    IsActive = adminUser.IsActive,
                    ProfileImage = adminUser.ProfileImage,
                    CreatedAt = adminUser.CreatedAt,
                    UpdatedAt = adminUser.UpdatedAt,
                    LastLoginAt = adminUser.LastLoginAt,
                    CreatedBy = adminUser.CreatedBy,
                    UpdatedBy = adminUser.UpdatedBy,
                    TotalActivityLogs = activityCount
                };

                return View(viewModel);
            }
            catch (Exception ex)
            {
                SetErrorMessage($"เกิดข้อผิดพลาด: {ex.Message}");
                return RedirectToAction(nameof(Index));
            }
        }

        // GET: Admin/AdminUser/Create
        public IActionResult Create()
        {
            ViewBag.Roles = new[] { "Super Administrator", "Administrator", "Editor", "Viewer" };
            return View();
        }

        // POST: Admin/AdminUser/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(AdminUserCreateViewModel model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    // ตรวจสอบ username ซ้ำ
                    var existingUser = _repo.Fetch<AdminUser>()
                        .Where(new { Username = model.Username })
                        .FirstOrDefault();

                    if (existingUser != null)
                    {
                        ModelState.AddModelError("Username", "ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว");
                        ViewBag.Roles = new[] { "Super Administrator", "Administrator", "Editor", "Viewer" };
                        return View(model);
                    }

                    // ตรวจสอบ email ซ้ำ
                    var existingEmail = _repo.Fetch<AdminUser>()
                        .Where(new { Email = model.Email })
                        .FirstOrDefault();

                    if (existingEmail != null)
                    {
                        ModelState.AddModelError("Email", "อีเมลนี้มีอยู่ในระบบแล้ว");
                        ViewBag.Roles = new[] { "Super Administrator", "Administrator", "Editor", "Viewer" };
                        return View(model);
                    }

                    var adminUser = new AdminUser
                    {
                        Username = model.Username,
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword(model.Password),
                        FullName = model.FullName,
                        Email = model.Email,
                        Role = model.Role,
                        IsActive = model.IsActive,
                        CreatedAt = DateTime.Now,
                        CreatedBy = CurrentAdminUsername
                    };

                    // TODO: Implement Insert when Repository supports it
                    // await _repo.InsertAsync(adminUser);

                    // Log activity
                    LogActivity("Create", "AdminUser", $"สร้างผู้ใช้ {adminUser.Username}");

                    SetSuccessMessage("เพิ่มผู้ใช้สำเร็จ");
                    return RedirectToAction(nameof(Index));
                }
                catch (Exception ex)
                {
                    SetErrorMessage($"เกิดข้อผิดพลาด: {ex.Message}");
                }
            }

            ViewBag.Roles = new[] { "Super Administrator", "Administrator", "Editor", "Viewer" };
            return View(model);
        }

        // GET: Admin/AdminUser/Edit/5
        public IActionResult Edit(int id)
        {
            try
            {
                var adminUser = _repo.Fetch<AdminUser>()
                    .Where(new { Id = id })
                    .FirstOrDefault();

                if (adminUser == null)
                {
                    SetErrorMessage("ไม่พบข้อมูลผู้ใช้");
                    return RedirectToAction(nameof(Index));
                }

                var viewModel = new AdminUserEditViewModel
                {
                    Id = adminUser.Id,
                    Username = adminUser.Username,
                    FullName = adminUser.FullName,
                    Email = adminUser.Email,
                    Role = adminUser.Role,
                    IsActive = adminUser.IsActive,
                    ProfileImage = adminUser.ProfileImage
                };

                ViewBag.Roles = new[] { "Super Administrator", "Administrator", "Editor", "Viewer" };
                return View(viewModel);
            }
            catch (Exception ex)
            {
                SetErrorMessage($"เกิดข้อผิดพลาด: {ex.Message}");
                return RedirectToAction(nameof(Index));
            }
        }

        // POST: Admin/AdminUser/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, AdminUserEditViewModel model)
        {
            if (id != model.Id)
            {
                return HttpNotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    var adminUser = _repo.Fetch<AdminUser>()
                        .Where(new { Id = id })
                        .FirstOrDefault();

                    if (adminUser == null)
                    {
                        SetErrorMessage("ไม่พบข้อมูลผู้ใช้");
                        return RedirectToAction(nameof(Index));
                    }

                    // ตรวจสอบ username ซ้ำ (ยกเว้นตัวเอง)
                    var existingUser = _repo.Fetch<AdminUser>()
                        .Where($"Username = @Username AND Id != @Id", new { Username = model.Username, Id = id })
                        .FirstOrDefault();

                    if (existingUser != null)
                    {
                        ModelState.AddModelError("Username", "ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว");
                        ViewBag.Roles = new[] { "Super Administrator", "Administrator", "Editor", "Viewer" };
                        return View(model);
                    }

                    // ตรวจสอบ email ซ้ำ (ยกเว้นตัวเอง)
                    var existingEmail = _repo.Fetch<AdminUser>()
                        .Where($"Email = @Email AND Id != @Id", new { Email = model.Email, Id = id })
                        .FirstOrDefault();

                    if (existingEmail != null)
                    {
                        ModelState.AddModelError("Email", "อีเมลนี้มีอยู่ในระบบแล้ว");
                        ViewBag.Roles = new[] { "Super Administrator", "Administrator", "Editor", "Viewer" };
                        return View(model);
                    }

                    adminUser.Username = model.Username;
                    adminUser.FullName = model.FullName;
                    adminUser.Email = model.Email;
                    adminUser.Role = model.Role;
                    adminUser.IsActive = model.IsActive;
                    adminUser.UpdatedAt = DateTime.Now;
                    adminUser.UpdatedBy = CurrentAdminUsername;

                    // Update password ถ้ามีการกรอก
                    if (!string.IsNullOrEmpty(model.Password))
                    {
                        adminUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(model.Password);
                    }

                    // TODO: Implement Update when Repository supports it
                    // await _repo.UpdateAsync(adminUser);

                    // Log activity
                    LogActivity("Update", "AdminUser", $"แก้ไขข้อมูลผู้ใช้ {adminUser.Username}");

                    SetSuccessMessage("แก้ไขข้อมูลสำเร็จ");
                    return RedirectToAction(nameof(Index));
                }
                catch (Exception ex)
                {
                    SetErrorMessage($"เกิดข้อผิดพลาด: {ex.Message}");
                }
            }

            ViewBag.Roles = new[] { "Super Administrator", "Administrator", "Editor", "Viewer" };
            return View(model);
        }

        // POST: Admin/AdminUser/Delete/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Delete(int id)
        {
            try
            {
                var adminUser = _repo.Fetch<AdminUser>()
                    .Where(new { Id = id })
                    .FirstOrDefault();

                if (adminUser == null)
                {
                    return JsonError("ไม่พบข้อมูลผู้ใช้");
                }

                // ป้องกันลบตัวเอง
                if (adminUser.Id == CurrentAdminId)
                {
                    return JsonError("ไม่สามารถลบผู้ใช้ที่กำลังเข้าสู่ระบบได้");
                }

                // TODO: Implement Delete when Repository supports it
                // await _repo.DeleteAsync(id);

                // Log activity
                LogActivity("Delete", "AdminUser", $"ลบผู้ใช้ {adminUser.Username}");

                return JsonSuccess("ลบข้อมูลสำเร็จ");
            }
            catch (Exception ex)
            {
                return JsonError($"เกิดข้อผิดพลาด: {ex.Message}");
            }
        }
    }
}
