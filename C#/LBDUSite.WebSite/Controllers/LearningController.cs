using LBDUSite.Models;
using LBDUSite.Repository.Interfaces;
using LBDUSite.Services;
using LBDUSite.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace LBDUSite.Controllers
{
    [Route("Learning")]
    public class LearningController : BaseController
    {
        private readonly IRepositoryFactory _repo;
        private readonly ICacheService _cache;
        private readonly ILogger<LearningController> _logger;
        private readonly IConfiguration _configuration;

        public LearningController(
            IRepositoryFactory repo,
            ICacheService cache,
            ILogger<LearningController> logger,
            IConfiguration configuration)
        {
            _repo = repo ?? throw new ArgumentNullException(nameof(repo));
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }

        // GET: /Learning
        [HttpGet("")]
        [HttpGet("Index")]
        public IActionResult Index()
        {
            try
            {
                var viewModel = new LearningCenterViewModel
                {
                    Tools = GetLearningTools(),
                    Guides = GetGuides(),
                    Calculators = GetCalculators(),
                    Videos = GetVideos(),
                    Articles = GetArticles(),
                    FAQ = GetFAQ()
                };

                ViewBag.Title = "ศูนย์การเรียนรู้";
                return View(viewModel);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading learning center");
                return InternalServerError("เกิดข้อผิดพลาดในการโหลดศูนย์การเรียนรู้");
            }
        }

        // GET: /Learning/OpenAccount
        [HttpGet("OpenAccount")]
        public IActionResult OpenAccount()
        {
            ViewBag.Title = "ขั้นตอนการเปิดบัญชี";
            return View();
        }

        // GET: /Learning/BuyUnits
        [HttpGet("BuyUnits")]
        public IActionResult BuyUnits()
        {
            ViewBag.Title = "ขั้นตอนซื้อหน่วยลงทุน";
            return View();
        }
 

        // GET: /Learning/TaxCalculator
        [HttpGet("TaxCalculator")]
        public IActionResult TaxCalculator()
        {
            ViewBag.Title = "คำนวณภาษีและวางแผนลดหย่อนภาษี";
            return View();
        }

        // GET: /Learning/RetirementPlanner
        [HttpGet("RetirementPlanner")]
        public IActionResult RetirementPlanner()
        {
            ViewBag.Title = "คำนวณแผนเกษียณ";
            return View();
        }

        // GET: /Learning/RiskProfile
        [HttpGet("RiskProfile")]
        public IActionResult RiskProfile()
        {
            ViewBag.Title = "ประเมินความเสี่ยง";
            return View();
        }

        // GET: /Learning/InvestmentGoals
        [HttpGet("InvestmentGoals")]
        public IActionResult InvestmentGoals()
        {
            ViewBag.Title = "วางแผนเป้าหมายการลงทุน";
            return View();
        }

        // GET: /Learning/FundBasics
        [HttpGet("FundBasics")]
        public IActionResult FundBasics()
        {
            ViewBag.Title = "พื้นฐานกองทุนรวม";
            return View();
        }

        #region Private Methods

        private List<LearningToolViewModel> GetLearningTools()
        {
            return new List<LearningToolViewModel>
            {
                // Education (ความรู้พื้นฐาน)
                new LearningToolViewModel
                {
                    Id = 1,
                    Title = "พื้นฐานกองทุนรวม",
                    Description = "เรียนรู้ความรู้พื้นฐานเกี่ยวกับกองทุนรวมตั้งแต่เริ่มต้น",
                    IconClass = "fa-book-open",
                    Color = "#14b8a6",
                    Url = "/Learning/FundBasics",
                    Duration = "20 นาที",
                    Difficulty = "ง่าย",
                    Category = "Education",
                    ImageUrl = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop"
                },
                new LearningToolViewModel
                {
                    Id = 2,
                    Title = "เปิดบัญชีกองทุน",
                    Description = "ขั้นตอนการเปิดบัญชีเพื่อซื้อขายกองทุนรวม",
                    IconClass = "fa-user-plus",
                    Color = "#3b82f6",
                    Url = "/Learning/OpenAccount",
                    Duration = "5 นาที",
                    Difficulty = "ง่าย",
                    Category = "Education",
                    ImageUrl = "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop"
                },
                new LearningToolViewModel
                {
                    Id = 3,
                    Title = "ซื้อหน่วยลงทุน",
                    Description = "วิธีการซื้อหน่วยลงทุนทั้งแบบครั้งเดียวและแบบสะสม",
                    IconClass = "fa-shopping-cart",
                    Color = "#10b981",
                    Url = "/Learning/BuyUnits",
                    Duration = "7 นาที",
                    Difficulty = "ง่าย",
                    Category = "Education",
                    ImageUrl = "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=600&fit=crop"
                },
                new LearningToolViewModel
                {
                    Id = 4,
                    Title = "ทำความเข้าใจ NAV",
                    Description = "เรียนรู้เกี่ยวกับมูลค่าทรัพย์สินสุทธิและการคำนวณ",
                    IconClass = "fa-chart-bar",
                    Color = "#3b82f6",
                    Url = "/Learning/NAVExplained",
                    Duration = "15 นาที",
                    Difficulty = "ง่าย",
                    Category = "Education",
                    ImageUrl = "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=600&fit=crop"
                },
                new LearningToolViewModel
                {
                    Id = 5,
                    Title = "การกระจายความเสี่ยง",
                    Description = "หลักการจัดพอร์ตเพื่อลดความเสี่ยง",
                    IconClass = "fa-project-diagram",
                    Color = "#8b5cf6",
                    Url = "/Learning/Diversification",
                    Duration = "18 นาที",
                    Difficulty = "ปานกลาง",
                    Category = "Education",
                    ImageUrl = "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=800&h=600&fit=crop"
                },
                new LearningToolViewModel
                {
                    Id = 6,
                    Title = "RMF vs SSF vs LTF",
                    Description = "เปรียบเทียบกองทุนลดหย่อนภาษีแต่ละประเภท",
                    IconClass = "fa-file-invoice-dollar",
                    Color = "#f59e0b",
                    Url = "/Learning/TaxFunds",
                    Duration = "15 นาที",
                    Difficulty = "ปานกลาง",
                    Category = "Education",
                    ImageUrl = "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&h=600&fit=crop"
                },
        
                // Tools (เครื่องมือและเครื่องคำนวณ)
                new LearningToolViewModel
                {
                    Id = 7,
                    Title = "แบบจำลองพอร์ต",
                    Description = "ทดลองสร้างพอร์ตการลงทุนและดูผลตอบแทนย้อนหลัง",
                    IconClass = "fa-chart-pie",
                    Color = "#8b5cf6",
                    Url = "/Learning/PortfolioSimulator",
                    Duration = "15 นาที",
                    Difficulty = "ปานกลาง",
                    Category = "Tools",
                    IsFeatured = true,
                    ImageUrl = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop"
                },
                new LearningToolViewModel
                {
                    Id = 8,
                    Title = "คำนวณภาษี",
                    Description = "คำนวณภาษีและวางแผนลดหย่อนภาษีด้วย RMF/SSF/LTF",
                    IconClass = "fa-calculator",
                    Color = "#f59e0b",
                    Url = "/Learning/TaxCalculator",
                    Duration = "10 นาที",
                    Difficulty = "ปานกลาง",
                    Category = "Tools",
                    IsFeatured = true,
                    ImageUrl = "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&h=600&fit=crop"
                },
                new LearningToolViewModel
                {
                    Id = 9,
                    Title = "วางแผนเกษียณ",
                    Description = "คำนวณเงินที่ต้องเก็บเพื่อเกษียณอย่างสบาย",
                    IconClass = "fa-umbrella-beach",
                    Color = "#ec4899",
                    Url = "/Learning/RetirementPlanner",
                    Duration = "12 นาที",
                    Difficulty = "ปานกลาง",
                    Category = "Tools",
                    IsFeatured = true,
                    ImageUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop"
                },
                new LearningToolViewModel
                {
                    Id = 10,
                    Title = "ประเมินความเสี่ยง",
                    Description = "ทำแบบทดสอบเพื่อหาระดับความเสี่ยงที่เหมาะกับคุณ",
                    IconClass = "fa-clipboard-list",
                    Color = "#ef4444",
                    Url = "/Learning/RiskProfile",
                    Duration = "8 นาที",
                    Difficulty = "ง่าย",
                    Category = "Tools",
                    ImageUrl = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop"
                },
                new LearningToolViewModel
                {
                    Id = 11,
                    Title = "วางเป้าหมายการลงทุน",
                    Description = "ตั้งเป้าหมายและวางแผนการลงทุนให้บรรลุเป้าหมาย",
                    IconClass = "fa-bullseye",
                    Color = "#06b6d4",
                    Url = "/Learning/InvestmentGoals",
                    Duration = "10 นาที",
                    Difficulty = "ปานกลาง",
                    Category = "Tools",
                    ImageUrl = "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=600&fit=crop"
                },
                new LearningToolViewModel
                {
                    Id = 12,
                    Title = "เปรียบเทียบกองทุน",
                    Description = "เครื่องมือเปรียบเทียบกองทุนแบบละเอียด",
                    IconClass = "fa-balance-scale",
                    Color = "#1ca59b",
                    Url = "/Compare",
                    Duration = "5 นาที",
                    Difficulty = "ง่าย",
                    Category = "Tools",
                    ImageUrl = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop"
                },
                new LearningToolViewModel
                {
                    Id = 13,
                    Title = "คำนวณผลตอบแทน",
                    Description = "คำนวณผลตอบแทนจากการลงทุนแบบต่างๆ",
                    IconClass = "fa-coins",
                    Color = "#14b8a6",
                    Url = "/Learning/ReturnCalculator",
                    Duration = "8 นาที",
                    Difficulty = "ง่าย",
                    Category = "Tools",
                    ImageUrl = "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop"
                },
                new LearningToolViewModel
                {
                    Id = 14,
                    Title = "คำนวณ DCA",
                    Description = "คำนวณการลงทุนแบบ Dollar Cost Averaging",
                    IconClass = "fa-chart-line",
                    Color = "#8b5cf6",
                    Url = "/Learning/DCACalculator",
                    Duration = "10 นาที",
                    Difficulty = "ปานกลาง",
                    Category = "Tools",
                    ImageUrl = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop"
                },
                new LearningToolViewModel
                {
                    Id = 15,
                    Title = "วิเคราะห์ค่าธรรมเนียม",
                    Description = "ทำความเข้าใจและคำนวณค่าธรรมเนียมต่างๆ",
                    IconClass = "fa-receipt",
                    Color = "#f59e0b",
                    Url = "/Learning/FeeCalculator",
                    Duration = "10 นาที",
                    Difficulty = "ปานกลาง",
                    Category = "Tools",
                    ImageUrl = "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?w=800&h=600&fit=crop"
                }
            };
        }

        private List<GuideViewModel> GetGuides()
        {
            return new List<GuideViewModel>
            {
                new GuideViewModel
                {
                    Title = "คู่มือเริ่มต้นลงทุนกองทุน",
                    Description = "ทุกสิ่งที่ต้องรู้สำหรับมือใหม่",
                    Steps = 5,
                    ReadingTime = 15,
                    Difficulty = "ง่าย"
                },
                new GuideViewModel
                {
                    Title = "เทคนิคการเลือกกองทุน",
                    Description = "วิธีวิเคราะห์และเลือกกองทุนที่เหมาะกับคุณ",
                    Steps = 7,
                    ReadingTime = 20,
                    Difficulty = "ปานกลาง"
                },
                new GuideViewModel
                {
                    Title = "การกระจายความเสี่ยง",
                    Description = "หลักการจัดพอร์ตเพื่อลดความเสี่ยง",
                    Steps = 6,
                    ReadingTime = 18,
                    Difficulty = "ปานกลาง"
                }
            };
        }

        private List<CalculatorViewModel> GetCalculators()
        {
            return new List<CalculatorViewModel>
            {
                new CalculatorViewModel
                {
                    Name = "คำนวณผลตอบแทน",
                    Description = "คำนวณผลตอบแทนจากการลงทุน",
                    Icon = "fa-coins"
                },
                new CalculatorViewModel
                {
                    Name = "คำนวณ DCA",
                    Description = "ลงทุนแบบสะสมเป็นระยะๆ",
                    Icon = "fa-chart-line"
                },
                new CalculatorViewModel
                {
                    Name = "คำนวณค่าธรรมเนียม",
                    Description = "คำนวณค่าใช้จ่ายทั้งหมด",
                    Icon = "fa-receipt"
                }
            };
        }

        private List<VideoViewModel> GetVideos()
        {
            return new List<VideoViewModel>
            {
                new VideoViewModel
                {
                    Title = "กองทุนรวมคืออะไร?",
                    Duration = "5:30",
                    Views = 12500,
                    ThumbnailUrl = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop",
                    VideoUrl = "#"
                },
                new VideoViewModel
                {
                    Title = "วิธีอ่านข้อมูลกองทุน",
                    Duration = "8:45",
                    Views = 9800,
                    ThumbnailUrl = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
                    VideoUrl = "#"
                },
                new VideoViewModel
                {
                    Title = "เทคนิคการจัดพอร์ต",
                    Duration = "12:20",
                    Views = 15600,
                    ThumbnailUrl = "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=800&h=600&fit=crop",
                    VideoUrl = "#"
                },
                new VideoViewModel
                {
                    Title = "ทำความเข้าใจ RMF และ SSF",
                    Duration = "10:15",
                    Views = 11200,
                    ThumbnailUrl = "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&h=600&fit=crop",
                    VideoUrl = "#"
                },
                new VideoViewModel
                {
                    Title = "การวิเคราะห์ความเสี่ยง",
                    Duration = "7:50",
                    Views = 8900,
                    ThumbnailUrl = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
                    VideoUrl = "#"
                },
                new VideoViewModel
                {
                    Title = "เริ่มต้นลงทุนด้วย 1,000 บาท",
                    Duration = "6:30",
                    Views = 14300,
                    ThumbnailUrl = "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop",
                    VideoUrl = "#"
                }
            };
        }

        private List<ArticleViewModel> GetArticles()
        {
            return new List<ArticleViewModel>
            {
                new ArticleViewModel
                {
                    Title = "5 ข้อผิดพลาดที่มือใหม่มักทำ",
                    ReadingTime = 5,
                    Category = "Tips"
                },
                new ArticleViewModel
                {
                    Title = "RMF vs SSF เลือกอย่างไรดี",
                    ReadingTime = 7,
                    Category = "Tax Planning"
                },
                new ArticleViewModel
                {
                    Title = "กองทุนหุ้นไทย vs ต่างประเทศ",
                    ReadingTime = 6,
                    Category = "Analysis"
                }
            };
        }

        private List<FAQViewModel> GetFAQ()
        {
            return new List<FAQViewModel>
            {
                new FAQViewModel
                {
                    Question = "ต้องมีเงินเท่าไหร่ถึงจะเริ่มลงทุนได้?",
                    Answer = "เริ่มลงทุนได้ตั้งแต่ 1,000 บาท ขึ้นอยู่กับแต่ละกองทุน บางกองทุนเริ่มต้นที่ 500 บาทก็มี และสามารถลงทุนแบบสะสมรายเดือนได้ด้วย",
                    Category = "Getting Started"
                },
                new FAQViewModel
                {
                    Question = "กองทุนรวมกับหุ้นต่างกันอย่างไร?",
                    Answer = "กองทุนรวมคือการรวมเงินจากนักลงทุนหลายคนไปลงทุนในหลายสินทรัพย์ มีผู้จัดการกองทุนคอยดูแลและตัดสินใจลงทุน ส่วนหุ้นคือการลงทุนในบริษัทเดียวโดยตรง",
                    Category = "Basics"
                },
                new FAQViewModel
                {
                    Question = "ขายคืนหน่วยลงทุนได้เมื่อไหร่?",
                    Answer = "ส่วนใหญ่สามารถขายคืนได้ทุกวันทำการ และจะได้รับเงินภายใน 3-5 วันทำการ แต่บางกองทุนอาจมีระยะเวลาห้ามขาย (lock-up period) หรือค่าธรรมเนียมขายคืนก่อนกำหนด",
                    Category = "Redemption"
                },
                new FAQViewModel
                {
                    Question = "RMF กับ SSF ต่างกันอย่างไร?",
                    Answer = "RMF (Retirement Mutual Fund) เป็นกองทุนเพื่อการเกษียณ ถอนได้เมื่ออายุครบ 55 ปี ขึ้นไป ส่วน SSF (Super Savings Fund) มีความยืดหยุ่นกว่า ถอนได้เมื่อถือครบ 10 ปี ทั้งสองกองทุนสามารถลดหย่อนภาษีได้",
                    Category = "Tax"
                },
                new FAQViewModel
                {
                    Question = "ค่าธรรมเนียมกองทุนมีอะไรบ้าง?",
                    Answer = "ค่าธรรมเนียมหลักๆ ได้แก่ ค่าธรรมเนียมการขาย (Front-end Fee), ค่าธรรมเนียมการจัดการ (Management Fee), ค่าธรรมเนียมการรับซื้อคืน (Back-end Fee) และค่าธรรมเนียมการโอนหน่วยลงทุน",
                    Category = "Fees"
                },
                new FAQViewModel
                {
                    Question = "ควรลงทุนกองทุนหุ้นหรือตราสารหนี้?",
                    Answer = "ขึ้นอยู่กับความเสี่ยงที่รับได้และระยะเวลาลงทุน หากลงทุนระยะยาว (5 ปีขึ้นไป) และรับความเสี่ยงได้ ควรเลือกกองทุนหุ้น แต่ถ้าต้องการความมั่นคงและลงทุนระยะสั้น ควรเลือกกองทุนตราสารหนี้",
                    Category = "Investment"
                },
                new FAQViewModel
                {
                    Question = "NAV คืออะไร?",
                    Answer = "NAV (Net Asset Value) คือมูลค่าทรัพย์สินสุทธิต่อหน่วย เป็นราคาที่ใช้ในการซื้อขายหน่วยลงทุน คำนวณจากมูลค่าทรัพย์สินทั้งหมดของกองทุน หักด้วยหนี้สิน แล้วหารด้วยจำนวนหน่วยลงทุนทั้งหมด",
                    Category = "Basics"
                },
                new FAQViewModel
                {
                    Question = "Dividend Policy คืออะไร?",
                    Answer = "นโยบายการจ่ายเงินปันผลของกองทุน มี 2 แบบ คือ แบบจ่ายปันผล (กองทุนจ่ายผลตอบแทนเป็นเงินสดให้ผู้ถือหน่วย) และแบบไม่จ่ายปันผล (นำผลตอบแทนกลับไปลงทุนต่อในกองทุน)",
                    Category = "Basics"
                }
            };
        }

        // GET: /Learning/PortfolioSimulator
        public IActionResult PortfolioSimulator()
        {
            var model = new PortfolioSimulatorViewModel
            {
                InvestmentAmount = 100000,
                TimeHorizon = 10,
                SelectedRisk = "balanced",
                RiskProfiles = GetRiskProfiles(),
                FundDatabase = GetFundDatabase()
            };

            return View(model);
        }

        private Dictionary<string, RiskProfileModel> GetRiskProfiles()
        {
            return new Dictionary<string, RiskProfileModel>
            {
                ["conservative"] = new RiskProfileModel
                {
                    Name = "Conservative Portfolio",
                    Badge = "conservative",
                    Icon = "🛡️",
                    Description = "อนุรักษ์นิยม - รักษาเงินต้น ความเสี่ยงต่ำ",
                    Allocation = new AssetAllocation { Equity = 20, Mixed = 20, Fixed = 40, Money = 20 },
                    ExpectedReturn = 6.5m,
                    Volatility = 6
                },
                ["moderate"] = new RiskProfileModel
                {
                    Name = "Moderate Portfolio",
                    Badge = "moderate",
                    Icon = "⚖️",
                    Description = "ปานกลาง - สมดุลระหว่างความเสี่ยงและผลตอบแทน",
                    Allocation = new AssetAllocation { Equity = 30, Mixed = 30, Fixed = 30, Money = 10 },
                    ExpectedReturn = 7.5m,
                    Volatility = 9
                },
                ["balanced"] = new RiskProfileModel
                {
                    Name = "Balanced Portfolio",
                    Badge = "balanced",
                    Icon = "📊",
                    Description = "สมดุล - เหมาะกับนักลงทุนทั่วไป",
                    Allocation = new AssetAllocation { Equity = 40, Mixed = 30, Fixed = 20, Money = 10 },
                    ExpectedReturn = 8.5m,
                    Volatility = 12
                },
                ["aggressive"] = new RiskProfileModel
                {
                    Name = "Aggressive Portfolio",
                    Badge = "aggressive",
                    Icon = "🚀",
                    Description = "ก้าวร้าว - ผลตอบแทนสูง ยอมรับความเสี่ยง",
                    Allocation = new AssetAllocation { Equity = 60, Mixed = 25, Fixed = 10, Money = 5 },
                    ExpectedReturn = 10.5m,
                    Volatility = 18
                },
                ["very-aggressive"] = new RiskProfileModel
                {
                    Name = "Very Aggressive Portfolio",
                    Badge = "very-aggressive",
                    Icon = "⚡",
                    Description = "ก้าวร้าวมาก - เน้นผลตอบแทนสูงสุด",
                    Allocation = new AssetAllocation { Equity = 80, Mixed = 15, Fixed = 5, Money = 0 },
                    ExpectedReturn = 12.5m,
                    Volatility = 24
                }
            };
        }

        private Dictionary<string, List<FundModel>> GetFundDatabase()
        {
            return new Dictionary<string, List<FundModel>>
            {
                ["equity"] = new List<FundModel>
        {
            new FundModel { Code = "SCBEQUITY", Name = "SCB Equity Fund", Return = 15, Risk = "High", AUM = "12,500", Score = 95 },
            new FundModel { Code = "KFEQUITY", Name = "K-EQUITY", Return = 14, Risk = "High", AUM = "8,200", Score = 92 },
            new FundModel { Code = "TMBGLOBAL", Name = "TMB Global Equity", Return = 16, Risk = "Very High", AUM = "5,600", Score = 88 },
            new FundModel { Code = "PRINCIPAL-EQ", Name = "PRINCIPAL Equity", Return = 13.5m, Risk = "High", AUM = "7,800", Score = 85 }
        },
                ["mixed"] = new List<FundModel>
        {
            new FundModel { Code = "KFRMF", Name = "K-RMF Balanced", Return = 12, Risk = "Medium", AUM = "15,300", Score = 93 },
            new FundModel { Code = "SCBBALANCED", Name = "SCB Balanced Fund", Return = 11, Risk = "Medium", AUM = "9,800", Score = 90 },
            new FundModel { Code = "TMBMIXED", Name = "TMB Mixed Fund", Return = 10, Risk = "Medium", AUM = "7,400", Score = 86 }
        },
                ["fixed"] = new List<FundModel>
        {
            new FundModel { Code = "TMBFIX", Name = "TMB Fixed Income", Return = 8, Risk = "Low", AUM = "18,500", Score = 94 },
            new FundModel { Code = "SCBBOND", Name = "SCB Bond Fund", Return = 7.5m, Risk = "Low", AUM = "22,100", Score = 96 },
            new FundModel { Code = "KFBOND", Name = "K-BOND", Return = 7, Risk = "Very Low", AUM = "14,200", Score = 91 }
        },
                ["money"] = new List<FundModel>
        {
            new FundModel { Code = "KFMONEY", Name = "K-Money Market", Return = 5, Risk = "Very Low", AUM = "35,600", Score = 97 },
            new FundModel { Code = "SCBCASH", Name = "SCB Cash Management", Return = 4.5m, Risk = "Very Low", AUM = "28,900", Score = 95 }
        }
            };
        }

        #endregion
    }
}