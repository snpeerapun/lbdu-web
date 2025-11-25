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
            // Implementation from existing code
            return new StatsViewModel
            {
                TotalFunds = 100,
                TotalAMC = 20,
                TotalInvestors = 10000,
                TotalVolume = "10B+"
            };
        }

        private List<CategoryViewModel> GetCategories()
        {
            // Implementation from existing code
            return new List<CategoryViewModel>();
        }

        private List<FundCardViewModel> GetFeaturedFunds()
        {
            // Implementation from existing code
            return new List<FundCardViewModel>();
        }

        private List<FundCardViewModel> GetPopularFunds()
        {
            // Implementation from existing code
            return new List<FundCardViewModel>();
        }

        private List<NewsCardViewModel> GetRecentNews()
        {
            // Implementation from existing code
            return new List<NewsCardViewModel>();
        }

        #endregion
    }
}