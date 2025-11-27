
using System;
using System.Collections.Generic;

namespace LBDUSite.Areas.Admin.Models.ViewModels
{
    /// <summary>
    /// ViewModel สำหรับหน้า Dashboard
    /// </summary>
    public class DashboardViewModel
    {
        // Statistics
        public int TotalFunds { get; set; }
        public int TotalActiveFunds { get; set; }
        public int TotalAMCs { get; set; }
        public int TotalActiveAMCs { get; set; }
        public int TotalAdminUsers { get; set; }
        public int TotalActiveAdminUsers { get; set; }

        // Recent Data
        public List<ActivityLogViewModel> RecentActivities { get; set; } = new List<ActivityLogViewModel>();
        public List<FundSummaryViewModel> RecentFunds { get; set; } = new List<FundSummaryViewModel>();

        // Chart Data
        public DashboardStatistics FundsByStatus { get; set; } = new DashboardStatistics();
        public DashboardStatistics FundsByRiskLevel { get; set; } = new DashboardStatistics();
    }

    /// <summary>
    /// ViewModel สำหรับแสดงข้อมูลสรุปกองทุน
    /// </summary>
    public class FundSummaryViewModel
    {
        public int Id { get; set; }
        public string ProjId { get; set; }
        public string ProjAbbrName { get; set; }
        public string ProjNameTH { get; set; }
        public string AMCName { get; set; }
        public bool IsActive { get; set; }
        public DateTime? CreatedDate { get; set; }
    }

    /// <summary>
    /// ViewModel สำหรับ Chart Statistics
    /// </summary>
    public class DashboardStatistics
    {
        public string[] Labels { get; set; } = Array.Empty<string>();
        public int[] Values { get; set; } = Array.Empty<int>();
        public string[] Colors { get; set; } = Array.Empty<string>();
    }
}