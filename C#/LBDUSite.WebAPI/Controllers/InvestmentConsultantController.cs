using LBDUSite.Models;
using LBDUSite.Repository.Interfaces;
using LBDUSite.WebAPI.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

namespace LBDUSite.WebAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class InvestmentConsultantController : BaseApiController
    {
        private readonly IRepositoryFactory _repo;

        public InvestmentConsultantController(IRepositoryFactory repo)
        {
            _repo = repo;
        }


        [Route("list")]
        [HttpPost]

        public IActionResult GetList(JsonElement jsonData)
        {
            int page = jsonData.GetProperty("page").GetInt32();
            int limit = jsonData.GetProperty("limit").GetInt32();
            string orderby = jsonData.GetProperty("order").GetString() ?? "";
            string filter = jsonData.GetProperty("filter").GetString() ?? "";

            //string name = filter.search;
            object param = new { @filter = '%' + filter + '%' };

            //object param = new { @text = filter };
            string condition = (!String.IsNullOrEmpty(filter)) ? " where Name like @filter" : "";

            var offset = (page - 1) * limit;
            var totalCount = _repo.GetList<InvestmentConsultant>(condition, param).Count();
            var datalist = _repo.GetListPaged<InvestmentConsultant>(page, limit, condition, orderby, param);

            var obj = new
            {
                data = datalist,
                total = totalCount.ToString(),
            };
            return Ok(obj);
        }
        /// <summary>
        /// Get data for dropdown lists
        /// </summary>
        [Route("getdata")]
        [HttpGet]
        public IActionResult GetData()
        {
            try
            {
                // Users
                var users = _repo.Fetch<User>()
                    .Where(new { isActive = true })
                    .Select(u => new { u.Id, u.FullName })
                    .ToList();

                // Active consultants (for parent IC selection)
                var consultants = _repo.Fetch<InvestmentConsultant>()
                    .Where(new { status = "ACTIVE" })
                    .Select(ic => new
                    {
                        ic.Id,
                        ic.ContactCode,
                        ic.FullNameTh,
                        ic.FullNameEn
                    })
                    .ToList();

                // IC Groups
                var groups = _repo.Fetch<IcGroup>()
                    .Where(new { isActive = true })
                    .Select(g => new
                    {
                        g.Id,
                        g.GroupCode,
                        g.GroupName
                    })
                    .ToList();

                // Fee Schemes
                var feeSchemes = _repo.Fetch<FeeScheme>()
                    .Where(new { isActive = true })
                    .Select(f => new
                    {
                        f.Id,
                        f.SchemeCode,
                        f.SchemeName,
                        f.FeeType
                    })
                    .ToList();

                return Ok(new
                {
                    users = users,
                    consultants = consultants,
                    groups = groups,
                    feeSchemes = feeSchemes
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get single Investment Consultant by ID
        /// </summary>
        [Route("get/{id}")]
        [HttpGet]
        public IActionResult Get(long id)
        {
            try
            {
                var consultant = _repo.FindById<InvestmentConsultant>(id);
                if (consultant == null)
                    return NotFound(new { message = "Investment Consultant not found" });

                // Load groups
                var groups = _repo.Fetch<IcGroupMember>()
                    .Where(new { investmentConsultantId = id, isActive = true })
                    .Include<IcGroup>()
                    .ToList();

                // Load fee assignments
                var feeAssignments = _repo.Fetch<IcFeeAssignment>()
                    .Where(new { investmentConsultantId = id, isActive = true })
                    .Include<FeeScheme>()
                    .ToList();

                // Load hierarchy
                var hierarchy = _repo.Find<IcHierarchy>(new { investmentConsultantId = id, isActive = true });
                 
                // Load parent IC if exists
                InvestmentConsultant parentIc = null;
                if (hierarchy?.ParentIcId != null)
                {
                    parentIc = _repo.FindById<InvestmentConsultant>(hierarchy.ParentIcId.Value);
                }

                return Ok(new
                {
                    consultant = consultant,
                    groups = groups,
                    feeAssignments = feeAssignments,
                    hierarchy = hierarchy,
                    parentIc = parentIc
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Create or Update Investment Consultant
        /// </summary>
        [Route("post")]
        [HttpPost]
        public IActionResult Post([FromBody] InvestmentConsultantSaveRequest request)
        {
            try
            {
                if (request.Consultant == null)
                    return BadRequest(new { message = "Invalid data" });

                _repo.BeginTransaction();

                // Save consultant
                if (request.Consultant.Id > 0)
                {
                    // Update
                    request.Consultant.UpdatedAt = DateTime.Now;
                    request.Consultant.UpdatedBy = base.userInfo.Id;
                    _repo.Update(request.Consultant);
                }
                else
                {
                    // Insert
                    request.Consultant.CreatedAt = DateTime.Now;
                    request.Consultant.CreatedBy = base.userInfo.Id;
                    request.Consultant.Id = _repo.Insert(request.Consultant);
                }

                var icId = request.Consultant.Id;

                // Save group memberships
                var existingGroups = _repo.Fetch<IcGroupMember>()
                    .Where(new { investmentConsultantId = icId })
                    .ToList();

                foreach (var existing in existingGroups)
                {
                    _repo.Delete(existing);
                }

                if (request.Groups != null && request.Groups.Any())
                {
                    foreach (var groupId in request.Groups)
                    {
                        _repo.Insert(new IcGroupMember
                        {
                            IcGroupId = groupId,
                            InvestmentConsultantId = icId,
                            JoinDate = DateTime.Now,
                            IsActive = true
                        });
                    }
                }

                // Save fee scheme assignments
                var existingFees = _repo.Fetch<IcFeeAssignment>()
                    .Where(new { investmentConsultantId = icId })
                    .ToList();

                foreach (var existing in existingFees)
                {
                    _repo.Delete(existing);
                }

                if (request.FeeSchemes != null && request.FeeSchemes.Any())
                {
                    foreach (var feeSchemeId in request.FeeSchemes)
                    {
                        _repo.Insert(new IcFeeAssignment
                        {
                            InvestmentConsultantId = icId,
                            FeeSchemeId = feeSchemeId,
                            AssignmentType = "INDIVIDUAL",
                            EffectiveFrom = DateTime.Now,
                            IsActive = true,
                            CreatedAt = DateTime.Now,
                            CreatedBy = base.userInfo.Id
                        });
                    }
                }

                // Save hierarchy
                if (request.Hierarchy != null && request.Hierarchy.ParentIcId != null)
                {
                    // Deactivate existing hierarchy
                    var existingHierarchy = _repo.Fetch<IcHierarchy>()
                        .Where(new { investmentConsultantId = icId, isActive = true })
                        .FirstOrDefault();

                    if (existingHierarchy != null)
                    {
                        existingHierarchy.IsActive = false;
                        _repo.Update(existingHierarchy);
                    }

                    // Insert new hierarchy
                    _repo.Insert(new IcHierarchy
                    {
                        InvestmentConsultantId = icId,
                        ParentIcId = request.Hierarchy.ParentIcId,
                        TierLevel = request.Hierarchy.TierLevel ?? 1,
                        TierName = request.Hierarchy.TierName,
                        OverridePercentage = request.Hierarchy.OverridePercentage,
                        EffectiveFrom = DateTime.Now,
                        IsActive = true
                    });
                }

                _repo.Commit();

                return Ok(new
                {
                    message = "Investment Consultant saved successfully",
                    data = request.Consultant
                });
            }
            catch (Exception ex)
            {
                _repo.Rollback();
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Delete (soft delete - set status to INACTIVE)
        /// </summary>
        [Route("delete/{id}")]
        [HttpGet]
        public IActionResult Delete(long id)
        {
            try
            {
                var consultant = _repo.FindById<InvestmentConsultant>(id);
                if (consultant == null)
                    return NotFound(new { message = "Investment Consultant not found" });

                consultant.Status = "INACTIVE";
                consultant.UpdatedAt = DateTime.Now;
                consultant.UpdatedBy = base.userInfo.Id;
                _repo.Update(consultant);

                return Ok(new { message = "Investment Consultant deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Update status
        /// </summary>
        [Route("status/{id}")]
        [HttpPut]
        public IActionResult UpdateStatus(long id, [FromBody] StatusUpdateRequest request)
        {
            try
            {
                var consultant = _repo.FindById<InvestmentConsultant>(id);
                if (consultant == null)
                    return NotFound(new { message = "Investment Consultant not found" });

                consultant.Status = request.Status;
                consultant.UpdatedAt = DateTime.Now;
                consultant.UpdatedBy = base.userInfo.Id;
                _repo.Update(consultant);

                return Ok(new { message = "Status updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get IC hierarchy tree
        /// </summary>
        [Route("hierarchy/{id}")]
        [HttpGet]
        public IActionResult GetHierarchy(long id)
        {
            try
            {
                var consultant = _repo.FindById<InvestmentConsultant>(id);
                if (consultant == null)
                    return NotFound(new { message = "Investment Consultant not found" });

                // Get current hierarchy
                var hierarchy = _repo.Fetch<IcHierarchy>()
                    .Where(new { investmentConsultantId = id, isActive = true })
                    .FirstOrDefault();

                // Get parent
                InvestmentConsultant parent = null;
                if (hierarchy?.ParentIcId != null)
                {
                    parent = _repo.FindById<InvestmentConsultant>(hierarchy.ParentIcId.Value);
                }

                // Get children (downlines)
                var childrenHierarchy = _repo.Fetch<IcHierarchy>()
                    .Where(new { parentIcId = id, isActive = true })
                    .ToList();

                var children = new List<InvestmentConsultant>();
                foreach (var childHier in childrenHierarchy)
                {
                    var child = _repo.FindById<InvestmentConsultant>(childHier.InvestmentConsultantId);
                    if (child != null)
                    {
                       // child.H = childHier;
                        children.Add(child);
                    }
                }

                // Get all uplines (recursive)
                var uplines = new List<object>();
                var currentParentId = hierarchy?.ParentIcId;
                while (currentParentId != null)
                {
                    var parentHierarchy = _repo.Fetch<IcHierarchy>()
                        .Where(new { investmentConsultantId = currentParentId, isActive = true })
                        .FirstOrDefault();

                    var parentIc = _repo.FindById<InvestmentConsultant>(currentParentId.Value);
                    if (parentIc != null)
                    {
                        uplines.Add(new
                        {
                            ic = parentIc,
                            hierarchy = parentHierarchy
                        });
                    }

                    currentParentId = parentHierarchy?.ParentIcId;
                }

                return Ok(new
                {
                    consultant = consultant,
                    hierarchy = hierarchy,
                    parent = parent,
                    children = children,
                    uplines = uplines
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get IC fee assignments and summary
        /// </summary>
        [Route("fees/{id}")]
        [HttpGet]
        public IActionResult GetFees(long id)
        {
            try
            {
                var consultant = _repo.FindById<InvestmentConsultant>(id);
                if (consultant == null)
                    return NotFound(new { message = "Investment Consultant not found" });

                // Get fee assignments
                var assignments = _repo.Fetch<IcFeeAssignment>()
                    .Where(new { investmentConsultantId = id, isActive = true })
                    .Include<FeeScheme>()
                    .ToList();

                // Get fee transactions summary (last 12 months)
                var twelveMonthsAgo = DateTime.Now.AddMonths(-12);
                var transactions = _repo.Fetch<IcFeeTransaction>()
                    .Where($"InvestmentConsultantId = @icId AND BusinessDate >= @date",
                        new { icId = id, date = twelveMonthsAgo })
                    .ToList();

                var summary = transactions
                    .GroupBy(t => new { t.FeeType, Month = t.BusinessDate.ToString("yyyy-MM") })
                    .Select(g => new
                    {
                        FeeType = g.Key.FeeType,
                        Month = g.Key.Month,
                        TotalFee = g.Sum(t => t.FeeAmount),
                        TransactionCount = g.Count()
                    })
                    .OrderByDescending(s => s.Month)
                    .ToList();

                // Get monthly summary
                var monthlySummary = _repo.Fetch<IcFeeSummary>()
                    .Where($"InvestmentConsultantId = @icId AND SummaryPeriod >= @period",
                        new
                        {
                            icId = id,
                            period = twelveMonthsAgo.ToString("yyyy-MM")
                        })
                    .OrderBy("SummaryPeriod DESC")
                    .ToList();

                return Ok(new
                {
                    consultant = consultant,
                    assignments = assignments,
                    transactionSummary = summary,
                    monthlySummary = monthlySummary
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get IC performance metrics
        /// </summary>
        [Route("performance/{id}")]
        [HttpGet]
        public IActionResult GetPerformance(long id, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate)
        {
            try
            {
                var consultant = _repo.FindById<InvestmentConsultant>(id);
                if (consultant == null)
                    return NotFound(new { message = "Investment Consultant not found" });

                var from = fromDate ?? DateTime.Now.AddMonths(-12);
                var to = toDate ?? DateTime.Now;

                // Get fee transactions
                var transactions = _repo.Fetch<IcFeeTransaction>()
                    .Where($"InvestmentConsultantId = @icId AND BusinessDate BETWEEN @from AND @to",
                        new { icId = id, from = from, to = to })
                    .ToList();

                var totalFees = transactions.Sum(t => t.FeeAmount);
                var totalTransactions = transactions.Count;
                var avgFeePerTransaction = totalTransactions > 0 ? totalFees / totalTransactions : 0;

                // Get by fee type
                var feeByType = transactions
                    .GroupBy(t => t.FeeType)
                    .Select(g => new
                    {
                        FeeType = g.Key,
                        TotalFee = g.Sum(t => t.FeeAmount),
                        Count = g.Count()
                    })
                    .ToList();

                // Get downline performance
                var childrenHierarchy = _repo.Fetch<IcHierarchy>()
                    .Where(new { parentIcId = id, isActive = true })
                    .ToList();

                var downlinePerformance = new List<object>();
                foreach (var childHier in childrenHierarchy)
                {
                    var childTransactions = _repo.Fetch<IcFeeTransaction>()
                        .Where($"InvestmentConsultantId = @icId AND BusinessDate BETWEEN @from AND @to",
                            new { icId = childHier.InvestmentConsultantId, from = from, to = to })
                        .ToList();

                    var childIc = _repo.FindById<InvestmentConsultant>(childHier.InvestmentConsultantId);

                    downlinePerformance.Add(new
                    {
                        consultant = childIc,
                        totalFees = childTransactions.Sum(t => t.FeeAmount),
                        transactionCount = childTransactions.Count
                    });
                }

                return Ok(new
                {
                    consultant = consultant,
                    period = new { from = from, to = to },
                    totalFees = totalFees,
                    totalTransactions = totalTransactions,
                    avgFeePerTransaction = avgFeePerTransaction,
                    feeByType = feeByType,
                    downlinePerformance = downlinePerformance
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Export to Excel
        /// </summary>
        [Route("export")]
        [HttpGet]
        public IActionResult Export()
        {
            try
            {
                var consultants = _repo.Fetch<InvestmentConsultant>()
                    .OrderBy("ContactCode")
                    .ToList();

                // TODO: Implement Excel export using EPPlus or similar library
                // For now, return CSV format

                var csv = "Contact Code,Full Name (TH),Full Name (EN),License No,License Expiry,Status\n";
                foreach (var ic in consultants)
                {
                    csv += $"{ic.ContactCode},{ic.FullNameTh},{ic.FullNameEn},{ic.LicenseNo}," +
                           $"{ic.LicenseExpiryDate?.ToString("yyyy-MM-dd")},{ic.Status}\n";
                }

                var bytes = System.Text.Encoding.UTF8.GetBytes(csv);
                return File(bytes, "text/csv", $"IC_Export_{DateTime.Now:yyyyMMdd}.csv");
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    #region Request Models

    public class InvestmentConsultantSaveRequest
    {
        public InvestmentConsultant Consultant { get; set; }
        public List<int> Groups { get; set; }
        public List<int> FeeSchemes { get; set; }
        public IcHierarchyRequest Hierarchy { get; set; }
    }

    public class IcHierarchyRequest
    {
        public long? ParentIcId { get; set; }
        public int? TierLevel { get; set; }
        public string TierName { get; set; }
        public decimal? OverridePercentage { get; set; }
    }

    public class StatusUpdateRequest
    {
        public string Status { get; set; }
    }

    #endregion
}