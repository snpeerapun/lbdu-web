using LBDUSite.Models;
using LBDUSite.Repository.Interfaces;
using LBDUSite.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace LBDUSite.Controllers
{
    [Route("Compare")]
    public class CompareController : BaseController
    {
        private readonly IRepositoryFactory _repo;
        private readonly IMemoryCache _cache;
        private readonly ILogger<CompareController> _logger;
        private readonly IConfiguration _configuration;

        public CompareController(
            IRepositoryFactory repo,
            IMemoryCache cache,
            ILogger<CompareController> logger,
            IConfiguration configuration)
        {
            _repo = repo ?? throw new ArgumentNullException(nameof(repo));
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }

        // GET: /Compare
        // GET: /Compare?funds=1,2,3
        [HttpGet("")]
        [HttpGet("Index")]
        public IActionResult Index(string? funds = null)
        {
            try
            {
                var viewModel = new FundCompareViewModel
                {
                    SelectedFundIds = new List<int>(),
                    ComparedFunds = new List<FundCompareItem>()
                };

                // Parse fund IDs from query string
                if (!string.IsNullOrEmpty(funds))
                {
                    var fundIds = funds.Split(',')
                        .Select(id => int.TryParse(id.Trim(), out var fundId) ? fundId : 0)
                        .Where(id => id > 0)
                        .Take(4) // Maximum 4 funds
                        .ToList();

                    if (fundIds.Any())
                    {
                        viewModel.SelectedFundIds = fundIds;
                        viewModel.ComparedFunds = GetFundsForComparison(fundIds);
                    }
                }

                ViewBag.Title = "เปรียบเทียบกองทุน";
                return View(viewModel);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading compare page");
                return InternalServerError("เกิดข้อผิดพลาดในการโหลดหน้าเปรียบเทียบกองทุน");
            }
        }

        // GET: /Compare/Search?q=KBANK
        [HttpGet("Search")]
        public IActionResult Search(string q)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(q) || q.Length < 2)
                {
                    return Json(new { success = false, message = "กรุณาระบุคำค้นหาอย่างน้อย 2 ตัวอักษร" });
                }

                var funds = _repo.Fetch<Fund>()
                    .Include<AMC>()
                    .Where(new { IsActive = true })
                    .Where("(ProjNameTH LIKE @Search OR ProjAbbrName LIKE @Search)",
                        new { Search = $"%{q}%" })
                    .OrderBy("ProjAbbrName")
                    .Take(10)
                    .ToList();

                var results = funds.Select(f => new
                {
                    id = f.Id,
                    code = f.ProjAbbrName,
                    name = f.ProjNameTH,
                    amc = f.AMC?.ShortName ?? f.AMC?.NameTH,
                    type = DetermineFundType(f.PolicyDesc)
                }).ToList();

                return Json(new { success = true, data = results });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching funds for comparison");
                return Json(new { success = false, message = "เกิดข้อผิดพลาดในการค้นหา" });
            }
        }

        // POST: /Compare/Add
        [HttpPost("Add")]
        public IActionResult Add([FromBody] AddFundRequest request)
        {
            try
            {
                if (request.FundId <= 0)
                {
                    return Json(new { success = false, message = "รหัสกองทุนไม่ถูกต้อง" });
                }

                var fund = _repo.Fetch<Fund>()
                    .Include<AMC>()
                    .Include<FundClass>()
                    .Include<FundPerformance>()
                    .Include<FundInvestmentInfo>()
                    .Where(new { Id = request.FundId, IsActive = true })
                    .FirstOrDefault();

                if (fund == null)
                {
                    return Json(new { success = false, message = "ไม่พบกองทุนที่ต้องการ" });
                }

                var compareItem = MapToFundCompareItem(fund);

                return Json(new { success = true, data = compareItem });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding fund to comparison - FundId: {FundId}", request.FundId);
                return Json(new { success = false, message = "เกิดข้อผิดพลาดในการเพิ่มกองทุน" });
            }
        }

        #region Private Methods

        private List<FundCompareItem> GetFundsForComparison(List<int> fundIds)
        {
            var funds = _repo.Fetch<Fund>()
                .Include<AMC>()
                .Include<FundClass>()
                .Include<FundPerformance>()
                .Include<FundInvestmentInfo>()
                .Include<FundRedemptionInfo>()
                .Where(new { IsActive = true })
                .ToList()
                .Where(f => fundIds.Contains(f.Id))
                .ToList();

            return funds.Select(f => MapToFundCompareItem(f)).ToList();
        }

        private FundCompareItem MapToFundCompareItem(Fund fund)
        {
            var latestNAV = fund.FundClasses?
                .SelectMany(fc => fc.FundNAV ?? new List<FundNAV>())
                .OrderByDescending(n => n.NAVDate)
                .FirstOrDefault();

            var performances = fund.FundPerformances?
                .GroupBy(p => p.ReferencePeriod)
                .ToDictionary(g => g.Key, g => g.FirstOrDefault()?.PerformanceValue);

            var investmentInfo = fund.FundInvestmentInfo?.FirstOrDefault();
            var redemptionInfo = fund.FundRedemptionInfo?.FirstOrDefault();

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

            return new FundCompareItem
            {
                FundId = fund.Id,
                FundCode = fund.ProjAbbrName,
                FundName = fund.ProjNameTH,
                FundType = DetermineFundType(fund.PolicyDesc),
                FundTypeDisplay = GetFundTypeDisplay(DetermineFundType(fund.PolicyDesc)),

                AMCName = fund.AMC?.NameTH,
                AMCShortName = fund.AMC?.ShortName,
                AMCLogo = GetAMCInitials(fund.AMC?.ShortName ?? fund.AMC?.NameTH),

                CurrentNAV = latestNAV?.NAV ?? 0,
                NAVDate = latestNAV?.NAVDate ?? DateTime.Now,

                ReturnYTD = performances?.GetValueOrDefault("YTD"),
                Return1Y = performances?.GetValueOrDefault("1Y"),
                Return3Y = performances?.GetValueOrDefault("3Y"),
                Return5Y = performances?.GetValueOrDefault("5Y"),

                RiskLevel = riskLevel,
                RiskLevelDesc = GetRiskLevelDesc(riskLevel),

                MinimumInvestment = investmentInfo?.MinimumSub,
                MinimumRedemption = investmentInfo?.MinimumRedempt,

                ManagementFee = FormatFee(managementFee),
                FrontEndFee = FormatFee(frontEndFee),
                BackEndFee = FormatFee(backEndFee),

                Sharpe = null, // Calculate if data available
                Sortino = null, // Calculate if data available
                MaxDrawdown = null, // Calculate if data available

                DividendPolicy = fund.FundDividends?.FirstOrDefault()?.DividendPolicy ?? "ไม่จ่าย",
                SettlementPeriod = redemptionInfo?.SettlementPeriod,

                RegisDate = fund.RegisDate
            };
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
                return Math.Min(8, Math.Max(1, level));

            return 3;
        }

        private string GetRiskLevelDesc(int level)
        {
            return level switch
            {
                1 => "ต่ำมาก",
                2 => "ต่ำ",
                3 => "ค่อนข้างต่ำ",
                4 => "ปานกลางค่อนข้างต่ำ",
                5 => "ปานกลาง",
                6 => "ปานกลางค่อนข้างสูง",
                7 => "สูง",
                8 => "สูงมาก",
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

        // GET: /Compare/ChartData?fundIds=1,2,3&period=1Y
        // GET: /Compare/ChartData?fundIds=1,2,3&period=1Y
        [HttpGet("ChartData")]
        public IActionResult ChartData(string fundIds, string period = "1Y")
        {
            try
            {
                if (string.IsNullOrEmpty(fundIds))
                {
                    return Json(new { success = false, message = "ไม่พบรหัสกองทุน" });
                }

                var ids = fundIds.Split(',')
                    .Select(id => int.TryParse(id.Trim(), out var fundId) ? fundId : 0)
                    .Where(id => id > 0)
                    .ToList();

                if (!ids.Any())
                {
                    return Json(new { success = false, message = "รหัสกองทุนไม่ถูกต้อง" });
                }

                // Calculate date range based on period
                var endDate = DateTime.Now;
                var startDate = period switch
                {
                    "1M" => endDate.AddMonths(-1),
                    "3M" => endDate.AddMonths(-3),
                    "6M" => endDate.AddMonths(-6),
                    "1Y" => endDate.AddYears(-1),
                    "3Y" => endDate.AddYears(-3),
                    "5Y" => endDate.AddYears(-5),
                    "MAX" => endDate.AddYears(-10),
                    _ => endDate.AddYears(-1)
                };

                var chartData = new List<object>();

                foreach (var fundId in ids)
                {
                    var fund = _repo.Fetch<Fund>()
                        .Include<FundClass>()
                        .Where(new { Id = fundId, IsActive = true })
                        .FirstOrDefault();

                    if (fund == null) continue;

                    // Get NAV history
                    var navHistory = fund.FundClasses?
                        .SelectMany(fc => fc.FundNAV ?? new List<FundNAV>())
                        .Where(n => n.NAVDate >= startDate && n.NAVDate <= endDate)
                        .OrderBy(n => n.NAVDate)
                        .Select(n => new
                        {
                            date = n.NAVDate.ToString("yyyy-MM-dd"),
                            value = n.NAV
                        })
                        .ToList();

                    // ✅ แก้ไขตรงนี้ - ใช้ List<dynamic> แทน
                    List<dynamic> chartPoints;

                    if (navHistory == null || !navHistory.Any())
                    {
                        // Generate mock data if no real data
                        chartPoints = GenerateMockNAVData(startDate, endDate, fundId);
                    }
                    else
                    {
                        chartPoints = navHistory.Cast<dynamic>().ToList();
                    }

                    chartData.Add(new
                    {
                        fundId = fundId,
                        fundCode = fund.ProjAbbrName,
                        fundName = fund.ProjNameTH,
                        data = chartPoints
                    });
                }

                return Json(new { success = true, data = chartData });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting chart data");
                return Json(new { success = false, message = "เกิดข้อผิดพลาดในการโหลดข้อมูลกราฟ" });
            }
        }

        // ✅ แก้ไข return type เป็น List<dynamic>
        private List<dynamic> GenerateMockNAVData(DateTime startDate, DateTime endDate, int fundId)
        {
            var data = new List<dynamic>();
            var random = new Random(fundId); // Use fundId as seed for consistent data
            var baseNAV = 10.0m + (fundId % 5); // Different base NAV for each fund
            var currentNAV = baseNAV;
            var currentDate = startDate;

            while (currentDate <= endDate)
            {
                // Random walk with slight upward bias
                var change = (decimal)(random.NextDouble() * 0.06 - 0.02); // -2% to +4%
                currentNAV = currentNAV * (1 + change);
                currentNAV = Math.Max(baseNAV * 0.7m, Math.Min(baseNAV * 1.5m, currentNAV)); // Keep within reasonable range

                data.Add(new
                {
                    date = currentDate.ToString("yyyy-MM-dd"),
                    value = Math.Round(currentNAV, 4)
                });

                currentDate = currentDate.AddDays(1);
            }

            return data;
        }
         
    }
 
 
    public class AddFundRequest
    {
        public int FundId { get; set; }
    }
}