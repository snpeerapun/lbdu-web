namespace LBDUSite.ViewModels
{
    public class LearningCenterViewModel
    {
        public List<LearningToolViewModel> Tools { get; set; } = new();
        public List<GuideViewModel> Guides { get; set; } = new();
        public List<CalculatorViewModel> Calculators { get; set; } = new();
        public List<VideoViewModel> Videos { get; set; } = new();
        public List<ArticleViewModel> Articles { get; set; } = new();
        public List<FAQViewModel> FAQ { get; set; } = new();
    }

    public class LearningToolViewModel
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string IconClass { get; set; }
        public string Color { get; set; }
        public string Url { get; set; }
        public string Duration { get; set; }
        public string Difficulty { get; set; }
        public string Category { get; set; }
        public bool IsFeatured { get; set; }
        public string ImageUrl { get; set; }
    }

    public class GuideViewModel
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public int Steps { get; set; }
        public int ReadingTime { get; set; }
        public string Difficulty { get; set; }
    }

    public class CalculatorViewModel
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string Icon { get; set; }
    }

    public class VideoViewModel
    {
        public string Title { get; set; }
        public string Duration { get; set; }
        public int Views { get; set; }
        public string ThumbnailUrl { get; set; }
        public string VideoUrl { get; set; }
    }

    public class ArticleViewModel
    {
        public string Title { get; set; }
        public int ReadingTime { get; set; }
        public string Category { get; set; }
    }

    public class FAQViewModel
    {
        public string Question { get; set; }
        public string Answer { get; set; }
        public string Category { get; set; }
    }

    public class PortfolioSimulatorViewModel
    {
        public decimal InvestmentAmount { get; set; }
        public int TimeHorizon { get; set; }
        public string SelectedRisk { get; set; }
        public Dictionary<string, RiskProfileModel> RiskProfiles { get; set; }
        public Dictionary<string, List<FundModel>> FundDatabase { get; set; }
    }

    public class RiskProfileModel
    {
        public string Name { get; set; }
        public string Badge { get; set; }
        public string Icon { get; set; }
        public string Description { get; set; }
        public AssetAllocation Allocation { get; set; }
        public decimal ExpectedReturn { get; set; }
        public int Volatility { get; set; }
    }

    public class AssetAllocation
    {
        public int Equity { get; set; }
        public int Mixed { get; set; }
        public int Fixed { get; set; }
        public int Money { get; set; }
    }

    public class FundModel
    {
        public string Code { get; set; }
        public string Name { get; set; }
        public decimal Return { get; set; }
        public string Risk { get; set; }
        public string AUM { get; set; }
        public int Score { get; set; }
    }
}