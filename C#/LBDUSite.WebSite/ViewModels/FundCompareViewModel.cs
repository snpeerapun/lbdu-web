namespace LBDUSite.ViewModels
{
    public class FundCompareViewModel
    {
        public List<int> SelectedFundIds { get; set; } = new();
        public List<FundCompareItem> ComparedFunds { get; set; } = new();
    }

    public class FundCompareItem
    {
        // Basic Info
        public int FundId { get; set; }
        public string FundCode { get; set; }
        public string FundName { get; set; }
        public string FundType { get; set; }
        public string FundTypeDisplay { get; set; }

        // AMC Info
        public string AMCName { get; set; }
        public string AMCShortName { get; set; }
        public string AMCLogo { get; set; }

        // NAV Info
        public decimal CurrentNAV { get; set; }
        public DateTime NAVDate { get; set; }

        // Performance
        public decimal? ReturnYTD { get; set; }
        public decimal? Return1Y { get; set; }
        public decimal? Return3Y { get; set; }
        public decimal? Return5Y { get; set; }

        // Risk
        public int RiskLevel { get; set; }
        public string RiskLevelDesc { get; set; }
        public decimal? Sharpe { get; set; }
        public decimal? Sortino { get; set; }
        public decimal? MaxDrawdown { get; set; }

        // Investment Info
        public decimal? MinimumInvestment { get; set; }
        public decimal? MinimumRedemption { get; set; }

        // Fees
        public string ManagementFee { get; set; }
        public string FrontEndFee { get; set; }
        public string BackEndFee { get; set; }

        // Other Info
        public string DividendPolicy { get; set; }
        public string SettlementPeriod { get; set; }
        public DateTime? RegisDate { get; set; }
    }
}