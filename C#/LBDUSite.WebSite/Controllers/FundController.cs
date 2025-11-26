using LBDUSite.Models;
using LBDUSite.Repository.Interfaces;
using LBDUSite.Controllers;
using LBDUSite.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace LBDUSite.Controllers
{
    [Route("Fund")]
    public class FundController : BaseController
    {
        private readonly IRepositoryFactory _repo;
        private readonly IMemoryCache _cache;
        private readonly ILogger<FundController> _logger;
        private readonly IConfiguration _configuration;

        public FundController(
            IRepositoryFactory repo,
            IMemoryCache cache,
            ILogger<FundController> logger,
            IConfiguration configuration)
        {
            _repo = repo ?? throw new ArgumentNullException(nameof(repo));
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }

        // GET: /Fund
        // GET: /Fund/Index
        // GET: /Fund?category=หุ้น&search=KBANK&page=1
        [HttpGet("")]
        [HttpGet("Index")]
        public IActionResult Index(string? category = null, string? search = null, int page = 1)
        {
            try
            {
                var query = _repo.Fetch<Fund>()
                        .Include<AMC>()
                        .Include<FundClass>()
                        .Include<FundPerformance>()
                        .Include<FundInvestmentInfo>()
                        .Where(new { IsActive = true });

                // Apply category filter
                if (!string.IsNullOrEmpty(category))
                {
                    // query = query.Where("PolicyDesc LIKE @Policy", new { Policy = $"%{category}%" });
                }

                // Apply search filter
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(
                        "(ProjNameTH LIKE @Search OR ProjAbbrName LIKE @Search)",
                        new { Search = $"%{search}%" }
                    );
                }

                // Count total
                var totalCount = query.Count();

                // Apply pagination
                var pageSize = 12;
                var funds = query
                    .OrderBy("ProjAbbrName")
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                FundListViewModel viewModel = new FundListViewModel
                {
                    Funds = funds.Select(f => MapToFundCardViewModel(f)).ToList(),
                    CurrentPage = page,
                    PageSize = pageSize,
                    TotalCount = totalCount,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                    Category = category,
                    SearchTerm = search
                };
              
                ViewBag.Title = string.IsNullOrEmpty(category)
                    ? "กองทุนทั้งหมด"
                    : $"กองทุน{category}";

                return View(viewModel);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading fund list");
                return InternalServerError("เกิดข้อผิดพลาดในการโหลดรายการกองทุน");
            }
        }

        // GET: /Fund/Detail/5
        // GET: /Fund/5
        [HttpGet("Detail/{id:int}")]
        [HttpGet("{id:int}")]
        public IActionResult Detail(int id)
        {
            try
            {
                var fund = _repo.Fetch<Fund>()
                       .Include<AMC>()
                       .Include<FundClass>()
                       .Include<FundPerformance>()
                       .Include<FundInvestmentInfo>()
                       .Include<FundDividend>()
                       .Include<FundURL>()
                       .Where(new { Id = id })
                       .FirstOrDefault();

                if (fund == null)
                {
                    _logger.LogWarning("Fund not found - ID: {FundId}", id);
                    return HttpNotFound("ไม่พบกองทุนที่ต้องการ");
                }

                FundDetailViewModel viewModel = MapToFundDetailViewModel(fund);

                // Get related data
                viewModel.RelatedFunds = GetRelatedFunds(fund);
                viewModel.RelatedNews = GetRelatedNews(fund.Id);
                viewModel.NAVChartData = GetNAVChartData(fund.Id, 30);

                // 🆕 Get Dividend History
                viewModel.DividendHistory = GetDividendHistory(fund.Id);

                // 🆕 Get Top 5 Holdings (Mock data for now)
                viewModel.Top5Holdings = GetTop5Holdings(fund.Id);

                // 🆕 Get Asset Allocation (Mock data for now)
                viewModel.AssetAllocation = GetAssetAllocation(fund.Id);

                ViewBag.Title = viewModel.FundName;
                return View(viewModel);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading fund detail - ID: {FundId}", id);
                return InternalServerError("เกิดข้อผิดพลาดในการโหลดรายละเอียดกองทุน");
            }
        }

        // GET: /Fund/Category/หุ้น
        [HttpGet("Category/{category}")]
        public IActionResult Category(string category, int page = 1)
        {
            return Index(category, null, page);
        }

        // GET: /Fund/Search?q=KBANK
        [HttpGet("Search")]
        public IActionResult Search(string? q, int page = 1)
        {
            return Index(null, q, page);
        }

        #region Private Methods

        private FundDetailViewModel MapToFundDetailViewModel(Fund fund)
        {
            var latestNAV = fund.FundClasses?
                .SelectMany(fc => fc.FundNAV ?? new List<FundNAV>())
                .OrderByDescending(n => n.NAVDate)
                .FirstOrDefault();

            var performances = fund.FundPerformances?.GroupBy(p => p.ReferencePeriod)
                .ToDictionary(g => g.Key, g => g.FirstOrDefault()?.PerformanceValue);

            var investmentInfo = fund.FundInvestmentInfo?.FirstOrDefault();
            var redemptionInfo = fund.FundRedemptionInfo?.FirstOrDefault();
            var dividendInfo = fund.FundDividends?.FirstOrDefault();
            var urls = fund.FundURLs?.FirstOrDefault();

            // Get fees
            var managementFee = fund.FundClasses?
                .SelectMany(fc => fc.FundFees ?? new List<FundFee>())
                .FirstOrDefault(f => f.FeeTypeDesc?.Contains("จัดการ") == true);

            var frontEndFee = fund.FundClasses?
                .SelectMany(fc => fc.FundFees ?? new List<FundFee>())
                .FirstOrDefault(f => f.FeeTypeDesc?.Contains("ขาย") == true);

            var backEndFee = fund.FundClasses?
                .SelectMany(fc => fc.FundFees ?? new List<FundFee>())
                .FirstOrDefault(f => f.FeeTypeDesc?.Contains("รับซื้อ") == true);

            var riskLevel = ParseRiskLevel(fund.RiskSpectrum);

            return new FundDetailViewModel
            {
                FundId = fund.Id,
                FundCode = fund.ProjAbbrName,
                FundName = fund.ProjNameTH,
                FundType = DetermineFundType(fund.PolicyDesc),
                FundTypeDisplay = GetFundTypeDisplay(DetermineFundType(fund.PolicyDesc)),
                PolicyDesc = fund.PolicyDesc,

                AMCId = fund.AMCId,
                AMCName = fund.AMC?.NameTH,
                AMCShortName = fund.AMC?.ShortName,
                AMCLogo = GetAMCInitials(fund.AMC?.ShortName ?? fund.AMC?.NameTH),

                CurrentNAV = latestNAV?.NAV ?? 0,
                NAVDate = latestNAV?.NAVDate ?? DateTime.Now,
                NAVChangePercent = latestNAV?.NAVChangePercent,

                YTDReturn = performances?.GetValueOrDefault("YTD"),
                OneYearReturn = performances?.GetValueOrDefault("1Y"),
                ThreeYearReturn = performances?.GetValueOrDefault("3Y"),
                FiveYearReturn = performances?.GetValueOrDefault("5Y"),

                RiskLevel = riskLevel,
                RiskLevelDesc = GetRiskLevelDesc(riskLevel),

                MinimumSubIPO = investmentInfo?.MinimumSubIPO,
                MinimumSub = investmentInfo?.MinimumSub,
                MinimumRedempt = investmentInfo?.MinimumRedempt,

                ManagementFee = FormatFee(managementFee),
                FrontEndFee = FormatFee(frontEndFee),
                BackEndFee = FormatFee(backEndFee),

                DividendPolicy = dividendInfo?.DividendPolicy ?? "ไม่จ่าย",
                RegisDate = fund.RegisDate,
                SettlementPeriod = redemptionInfo?.SettlementPeriod,

                Documents = new List<DocumentViewModel>
                {
                    new DocumentViewModel { Title = "หนังสือชี้ชวน", Url = urls?.URLFactsheet, IconClass = "fa-file-pdf" },
                    new DocumentViewModel { Title = "รายงานประจำปี", Url = urls?.URLAnnualReport, IconClass = "fa-file-pdf" },
                    new DocumentViewModel { Title = "Fund Fact Sheet", Url = urls?.URLFactsheet, IconClass = "fa-file-pdf" }
                }.Where(d => !string.IsNullOrEmpty(d.Url)).ToList(),

                FundManager = new FundManagerViewModel
                {
                    Name = "ทีมผู้จัดการกองทุน",
                    Initials = "FM",
                    Experience = "ประสบการณ์ 10+ ปี"
                },

                PerformanceData = fund.FundPerformances?
                    .Select(p => new FundPerformanceViewModel
                    {
                        Period = p.ReferencePeriod,
                        ReturnPercent = p.PerformanceValue
                    })
                    .ToList() ?? new List<FundPerformanceViewModel>()
            };
        }

        private FundCardViewModel MapToFundCardViewModel(Fund fund)
        {
            var latestNAV = fund.FundClasses?
                .SelectMany(fc => fc.FundNAV ?? new List<FundNAV>())
                .OrderByDescending(n => n.NAVDate)
                .FirstOrDefault();

            var ytdPerformance = fund.FundPerformances?
                .FirstOrDefault(p => p.ReferencePeriod == "YTD");

            var minInvestment = fund.FundInvestmentInfo?
                .FirstOrDefault()?.MinimumSub;

            var riskLevel = ParseRiskLevel(fund.RiskSpectrum);

            return new FundCardViewModel
            {
                FundId = fund.Id,
                FundCode = fund.ProjAbbrName,
                FundName = fund.ProjNameTH,
                FundType = DetermineFundType(fund.PolicyDesc),
                FundTypeDisplay = GetFundTypeDisplay(DetermineFundType(fund.PolicyDesc)),

                AMCShortName = fund.AMC?.ShortName ?? fund.AMC?.NameTH,
                AMCLogo = GetAMCInitials(fund.AMC?.ShortName ?? fund.AMC?.NameTH),

                NAV = latestNAV?.NAV ?? 0,
                NAVChangePercent = latestNAV?.NAVChangePercent,
                NAVDate = latestNAV?.NAVDate ?? DateTime.Now,

                YTDReturn = ytdPerformance?.PerformanceValue,

                RiskLevel = riskLevel,
                RiskLevelDesc = GetRiskLevelDesc(riskLevel),
                MinimumInvestment = minInvestment
            };
        }

        // 🆕 Get Dividend History
        private List<DividendHistoryItem> GetDividendHistory(int fundId)
        {
            try
            {
                var dividends = _repo.Fetch<FundDividend>()
                    .Where(new { FundId = fundId })
                    .OrderByDescending("ExDividendDate")
                    .Take(10)
                    .ToList();

                if (dividends.Any())
                {
                    return dividends.Select(d => new DividendHistoryItem
                    {
                        ExDividendDate = DateTime.Now,
                        DividendPerUnit =   0
                    }).ToList();
                }

                // Mock data if no real data
                return GenerateMockDividendHistory();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting dividend history for fund ID: {FundId}", fundId);
                return GenerateMockDividendHistory();
            }
        }

        // 🆕 Get Top 5 Holdings (Mock for now)
        private List<HoldingItem> GetTop5Holdings(int fundId)
        {
            try
            {
                // TODO: Implement real data from FundPortfolio table when available
                // For now, return mock data based on fund type

                return new List<HoldingItem>
                {
                    new HoldingItem { SecurityName = "ปตท.", SecurityCode = "PTT", Weight = 8.50m, Sector = "พลังงาน" },
                    new HoldingItem { SecurityName = "ธนาคารกสิกรไทย", SecurityCode = "KBANK", Weight = 7.20m, Sector = "ธนาคาร" },
                    new HoldingItem { SecurityName = "บมจ.ไทยเบฟเวอเรจ", SecurityCode = "THBEV", Weight = 6.80m, Sector = "อาหารและเครื่องดื่ม" },
                    new HoldingItem { SecurityName = "ซีพี ออลล์", SecurityCode = "CPALL", Weight = 6.50m, Sector = "พาณิชย์" },
                    new HoldingItem { SecurityName = "แอดวานซ์ อินโฟร์ เซอร์วิส", SecurityCode = "ADVANC", Weight = 5.90m, Sector = "โทรคมนาคม" }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting top 5 holdings for fund ID: {FundId}", fundId);
                return new List<HoldingItem>();
            }
        }

        // 🆕 Get Asset Allocation (Mock for now)
        private List<AssetAllocationItem> GetAssetAllocation(int fundId)
        {
            try
            {
                // TODO: Implement real data from FundAssetAllocation table when available
                // For now, return mock data

                return new List<AssetAllocationItem>
                {
                    new AssetAllocationItem
                    {
                        AssetType = "หุ้นไทย",
                        AssetTypeEn = "Thai Equity",
                        Percentage = 65.0m,
                        Color = "#1CA59B"
                    },
                    new AssetAllocationItem
                    {
                        AssetType = "พันธบัตรรัฐบาล",
                        AssetTypeEn = "Government Bonds",
                        Percentage = 20.0m,
                        Color = "#4CAF50"
                    },
                    new AssetAllocationItem
                    {
                        AssetType = "เงินฝาก",
                        AssetTypeEn = "Cash & Deposits",
                        Percentage = 10.0m,
                        Color = "#2196F3"
                    },
                    new AssetAllocationItem
                    {
                        AssetType = "ตราสารหนี้เอกชน",
                        AssetTypeEn = "Corporate Bonds",
                        Percentage = 5.0m,
                        Color = "#FF9800"
                    }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting asset allocation for fund ID: {FundId}", fundId);
                return new List<AssetAllocationItem>();
            }
        }

        private List<FundCardViewModel> GetRelatedFunds(Fund fund)
        {
            try
            {
                var relatedFunds = _repo.Fetch<Fund>()
                    .Include<AMC>()
                    .Include<FundClass>()
                    .Include<FundPerformance>()
                    .Include<FundInvestmentInfo>()
                    .Where($"Id != {fund.Id} AND IsActive = 1 AND AMCId = {fund.AMCId}")
                    .OrderBy("ProjAbbrName")
                    .Take(4)
                    .ToList();

                return relatedFunds.Select(f => MapToFundCardViewModel(f)).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting related funds for fund ID: {FundId}", fund.Id);
                return new List<FundCardViewModel>();
            }
        }

        private List<NewsCardViewModel> GetRelatedNews(int fundId)
        {
            try
            {
                // Mock data - ในการใช้งานจริงดึงจาก Article table
                return new List<NewsCardViewModel>
                {
                    new NewsCardViewModel
                    {
                        ArticleId = 1,
                        Title = "แนวโน้มตลาดหุ้นไทยในไตรมาสที่ 4",
                        Excerpt = "วิเคราะห์ปัจจัยสำคัญที่ส่งผลต่อตลาดหุ้นไทยในช่วงปลายปี พร้อมแนะนำกลยุทธ์การลงทุน",
                        Slug = "thai-stock-market-q4-outlook",
                        FeaturedImageUrl = "/images/news/market-outlook.jpg",
                        PublishedDate = DateTime.Now.AddDays(-5),
                        CategoryName = "ตลาดหุ้น",
                        ReadingTime = 5
                    },
                    new NewsCardViewModel
                    {
                        ArticleId = 2,
                        Title = "เคล็ดลับการเลือกกองทุนรวมที่เหมาะสมกับคุณ",
                        Excerpt = "รู้จักประเภทกองทุนรวมและวิธีเลือกกองทุนที่เหมาะกับเป้าหมายการลงทุนและความเสี่ยงที่รับได้",
                        Slug = "how-to-choose-mutual-funds",
                        FeaturedImageUrl = "/images/news/fund-selection.jpg",
                        PublishedDate = DateTime.Now.AddDays(-10),
                        CategoryName = "คู่มือการลงทุน",
                        ReadingTime = 7
                    },
                    new NewsCardViewModel
                    {
                        ArticleId = 3,
                        Title = "ภาพรวมเศรษฐกิจไทย 2024: โอกาสและความท้าทาย",
                        Excerpt = "สรุปสถานการณ์เศรษฐกิจไทยและปัจจัยที่นักลงทุนควรติดตาม",
                        Slug = "thai-economy-2024-overview",
                        FeaturedImageUrl = "/images/news/economy.jpg",
                        CategoryName = "เศรษฐกิจ",
                        ReadingTime = 6
                    }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting related news for fund ID: {FundId}", fundId);
                return new List<NewsCardViewModel>();
            }
        }

        private List<ChartDataPoint> GetNAVChartData(int fundId, int days)
        {
            try
            {
                var startDate = DateTime.Now.AddDays(-days);

                var navData = _repo.Fetch<FundNAV>()
                    .Where($"FundClassId IN (SELECT Id FROM FundClass WHERE FundId = {fundId}) AND NAVDate >= @StartDate",
                        new { StartDate = startDate })
                    .OrderBy("NAVDate")
                    .ToList();

                if (navData.Any())
                {
                    return navData.Select(n => new ChartDataPoint
                    {
                        Date = n.NAVDate,
                        Value = n.NAV
                    }).ToList();
                }

                // Generate mock data if no real data
                return GenerateMockNAVData(days);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting NAV chart data for fund ID: {FundId}", fundId);
                return GenerateMockNAVData(days);
            }
        }

        #endregion

        #region Mock Data Generators

        private List<DividendHistoryItem> GenerateMockDividendHistory()
        {
            var random = new Random();
            return Enumerable.Range(0, 5).Select(i => new DividendHistoryItem
            {
                ExDividendDate = DateTime.Now.AddMonths(-(i * 3)),
                DividendPerUnit = (decimal)(0.15 + random.NextDouble() * 0.15) // 0.15 - 0.30
            }).ToList();
        }

        private List<ChartDataPoint> GenerateMockNAVData(int days)
        {
            var random = new Random();
            var baseNAV = 10.0m + (decimal)(random.NextDouble() * 5); // 10-15 baht
            var data = new List<ChartDataPoint>();

            for (int i = days; i >= 0; i--)
            {
                var change = (decimal)((random.NextDouble() - 0.5) * 0.2); // -0.1 to +0.1
                baseNAV += change;

                data.Add(new ChartDataPoint
                {
                    Date = DateTime.Now.AddDays(-i),
                    Value = Math.Round(baseNAV, 4)
                });
            }

            return data;
        }

        #endregion

        #region Helper Methods

        private string DetermineFundType(string? policyDesc)
        {
            if (string.IsNullOrEmpty(policyDesc)) return "mixed";

            policyDesc = policyDesc.ToLower();
            if (policyDesc.Contains("หุ้น")) return "equity";
            if (policyDesc.Contains("ตราสารหนี้")) return "fixed";
            return "mixed";
        }

        private string GetFundTypeDisplay(string fundType)
        {
            return fundType switch
            {
                "equity" => "กองทุนหุ้น",
                "fixed" => "กองทุนตราสารหนี้",
                "mixed" => "กองทุนผสม",
                _ => "กองทุนรวม"
            };
        }

        private string GetAMCInitials(string? amcName)
        {
            if (string.IsNullOrEmpty(amcName)) return "??";

            var words = amcName.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
            if (words.Length >= 2)
                return $"{words[0][0]}{words[1][0]}".ToUpper();

            return amcName.Length >= 2
                ? amcName.Substring(0, 2).ToUpper()
                : amcName.ToUpper();
        }

        private int ParseRiskLevel(string? riskSpectrum)
        {
            if (string.IsNullOrEmpty(riskSpectrum)) return 3;

            var match = System.Text.RegularExpressions.Regex.Match(riskSpectrum, @"\d+");
            if (match.Success && int.TryParse(match.Value, out int level))
                return Math.Min(5, Math.Max(1, level));

            return 3;
        }

        private string GetRiskLevelDesc(int level)
        {
            return level switch
            {
                1 => "ต่ำมาก",
                2 => "ต่ำ",
                3 => "ปานกลาง",
                4 => "สูง",
                5 => "สูงมาก",
                _ => "ปานกลาง"
            };
        }

        private string FormatFee(FundFee? fee)
        {
            if (fee == null) return "ไม่มี";

            if (!string.IsNullOrEmpty(fee.Rate))
                return $"{fee.Rate}{fee.RateUnit ?? "%"}";

            return "ไม่มี";
        }

        #endregion

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _repo?.Dispose();
            }
            base.Dispose(disposing);
        }
    }

    // ViewModel for Fund List
 
}