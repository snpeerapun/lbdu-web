using Microsoft.AspNetCore.Mvc;
using LBDUSite.Models;
using LBDUSite.Repository.Interfaces;
using LBDUSite.Areas.Admin.Models.ViewModels;
using System;
using System.Linq;

namespace LBDUSite.Areas.Admin.Controllers
{
    public class DashboardController : AdminBaseController
    {
        public DashboardController(IRepositoryFactory repo) : base(repo)
        {
        }

        // GET: /Admin/Dashboard
        public IActionResult Index()
        {
            try
            {
                var viewModel = new DashboardViewModel();

                // Total Counts
                viewModel.TotalFunds = _repo.Fetch<Fund>().Count();
                viewModel.TotalActiveFunds = _repo.Fetch<Fund>()
                    .Where(new { IsActive = true })
                    .Count();

                viewModel.TotalAMCs = _repo.Fetch<AMC>().Count();
                viewModel.TotalActiveAMCs = _repo.Fetch<AMC>()
                    .Where(new { IsActive = true })
                    .Count();

                viewModel.TotalAdminUsers = _repo.Fetch<AdminUser>().Count();
                viewModel.TotalActiveAdminUsers = _repo.Fetch<AdminUser>()
                    .Where(new { IsActive = true })
                    .Count();

                // Recent Activities (Last 10)
                var recentActivities = _repo.Fetch<ActivityLog>()
                    .OrderByDescending("CreatedAt")
                    .Take(10)
                    .ToList();

                viewModel.RecentActivities = recentActivities.Select(a => new ActivityLogViewModel
                {
                    Action = a.Action,
                    Module = a.Module,
                    Details = a.Details,
                    IpAddress = a.IpAddress,
                    CreatedAt = a.CreatedAt
                }).ToList();

                // Recent Funds (Last 5)
                var recentFunds = _repo.Fetch<Fund>()
                    .Include<AMC>()
                    .OrderByDescending("CreatedDate")
                    .Take(5)
                    .ToList();

                viewModel.RecentFunds = recentFunds.Select(f => new FundSummaryViewModel
                {
                    Id = f.Id,
                    ProjId = f.ProjId,
                    ProjAbbrName = f.ProjAbbrName,
                    ProjNameTH = f.ProjNameTH,
                    AMCName = f.AMC?.NameTH ?? "-",
                    IsActive = f.IsActive ?? false,
                    CreatedDate = f.CreatedDate
                }).ToList();

                // Statistics for Charts (Optional)
                viewModel.FundsByStatus = GetFundsByStatus();
                viewModel.FundsByRiskLevel = GetFundsByRiskLevel();

                ViewBag.CurrentPage = "Dashboard";
                return View(viewModel);
            }
            catch (Exception ex)
            {
                SetErrorMessage($"เกิดข้อผิดพลาด: {ex.Message}");
                return View(new DashboardViewModel());
            }
        }

        #region Helper Methods

        private DashboardStatistics GetFundsByStatus()
        {
            try
            {
                var active = _repo.Fetch<Fund>()
                    .Where(new { IsActive = true })
                    .Count();

                var inactive = _repo.Fetch<Fund>()
                    .Where(new { IsActive = false })
                    .Count();

                return new DashboardStatistics
                {
                    Labels = new[] { "Active", "Inactive" },
                    Values = new[] { active, inactive },
                    Colors = new[] { "#28a745", "#dc3545" }
                };
            }
            catch
            {
                return new DashboardStatistics();
            }
        }

        private DashboardStatistics GetFundsByRiskLevel()
        {
            try
            {
                var allFunds = _repo.Fetch<Fund>().ToList();

                var lowRisk = allFunds.Count(f => f.RiskSpectrum?.Contains("1") == true || f.RiskSpectrum?.Contains("2") == true);
                var mediumRisk = allFunds.Count(f => f.RiskSpectrum?.Contains("3") == true || f.RiskSpectrum?.Contains("4") == true);
                var highRisk = allFunds.Count(f => f.RiskSpectrum?.Contains("5") == true || f.RiskSpectrum?.Contains("6") == true || f.RiskSpectrum?.Contains("7") == true || f.RiskSpectrum?.Contains("8") == true);

                return new DashboardStatistics
                {
                    Labels = new[] { "Low Risk (1-2)", "Medium Risk (3-4)", "High Risk (5-8)" },
                    Values = new[] { lowRisk, mediumRisk, highRisk },
                    Colors = new[] { "#28a745", "#ffc107", "#dc3545" }
                };
            }
            catch
            {
                return new DashboardStatistics();
            }
        }

        #endregion
    }
}