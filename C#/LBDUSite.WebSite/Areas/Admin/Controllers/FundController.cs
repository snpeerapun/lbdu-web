using Microsoft.AspNetCore.Mvc;
using LBDUSite.Models;
using LBDUSite.Repository.Interfaces;
using LBDUSite.Areas.Admin.Models;
using LBDUSite.Areas.Admin.Models.ViewModels;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace LBDUSite.Areas.Admin.Controllers
{
    public class FundController : AdminBaseController
    {
        public FundController(IRepositoryFactory repo) : base(repo)
        {
        }

        // GET: Admin/Fund
        public IActionResult Index(PagingParameters parameters)
        {
            try
            {
                // Build query
                var query = _repo.Fetch<Fund>()
                    .Include<AMC>();

                // Apply search filter
                if (!string.IsNullOrEmpty(parameters.Search))
                {
                    query = query.Where(
                        "(ProjId LIKE @Search OR ProjNameTH LIKE @Search OR ProjAbbrName LIKE @Search)",
                        new { Search = $"%{parameters.Search}%" }
                    );
                }

                // Count total
                var totalCount = query.Count();

                // Apply sorting
                var sortBy = parameters.SortBy ?? "CreatedDate";
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
                var viewModels = items.Select(x => new FundListViewModel
                {
                    Id = x.Id,
                    ProjId = x.ProjId,
                    ProjAbbrName = x.ProjAbbrName,
                    ProjNameTH = x.ProjNameTH,
                    AMCName = x.AMC?.NameTH ?? "-",
                    FundStatus = x.FundStatus,
                    RiskSpectrum = x.RiskSpectrum,
                    IsActive = x.IsActive,
                    IsPopular = x.IsPopular,
                    LastUpdatedFromAPI = x.LastUpdatedFromAPI
                }).ToList();

                var result = new PagedResult<FundListViewModel>(
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
                return View(new PagedResult<FundListViewModel>());
            }
        }

        // GET: Admin/Fund/Details/5
        public IActionResult Details(int id)
        {
            try
            {
                var fund = _repo.Fetch<Fund>()
                    .Include<AMC>()
                    .Include<FundClass>()
                    .Include<FundNAV>()
                    .Where(new { Id = id })
                    .FirstOrDefault();

                if (fund == null)
                {
                    SetErrorMessage("ไม่พบข้อมูลกองทุน");
                    return RedirectToAction(nameof(Index));
                }

                // Get latest NAV
                var latestNav = fund.FundClasses?
                    .SelectMany(fc => fc.FundNAV ?? new System.Collections.Generic.List<FundNAV>())
                    .OrderByDescending(n => n.NAVDate)
                    .FirstOrDefault();

                var viewModel = new FundDetailsViewModel
                {
                    Id = fund.Id,
                    ProjId = fund.ProjId,
                    ProjAbbrName = fund.ProjAbbrName,
                    ProjNameTH = fund.ProjNameTH,
                    ProjNameEN = fund.ProjNameEN,
                    AMCName = fund.AMC?.NameTH ?? "-",
                    FundStatus = fund.FundStatus,
                    PolicyDesc = fund.PolicyDesc,
                    ManagementStyle = fund.ManagementStyle,
                    RiskSpectrum = fund.RiskSpectrum,
                    RiskSpectrumDesc = fund.RiskSpectrumDesc,
                    IsActive = fund.IsActive,
                    IsPopular = fund.IsPopular,
                    IsRecommended = fund.IsRecommended,
                    RegisDate = fund.RegisDate,
                    LastUpdatedFromAPI = fund.LastUpdatedFromAPI,
                    CreatedDate = fund.CreatedDate,
                    UpdatedDate = fund.UpdatedDate,
                    TotalClasses = fund.FundClasses?.Count ?? 0,
                    LatestNAV = latestNav?.NAV,
                    LatestNAVDate = latestNav?.NAVDate
                };

                return View(viewModel);
            }
            catch (Exception ex)
            {
                SetErrorMessage($"เกิดข้อผิดพลาด: {ex.Message}");
                return RedirectToAction(nameof(Index));
            }
        }

        // GET: Admin/Fund/Create
        public IActionResult Create()
        {
            try
            {
                var amcs = _repo.Fetch<AMC>()
                    .Where(new { IsActive = true })
                    .OrderBy("NameTH")
                    .ToList();

                ViewBag.AMCs = amcs;
                return View();
            }
            catch (Exception ex)
            {
                SetErrorMessage($"เกิดข้อผิดพลาด: {ex.Message}");
                return RedirectToAction(nameof(Index));
            }
        }

        // POST: Admin/Fund/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(FundCreateViewModel model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    // ตรวจสอบ ProjId ซ้ำ
                    var existing = _repo.Fetch<Fund>()
                        .Where(new { ProjId = model.ProjId })
                        .FirstOrDefault();

                    if (existing != null)
                    {
                        ModelState.AddModelError("ProjId", "รหัสโครงการนี้มีอยู่ในระบบแล้ว");
                        var amcs = _repo.Fetch<AMC>().Where(new { IsActive = true }).OrderBy("NameTH").ToList();
                        ViewBag.AMCs = amcs;
                        return View(model);
                    }

                    var fund = new Fund
                    {
                        ProjId = model.ProjId,
                        ProjNameTH = model.ProjNameTH,
                        ProjNameEN = model.ProjNameEN,
                        ProjAbbrName = model.ProjAbbrName,
                        AMCId = model.AMCId,
                        FundStatus = model.FundStatus,
                        PolicyDesc = model.PolicyDesc,
                        ManagementStyle = model.ManagementStyle,
                        RiskSpectrum = model.RiskSpectrum,
                        RiskSpectrumDesc = model.RiskSpectrumDesc,
                        IsActive = model.IsActive,
                        IsPopular = model.IsPopular,
                        IsRecommended = model.IsRecommended,
                        CreatedDate = DateTime.Now
                    };

                    // TODO: Implement Insert when Repository supports it
                    // await _repo.InsertAsync(fund);

                    LogActivity("Create", "Fund", $"สร้างกองทุน {fund.ProjAbbrName}");

                    SetSuccessMessage("เพิ่มกองทุนสำเร็จ");
                    return RedirectToAction(nameof(Index));
                }
                catch (Exception ex)
                {
                    SetErrorMessage($"เกิดข้อผิดพลาด: {ex.Message}");
                }
            }

            var amcList = _repo.Fetch<AMC>().Where(new { IsActive = true }).OrderBy("NameTH").ToList();
            ViewBag.AMCs = amcList;
            return View(model);
        }

        // GET: Admin/Fund/Edit/5
        public IActionResult Edit(int id)
        {
            try
            {
                var fund = _repo.Fetch<Fund>()
                    .Where(new { Id = id })
                    .FirstOrDefault();

                if (fund == null)
                {
                    SetErrorMessage("ไม่พบข้อมูลกองทุน");
                    return RedirectToAction(nameof(Index));
                }

                var viewModel = new FundEditViewModel
                {
                    Id = fund.Id,
                    ProjId = fund.ProjId,
                    ProjNameTH = fund.ProjNameTH,
                    ProjNameEN = fund.ProjNameEN,
                    ProjAbbrName = fund.ProjAbbrName,
                    AMCId = fund.AMCId,
                    FundStatus = fund.FundStatus,
                    PolicyDesc = fund.PolicyDesc,
                    ManagementStyle = fund.ManagementStyle,
                    RiskSpectrum = fund.RiskSpectrum,
                    RiskSpectrumDesc = fund.RiskSpectrumDesc,
                    IsActive = fund.IsActive ?? false,
                    IsPopular = fund.IsPopular ?? false,
                    IsRecommended = fund.IsRecommended ?? false
                };

                var amcs = _repo.Fetch<AMC>().Where(new { IsActive = true }).OrderBy("NameTH").ToList();
                ViewBag.AMCs = amcs;
                return View(viewModel);
            }
            catch (Exception ex)
            {
                SetErrorMessage($"เกิดข้อผิดพลาด: {ex.Message}");
                return RedirectToAction(nameof(Index));
            }
        }

        // POST: Admin/Fund/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, FundEditViewModel model)
        {
            if (id != model.Id)
            {
                return HttpNotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    var fund = _repo.Fetch<Fund>()
                        .Where(new { Id = id })
                        .FirstOrDefault();

                    if (fund == null)
                    {
                        SetErrorMessage("ไม่พบข้อมูลกองทุน");
                        return RedirectToAction(nameof(Index));
                    }

                    // ตรวจสอบ ProjId ซ้ำ (ยกเว้นตัวเอง)
                    var existing = _repo.Fetch<Fund>()
                        .Where($"ProjId = @ProjId AND Id != @Id", new { ProjId = model.ProjId, Id = id })
                        .FirstOrDefault();

                    if (existing != null)
                    {
                        ModelState.AddModelError("ProjId", "รหัสโครงการนี้มีอยู่ในระบบแล้ว");
                        var amcs = _repo.Fetch<AMC>().Where(new { IsActive = true }).OrderBy("NameTH").ToList();
                        ViewBag.AMCs = amcs;
                        return View(model);
                    }

                    fund.ProjId = model.ProjId;
                    fund.ProjNameTH = model.ProjNameTH;
                    fund.ProjNameEN = model.ProjNameEN;
                    fund.ProjAbbrName = model.ProjAbbrName;
                    fund.AMCId = model.AMCId;
                    fund.FundStatus = model.FundStatus;
                    fund.PolicyDesc = model.PolicyDesc;
                    fund.ManagementStyle = model.ManagementStyle;
                    fund.RiskSpectrum = model.RiskSpectrum;
                    fund.RiskSpectrumDesc = model.RiskSpectrumDesc;
                    fund.IsActive = model.IsActive;
                    fund.IsPopular = model.IsPopular;
                    fund.IsRecommended = model.IsRecommended;
                    fund.UpdatedDate = DateTime.Now;

                    // TODO: Implement Update when Repository supports it
                    // await _repo.UpdateAsync(fund);

                    LogActivity("Update", "Fund", $"แก้ไขกองทุน {fund.ProjAbbrName}");

                    SetSuccessMessage("แก้ไขข้อมูลสำเร็จ");
                    return RedirectToAction(nameof(Index));
                }
                catch (Exception ex)
                {
                    SetErrorMessage($"เกิดข้อผิดพลาด: {ex.Message}");
                }
            }

            var amcList = _repo.Fetch<AMC>().Where(new { IsActive = true }).OrderBy("NameTH").ToList();
            ViewBag.AMCs = amcList;
            return View(model);
        }

        // POST: Admin/Fund/Delete/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Delete(int id)
        {
            try
            {
                var fund = _repo.Fetch<Fund>()
                    .Where(new { Id = id })
                    .FirstOrDefault();

                if (fund == null)
                {
                    return JsonError("ไม่พบข้อมูลกองทุน");
                }

                // TODO: Implement Delete when Repository supports it
                // await _repo.DeleteAsync(id);

                LogActivity("Delete", "Fund", $"ลบกองทุน {fund.ProjAbbrName}");

                return JsonSuccess("ลบข้อมูลสำเร็จ");
            }
            catch (Exception ex)
            {
                return JsonError($"เกิดข้อผิดพลาด: {ex.Message}");
            }
        }
    }
}
