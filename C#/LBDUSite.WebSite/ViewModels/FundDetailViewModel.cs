using System;
using System.Collections.Generic;
using LBDUSite.Models;
using LBDUSite.ViewModels;

namespace LBDUSite.ViewModels
{
    public class FundDetailViewModel
    {
        // Basic Info
        public int FundId { get; set; }
        public string FundCode { get; set; }
        public string FundName { get; set; }
        public string FundType { get; set; }
        public string FundTypeDisplay { get; set; }
        public string PolicyDesc { get; set; }

        // AMC
        public int AMCId { get; set; }
        public string AMCName { get; set; }
        public string AMCShortName { get; set; }
        public string AMCLogo { get; set; }

        // NAV & Performance
        public decimal CurrentNAV { get; set; }
        public DateTime NAVDate { get; set; }
        public decimal? NAVChangePercent { get; set; }
        public decimal? YTDReturn { get; set; }
        public decimal? OneYearReturn { get; set; }
        public decimal? ThreeYearReturn { get; set; }
        public decimal? FiveYearReturn { get; set; }

        // Risk
        public int RiskLevel { get; set; }
        public string RiskLevelDesc { get; set; }

        // Investment Info
        public decimal? MinimumSubIPO { get; set; }
        public decimal? MinimumSub { get; set; }
        public decimal? MinimumRedempt { get; set; }

        // Fees
        public string ManagementFee { get; set; }
        public string FrontEndFee { get; set; }
        public string BackEndFee { get; set; }

        // Other Info
        public string DividendPolicy { get; set; }
        public DateTime? RegisDate { get; set; }
        public string SettlementPeriod { get; set; }

        // Related Data
        public List<FundPerformanceViewModel> PerformanceData { get; set; }
        public List<FundCardViewModel> RelatedFunds { get; set; }
        public List<NewsCardViewModel> RelatedNews { get; set; }
        public List<DocumentViewModel> Documents { get; set; }
        public FundManagerViewModel FundManager { get; set; }

        public List<DividendHistoryItem> DividendHistory { get; set; }

        // Portfolio - Top 5 Holdings
        public List<HoldingItem> Top5Holdings { get; set; }

        // Asset Allocation
        public List<AssetAllocationItem> AssetAllocation { get; set; }

        // Chart Data
        public List<ChartDataPoint> NAVChartData { get; set; }
    }

    public class FundPerformanceViewModel
    {
        public string Period { get; set; }
        public decimal? ReturnPercent { get; set; }
    }

    public class DocumentViewModel
    {
        public string Title { get; set; }
        public string Url { get; set; }
        public string IconClass { get; set; } = "fa-file-pdf";
    }

    public class FundManagerViewModel
    {
        public string Name { get; set; } = "ประพันธ์ มานะกิจ";
        public string Experience { get; set; } = "ประสบการณ์ 15 ปี";
        public string Initials { get; set; } = "PM";
    }

    public class ChartDataPoint
    {
        public DateTime Date { get; set; }
        public decimal Value { get; set; }
    }
    public class DividendHistoryItem
    {
        public DateTime ExDividendDate { get; set; }
        public decimal DividendPerUnit { get; set; }

        public string ExDividendDateDisplay => ExDividendDate.ToString("dd/MM/yyyy");
    }

    public class HoldingItem
    {
        public string SecurityName { get; set; }
        public string SecurityCode { get; set; }
        public decimal Weight { get; set; }
        public string Sector { get; set; }
    }

    public class AssetAllocationItem
    {
        public string AssetType { get; set; }
        public string AssetTypeEn { get; set; }
        public decimal Percentage { get; set; }
        public string Color { get; set; }
    }
}