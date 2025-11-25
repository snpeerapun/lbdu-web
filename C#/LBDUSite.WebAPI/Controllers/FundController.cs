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
    public class FundController : BaseApiController
    {
        private readonly IRepositoryFactory _repo;

        public FundController(IRepositoryFactory repo)
        {
            _repo = repo;
        }

        /// <summary>
        /// Get fund by ID
        /// </summary>
        [Route("get/{id}")]
        [HttpGet]
        public IActionResult Get(int id)
        {
            try
            {
                var fund = _repo.FindById<Fund>(id);

                if (fund == null)
                    return NotFound(new { message = "Fund not found" });

                return Ok(fund);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// </summary>
        [Route("getdata")]
        [HttpGet]
        public IActionResult GetData()
        {
            try
            {

                var resp = new
                {
                    fundTypes = _repo.FindAll<FundType>(),
                    amcs = _repo.FindAll<AssetManagementCompany>(),
                };
                return Ok(resp);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        /// <summary>
        /// Create or Update fund
        /// </summary>
        [Route("post")]
        [HttpPost]
        public IActionResult Post(Fund fund)
        {
            try
            {
                if (fund == null)    return BadRequest(new { message = "Invalid data" });

                if (fund.Id > 0)
                {
                    fund.UpdatedAt = DateTime.Now;
                    fund.UpdatedBy = base.userInfo.Id;
                    _repo.Update(fund);

                }
                else
                {
                    var duplicate = _repo.Find<Fund>( new { FundCodeAmc = fund.FundCodeAmc, AmcId = fund.AmcId });
                    if (duplicate!=null)
                        return BadRequest(new { message = "Fund code already exists for this AMC" });

                    fund.IsActive = true;
                    fund.CreatedBy = base.userInfo.Id;
                    fund.CreatedAt = DateTime.Now;
                    fund.Id = _repo.Insert(fund);
                 
                }
                return Ok(new
                {
                    message = "Saved successfully",
                    data = fund
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Delete fund (soft delete)
        /// </summary>
        [Route("delete/{id}")]
        [HttpDelete]
        public IActionResult Delete(int id)
        {
            try
            {
                var fund = _repo.FindById<Fund>(id);

                if (fund == null)
                    return NotFound(new { message = "Fund not found" });

                // Soft delete
                fund.IsActive = false;
                fund.UpdatedBy = base.userInfo.Id;
                fund.UpdatedAt = DateTime.Now;

                _repo.Update(fund);

                return Ok(new { message = "Deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
         

        /// <summary>
        /// Get paginated list with filters
        /// </summary>
        [Route("list")]
        [HttpPost]
        public IActionResult GetList(JsonElement jsonData)
        {
            try
            {
                int page = jsonData.GetProperty("page").GetInt32();
                int limit = jsonData.GetProperty("limit").GetInt32();
                string orderby = jsonData.GetProperty("order").GetString() ?? "FundNameShortTh";
                string filter = jsonData.GetProperty("filter").GetString() ?? "";

                // Get filters
                string amcId = jsonData.TryGetProperty("amcId", out var amc) && !string.IsNullOrEmpty(amc.GetString())
                    ? amc.GetString()
                    : "";
                string fundTypeId = jsonData.TryGetProperty("fundTypeId", out var type) && !string.IsNullOrEmpty(type.GetString())
                    ? type.GetString()
                    : "";
                string riskLevel = jsonData.TryGetProperty("riskLevel", out var risk) && !string.IsNullOrEmpty(risk.GetString())
                    ? risk.GetString()
                    : "";
                string isActive = jsonData.TryGetProperty("isActive", out var active) && !string.IsNullOrEmpty(active.GetString())
                    ? active.GetString()
                    : "";

                // Build condition
                var conditions = new List<string>();
                var param = new Dictionary<string, object>();

                // Text search
                if (!string.IsNullOrEmpty(filter))
                {
                    conditions.Add("(FundCodeSa LIKE @filter OR FundCodeAmc LIKE @filter OR FundNameShortTh LIKE @filter)");
                    param["filter"] = '%' + filter + '%';
                }

                // AMC filter
                if (!string.IsNullOrEmpty(amcId))
                {
                    conditions.Add("AmcId = @amcId");
                    param["amcId"] = int.Parse(amcId);
                }

                // Fund Type filter
                if (!string.IsNullOrEmpty(fundTypeId))
                {
                    conditions.Add("FundTypeId = @fundTypeId");
                    param["fundTypeId"] = int.Parse(fundTypeId);
                }

                // Risk Level filter
                if (!string.IsNullOrEmpty(riskLevel))
                {
                    conditions.Add("RiskLevel = @riskLevel");
                    param["riskLevel"] = int.Parse(riskLevel);
                }

                // Status filter
                if (!string.IsNullOrEmpty(isActive))
                {
                    conditions.Add("IsActive = @isActive");
                    param["isActive"] = int.Parse(isActive) == 1;
                }

                string condition = conditions.Any()
                    ? "WHERE " + string.Join(" AND ", conditions)
                    : "";

                // Get total count
                var totalCount = _repo.GetList<Fund>(condition, param).Count;

                // Get paged data
                const int Unlimited = int.MaxValue;
                var pageSize = (limit > 0) ? limit : Unlimited;

                var datalist = _repo.GetListPaged<Fund>(
                    page,
                    pageSize,
                    condition,
                    orderby,
                    param
                );

                // Include AMC and FundType names (optional - requires JOIN or separate queries)
                // For now, return basic data
                var result = new
                {
                    data = datalist,
                    total = totalCount,
                    page = page,
                    pageSize = pageSize
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}