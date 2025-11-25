using LBDUSite.Models;
using LBDUSite.Repository.Interfaces;
using LBDUSite.Controllers;
using LBDUSite.Services;
using LBDUSite.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace LBDUSite.Controllers
{
    public class HomeController : BaseController
    {
        private readonly IRepositoryFactory _repo;
        private readonly ICacheService _cache;
        private readonly ILogger<HomeController> _logger;
        private readonly IConfiguration _configuration;

        public HomeController(
            IRepositoryFactory repo,
            ICacheService cache,
            ILogger<HomeController> logger,
            IConfiguration configuration)
        {
            _repo = repo ?? throw new ArgumentNullException(nameof(repo));
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }

        // GET: /
        // GET: /Home
        // GET: /Home/Index
        public IActionResult Index()
        {
            try
            {
                _logger.LogInformation("Loading home page");

                HomePageViewModel? viewModel = new HomePageViewModel
                {
                    Stats = GetStats(),
                    Categories = GetCategories(),
                    FeaturedFunds = GetFeaturedFunds(),
                    PopularFunds = GetPopularFunds(),
                    RecentNews = GetRecentNews()
                };

                return View(viewModel);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading home page");
                return InternalServerError("เกิดข้อผิดพลาดในการโหลดหน้าแรก");
            }
        }

        // GET: /Home/RefreshCache
        public IActionResult RefreshCache()
        {
            // Clear specific cache
            _cache.Clear();

            // Redirect to reload with fresh data
            return RedirectToAction("Index");
        }


        // GET: /Home/About
        public IActionResult About()
        {
            ViewBag.Title = "เกี่ยวกับเรา";
            return View();
        }

        // GET: /Home/Contact
        public IActionResult Contact()
        {
            ViewBag.Title = "ติดต่อเรา";
            return View();
        }

        // GET: /Home/Privacy
        public IActionResult Privacy()
        {
            ViewBag.Title = "นโยบายความเป็นส่วนตัว";
            return View();
        }

        // GET: /Home/Error
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View();
        }

        #region Private Methods

        private StatsViewModel GetStats()
        {
            try
            {
                // Count active funds
                var totalFunds = _repo.Fetch<Fund>()
                    .Where(new { IsActive = true })
                    .Count();

                // Count active AMCs
                var totalAMC = _repo.Fetch<AMC>()
                    .Where(new { IsActive = true })
                    .Count();

                // Count active users (investors)
                var totalInvestors = _repo.Fetch<User>()
                    .Where(new { IsActive = true })
                    .Count();

                // Sum total confirmed transaction amounts
                var totalVolume = _repo.Fetch<Transaction>()
                    .Where(new { Status = "Confirmed" })
                    .Sum<decimal>("Amount");

                return new StatsViewModel
                {
                    TotalFunds = totalFunds,
                    TotalAMC = totalAMC,
                    TotalInvestors = totalInvestors,
                    TotalVolume = FormatVolume(totalVolume)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting stats");
                return new StatsViewModel
                {
                    TotalFunds = 500,
                    TotalAMC = 20,
                    TotalInvestors = 50000,
                    TotalVolume = "10B+"
                };
            }
        }

        private List<CategoryViewModel> GetCategories()
        {
            try
            {
                // Get counts for each fund type category
                var equityCount = _repo.Fetch<Fund>()
                    .Where("PolicyDesc LIKE @Policy AND IsActive = 1", new { Policy = "%หุ้น%" })
                    .Count();

                var mixedCount = _repo.Fetch<Fund>()
                    .Where("PolicyDesc LIKE @Policy AND IsActive = 1", new { Policy = "%ผสม%" })
                    .Count();

                var fixedCount = _repo.Fetch<Fund>()
                    .Where("PolicyDesc LIKE @Policy AND IsActive = 1", new { Policy = "%ตราสารหนี้%" })
                    .Count();

                var propertyCount = _repo.Fetch<Fund>()
                    .Where("PolicyDesc LIKE @Policy AND IsActive = 1", new { Policy = "%อสังหา%" })
                    .Count();

                var foreignCount = _repo.Fetch<Fund>()
                    .Where(new { InvestCountryFlag = 1, IsActive = true })
                    .Count();

                return new List<CategoryViewModel>
                {
                    new CategoryViewModel
                    {
                        CategoryId = 1,
                        CategoryName = "กองทุนหุ้น",
                        IconClass = "fa-chart-line",
                        FundCount = equityCount
                    },
                    new CategoryViewModel
                    {
                        CategoryId = 2,
                        CategoryName = "กองทุนผสม",
                        IconClass = "fa-balance-scale",
                        FundCount = mixedCount
                    },
                    new CategoryViewModel
                    {
                        CategoryId = 3,
                        CategoryName = "กองทุนตราสารหนี้",
                        IconClass = "fa-file-invoice-dollar",
                        FundCount = fixedCount
                    },
                    new CategoryViewModel
                    {
                        CategoryId = 4,
                        CategoryName = "กองทุนรวมอสังหาฯ",
                        IconClass = "fa-building",
                        FundCount = propertyCount
                    },
                    new CategoryViewModel
                    {
                        CategoryId = 5,
                        CategoryName = "กองทุนต่างประเทศ",
                        IconClass = "fa-globe-asia",
                        FundCount = foreignCount
                    }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting categories");
                return new List<CategoryViewModel>();
            }
        }

        private List<FundCardViewModel> GetFeaturedFunds()
        {
            try
            {
                var funds = _repo.Fetch<Fund>()
                    .Include<AMC>()
                    .Include<FundClass>()
                    .Include<FundPerformance>()
                    .Include<FundInvestmentInfo>()
                    .Where(new { IsRecommended = true, IsActive = true })
                    .OrderBy("FundId")
                    .Take(6)
                    .ToList();

                return funds.Select(f => MapToFundCardViewModel(f)).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting featured funds");
                return new List<FundCardViewModel>();
            }
        }

        private List<FundCardViewModel> GetPopularFunds()
        {
            try
            {
                var funds = _repo.Fetch<Fund>()
                    .Include<AMC>()
                    .Include<FundClass>()
                    .Include<FundPerformance>()
                    .Include<FundInvestmentInfo>()
                    .Where(new { IsPopular = true, IsActive = true })
                    .OrderBy("FundId")
                    .Take(6)
                    .ToList();

                return funds.Select(f => MapToFundCardViewModel(f)).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting popular funds");
                return new List<FundCardViewModel>();
            }
        }

        private List<NewsCardViewModel> GetRecentNews()
        {
            try
            {
                var articles = _repo.Fetch<Article>()
                    .Include(a => a.Category)
                    .Where(new { Status = "Published" })
                    .OrderByDescending("PublishedDate")
                    .Take(3)
                    .ToList();

                return articles.Select(a => new NewsCardViewModel
                {
                    ArticleId = a.Id,
                    Title = a.Title,
                    Excerpt = a.Excerpt,
                    Slug = a.Slug,
                    FeaturedImageUrl = a.FeaturedImageUrl,
                    PublishedDate = a.PublishedDate ?? DateTime.Now,
                    CategoryName = a.Category?.CategoryName,
                    ReadingTime = CalculateReadingTime(a.Content)
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent news");
                return new List<NewsCardViewModel>();
            }
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

        #endregion

        #region Helper Methods

        private string FormatVolume(decimal volume)
        {
            if (volume >= 1_000_000_000)
                return $"{volume / 1_000_000_000:F1}B+";
            if (volume >= 1_000_000)
                return $"{volume / 1_000_000:F1}M+";
            return $"{volume / 1_000:F1}K+";
        }

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

        private int CalculateReadingTime(string? content)
        {
            if (string.IsNullOrEmpty(content)) return 1;

            var wordCount = content.Split(new[] { ' ', '\n', '\r', '\t' },
                StringSplitOptions.RemoveEmptyEntries).Length;

            return Math.Max(1, (int)Math.Ceiling(wordCount / 200.0));
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

}