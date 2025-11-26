using LBDUSite.Models;
using LBDUSite.Repository.Interfaces;
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

                var viewModel = new HomePageViewModel
                {
                    Stats = GetStats(),
                    Categories = GetCategories(),
                    FeaturedFunds = GetFeaturedFunds(),
                    PopularFunds = GetPopularFunds(),
                    RecentNews = GetRecentNews(),
                    AMCList = GetAMCList(),
                    EventActivities = GetEventActivities(),
                    LiveVideo = GetLiveVideo()
                };

                return View(viewModel);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading home page");
                return InternalServerError("เกิดข้อผิดพลาดในการโหลดหน้าแรก");
            }
        }

        // GET: /Home/About
        public IActionResult About()
        {
            ViewBag.Title = "เกี่ยวกับเรา";
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
                var totalFunds = _repo.Fetch<Fund>()
                    .Where(new { IsActive = true })
                    .Count();

                var totalAMC = _repo.Fetch<AMC>()
                    .Where(new { IsActive = true })
                    .Count();

                return new StatsViewModel
                {
                    TotalFunds = totalFunds,
                    TotalAMC = totalAMC,
                    TotalInvestors = 150000, // Mock data
                    TotalVolume = "2.5T" // Mock data
                };
            }
            catch
            {
                return new StatsViewModel
                {
                    TotalFunds = 800,
                    TotalAMC = 25,
                    TotalInvestors = 150000,
                    TotalVolume = "2.5T"
                };
            }
        }

        private List<CategoryViewModel> GetCategories()
        {
            return new List<CategoryViewModel>
            {
                new CategoryViewModel
                {
                    CategoryName = "กองทุนหุ้น",
                    CategoryNameEn = "Equity Fund",
                    FundCount = 250,
                    IconClass = "fa-chart-line",
                    Description = "เหมาะสำหรับผู้ที่ต้องการผลตอบแทนสูง",
                    Color = "#ef4444"
                },
                new CategoryViewModel
                {
                    CategoryName = "กองทุนตราสารหนี้",
                    CategoryNameEn = "Fixed Income",
                    FundCount = 180,
                    IconClass = "fa-file-invoice-dollar",
                    Description = "เหมาะสำหรับผู้ต้องการความมั่นคง",
                    Color = "#3b82f6"
                },
                new CategoryViewModel
                {
                    CategoryName = "กองทุนผสม",
                    CategoryNameEn = "Mixed Fund",
                    FundCount = 150,
                    IconClass = "fa-balance-scale",
                    Description = "สมดุลระหว่างผลตอบแทนและความเสี่ยง",
                    Color = "#8b5cf6"
                },
                new CategoryViewModel
                {
                    CategoryName = "กองทุนตลาดเงิน",
                    CategoryNameEn = "Money Market",
                    FundCount = 80,
                    IconClass = "fa-coins",
                    Description = "เหมาะสำหรับเงินลงทุนระยะสั้น",
                    Color = "#10b981"
                },
                new CategoryViewModel
                {
                    CategoryName = "กองทุนต่างประเทศ",
                    CategoryNameEn = "Foreign Fund",
                    FundCount = 120,
                    IconClass = "fa-globe",
                    Description = "กระจายการลงทุนทั่วโลก",
                    Color = "#f59e0b"
                },
                new CategoryViewModel
                {
                    CategoryName = "กองทุน REIT",
                    CategoryNameEn = "Real Estate",
                    FundCount = 45,
                    IconClass = "fa-building",
                    Description = "ลงทุนในอสังหาริมทรัพย์",
                    Color = "#ec4899"
                }
            };
        }

        private List<FundCardViewModel> GetFeaturedFunds()
        {
            try
            {
                var funds = _repo.Fetch<Fund>()
                    .Include<AMC>()
                    .Include<FundClass>()
                    .Include<FundPerformance>()
                    .Where(new { IsActive = true })
                    .OrderBy("RegisDate DESC")
                    .Take(6)
                    .ToList();

                return funds.Select(f => MapToFundCardViewModel(f)).ToList();
            }
            catch
            {
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
                    .Where(new { IsActive = true })
                    .Take(8)
                    .ToList();

                return funds.Select(f => MapToFundCardViewModel(f)).ToList();
            }
            catch
            {
                return new List<FundCardViewModel>();
            }
        }

        private List<NewsCardViewModel> GetRecentNews()
        {
            // Mock data
            return new List<NewsCardViewModel>
            {
                new NewsCardViewModel
                {
                    FeaturedImageUrl="https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
                    Title = "แนวโน้มตลาดกองทุนปี 2025",
                    Excerpt = "วิเคราะห์ทิศทางการลงทุนในกองทุนรวมสำหรับปี 2025",
                    PublishedDate = DateTime.Now.AddDays(-2),
                    ReadingTime = 5,
                    Category = "Market Insight",
                    Slug = "market-trend-2025"
                },
                new NewsCardViewModel
                {
                    FeaturedImageUrl="https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
                    Title = "5 กองทุนหุ้นไทยน่าสนใจ",
                    Excerpt = "รวมกองทุนหุ้นไทยที่มีศักยภาพสูงในไตรมาสนี้",
                    PublishedDate = DateTime.Now.AddDays(-5),
                    ReadingTime = 7,
                    Category = "Fund Selection",
                    Slug = "top-5-thai-equity"
                },
                new NewsCardViewModel
                {
                    FeaturedImageUrl = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
                    Title = "เทคนิคการกระจายพอร์ต",
                    Excerpt = "วิธีจัดพอร์ตกองทุนให้เหมาะกับความเสี่ยงของคุณ",
                    PublishedDate = DateTime.Now.AddDays(-7),
                    ReadingTime = 6,
                    Category = "Investment Tips",
                    Slug = "portfolio-diversification"
                }
            };
        }

        private List<AMCViewModel> GetAMCList()
        {
            try
            {
                var amcs = _repo.Fetch<AMC>()
                    .Where(new { IsActive = true })
                    .OrderBy("NameTH")
                    .ToList();

                return amcs.Select(amc => new AMCViewModel
                {
                    AMCId = amc.Id,
                    NameTH = amc.NameTH,
                    NameEN = amc.NameEN,
                    ShortName = amc.ShortName,
                    Logo = GetAMCInitials(amc.ShortName ?? amc.NameTH),
                    FundCount = GetAMCFundCount(amc.Id),
                    Website = amc.Website
                }).ToList();
            }
            catch
            {
                // Mock data
                return new List<AMCViewModel>
                {
                    new AMCViewModel { AMCId = 1, NameTH = "บลจ.กสิกรไทย", ShortName = "K-Asset", Logo = "KA", FundCount = 125, Website = "https://kasset.kasikornbank.com" },
                    new AMCViewModel { AMCId = 2, NameTH = "บลจ.ไทยพาณิชย์", ShortName = "SCBAM", Logo = "SC", FundCount = 98, Website = "https://www.scbam.com" },
                    new AMCViewModel { AMCId = 3, NameTH = "บลจ.กรุงไทย", ShortName = "Krungthai", Logo = "KT", FundCount = 87, Website = "https://www.ktam.co.th" },
                    new AMCViewModel { AMCId = 4, NameTH = "บลจ.บัวหลวง", ShortName = "BBL Asset", Logo = "BB", FundCount = 76, Website = "https://www.bblam.co.th" },
                    new AMCViewModel { AMCId = 5, NameTH = "บลจ.กรุงศรี", ShortName = "Krungsri Asset", Logo = "KS", FundCount = 65, Website = "https://www.krungsriasset.com" },
                    new AMCViewModel { AMCId = 6, NameTH = "บลจ.ทหารไทย", ShortName = "TMB Asset", Logo = "TM", FundCount = 54, Website = "https://www.tmbam.com" }
                };
            }
        }

        private List<EventActivityViewModel> GetEventActivities()
        {
            // Mock data
            return new List<EventActivityViewModel>
            {
                new EventActivityViewModel
                {
                    Title = "สัมมนาออนไลน์: การลงทุนกองทุนเพื่อการเกษียณ",
                    Description = "เรียนรู้การวางแผนเกษียณด้วยกองทุน RMF และ SSF",
                    EventDate = DateTime.Now.AddDays(7),
                    EventType = "Webinar",
                    IsOnline = true,
                    IsFree = true,
                    RegistrationUrl = "#",
                    ImageUrl = null
                },
                new EventActivityViewModel
                {
                    Title = "Workshop: เทคนิคการวิเคราะห์กองทุน",
                    Description = "เรียนรู้การอ่านข้อมูลและวิเคราะห์กองทุนเบื้องต้น",
                    EventDate = DateTime.Now.AddDays(14),
                    EventType = "Workshop",
                    IsOnline = false,
                    IsFree = false,
                    Location = "โรงแรม Sofitel Bangkok",
                    Price = 2500,
                    RegistrationUrl = "#",
                    ImageUrl = null
                },
                new EventActivityViewModel
                {
                    Title = "Roadshow: พบผู้จัดการกองทุนชั้นนำ",
                    Description = "พบปะและฟังมุมมองการลงทุนจากผู้จัดการกองทุนโดยตรง",
                    EventDate = DateTime.Now.AddDays(21),
                    EventType = "Roadshow",
                    IsOnline = false,
                    IsFree = true,
                    Location = "ศูนย์การค้า CentralWorld",
                    RegistrationUrl = "#",
                    ImageUrl = null
                }
            };
        }

        private LiveVideoViewModel GetLiveVideo()
        {
            // Mock data - ในระบบจริงดึงจาก YouTube API หรือ Database
            return new LiveVideoViewModel
            {
                VideoId = "BVg4pk7Aabc", // YouTube Video ID
                Title = "LIVE: ลงทุนใน Quantum ง่ายๆ ไม่ต้องเปิดพอร์ตนอก ด้วยกองทุน LHQTUM",
                Description = "พาคุณขึ้นหัวแถวของการลงทุน... เมื่อโลกหมุนสู่ยุค Quantum  กับกองทุน LHQTUM",
                IsLive = true,
                ViewerCount = 1234,
                StartTime = DateTime.Now.AddHours(-1)
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

            return new FundCardViewModel
            {
                FundId = fund.Id,
                FundCode = fund.ProjAbbrName,
                FundName = fund.ProjNameTH,
                FundType = DetermineFundType(fund.PolicyDesc),
                FundTypeDisplay = GetFundTypeDisplay(DetermineFundType(fund.PolicyDesc)),
                AMCName = fund.AMC?.NameTH,
                AMCShortName = fund.AMC?.ShortName,
                AMCLogo = GetAMCInitials(fund.AMC?.ShortName ?? fund.AMC?.NameTH),
                NAV = latestNAV?.NAV ?? 0,
                NAVDate = latestNAV?.NAVDate ?? DateTime.Now,
                YTDReturn = ytdPerformance?.PerformanceValue,
                RiskLevel = ParseRiskLevel(fund.RiskSpectrum)
            };
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
            return amcName.Length >= 2 ? amcName.Substring(0, 2).ToUpper() : amcName.ToUpper();
        }

        private int ParseRiskLevel(string? riskSpectrum)
        {
            if (string.IsNullOrEmpty(riskSpectrum)) return 3;
            var match = System.Text.RegularExpressions.Regex.Match(riskSpectrum, @"\d+");
            if (match.Success && int.TryParse(match.Value, out int level))
                return Math.Min(8, Math.Max(1, level));
            return 3;
        }

        private int GetAMCFundCount(int amcId)
        {
            try
            {
                return _repo.Fetch<Fund>()
                    .Where(new { AMCId = amcId, IsActive = true })
                    .Count();
            }
            catch
            {
                return 0;
            }
        }

        #endregion
    }
}