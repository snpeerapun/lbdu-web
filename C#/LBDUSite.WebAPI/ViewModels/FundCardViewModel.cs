using System;

namespace LBDUSite.ViewModels
{
    public class FundCardViewModel
    {
        public int FundId { get; set; }
        public string FundCode { get; set; }          // ProjAbbrName
        public string FundName { get; set; }          // ProjNameTH
        public string FundType { get; set; }          // "equity", "mixed", "fixed"
        public string FundTypeDisplay { get; set; }   // "กองทุนหุ้น"

        // AMC Info
        public string AMCShortName { get; set; }      // "KFUND"
        public string AMCLogo { get; set; }           // First 2 letters

        // NAV Info
        public decimal NAV { get; set; }
        public decimal? NAVChangePercent { get; set; }
        public DateTime NAVDate { get; set; }

        // Performance
        public decimal? YTDReturn { get; set; }

        // Risk & Investment
        public int RiskLevel { get; set; }            // 1-5
        public string RiskLevelDesc { get; set; }     // "สูงที่สุด"
        public decimal? MinimumInvestment { get; set; }

        // Display helpers
        public string NAVChangeClass => NAVChangePercent >= 0 ? "positive" : "negative";
        public string FundTypeCssClass => FundType?.ToLower();
    }
}