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
    public class FeeSchemeController : BaseApiController
    {
        private readonly IRepositoryFactory _repo;

        public FeeSchemeController(IRepositoryFactory repo)
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
            var totalCount = _repo.GetList<FeeScheme>(condition, param).Count();
            var datalist = _repo.GetListPaged<FeeScheme>(page, limit, condition, orderby, param);

            var obj = new
            {
                data = datalist,
                total = totalCount.ToString(),
            };
            return Ok(obj);
        }

        [Route("getdata")]
        [HttpGet]
        public IActionResult GetData()
        {
            try
            {
                var amcs = _repo.FindAll<AssetManagementCompany>(new { isActive = true });

                var funds = _repo.FindAll<Fund>( new { isActive = true });
             
                return Ok(new { amcs = amcs, funds = funds });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Route("get/{id}")]
        [HttpGet]
        public IActionResult Get(int id)
        {
            try
            {
                var scheme = _repo.FindById<FeeScheme>(id);
                if (scheme == null)
                    return NotFound(new { message = "Fee Scheme not found" });

                var rates = _repo.FindAll<FeeSchemeRate>(new { feeSchemeId = id, isActive = true });
                 
                return Ok(new { scheme = scheme, rates = rates });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Route("post")]
        [HttpPost]
        public IActionResult Post([FromBody] FeeSchemeSaveRequest request)
        {
            try
            {
                _repo.BeginTransaction();

                if (request.Scheme.Id > 0)
                {
                    request.Scheme.UpdatedAt = DateTime.Now;
                    request.Scheme.UpdatedBy = base.userInfo.Id;
                    _repo.Update(request.Scheme);
                }
                else
                {
                    request.Scheme.CreatedAt = DateTime.Now;
                    request.Scheme.CreatedBy = base.userInfo.Id;
                    request.Scheme.Id = _repo.Insert(request.Scheme);
                }

                var schemeId = request.Scheme.Id;

                // Delete existing rates
                var existing = _repo.FindAll<FeeSchemeRate>(new { feeSchemeId = schemeId });
                foreach (var rate in existing)
                {
                    _repo.Delete(rate);
                }

                // Insert new rates
                if (request.Rates != null)
                {
                    foreach (var rate in request.Rates)
                    {
                        rate.FeeSchemeId = schemeId;
                        _repo.Insert(rate);
                    }
                }

                _repo.Commit();

                return Ok(new { message = "Saved successfully", data = request.Scheme });
            }
            catch (Exception ex)
            {
                _repo.Rollback();
                return BadRequest(new { message = ex.Message });
            }
        }

        [Route("delete/{id}")]
        [HttpGet]
        public IActionResult Delete(int id)
        {
            try
            {
                var scheme = _repo.FindById<FeeScheme>(id);
                if (scheme == null)
                    return NotFound(new { message = "Fee Scheme not found" });

                scheme.IsActive = false;
                scheme.UpdatedAt = DateTime.Now;
                scheme.UpdatedBy = base.userInfo.Id;
                _repo.Update(scheme);

                return Ok(new { message = "Deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Route("duplicate/{id}")]
        [HttpPost]
        public IActionResult Duplicate(int id)
        {
            try
            {
                _repo.BeginTransaction();

                var scheme = _repo.FindById<FeeScheme>(id);
                if (scheme == null)
                    return NotFound(new { message = "Fee Scheme not found" });

                // Create new scheme
                var newScheme = new FeeScheme
                {
                    SchemeCode = scheme.SchemeCode + "_COPY",
                    SchemeName = scheme.SchemeName + " (Copy)",
                    Description = scheme.Description,
                    FeeType = scheme.FeeType,
                    RateMethod = scheme.RateMethod,
                    CalculationBasis = scheme.CalculationBasis,
                    EffectiveFrom = DateTime.Now,
                    IsActive = true,
                    CreatedAt = DateTime.Now,
                    CreatedBy = base.userInfo.Id
                };
                newScheme.Id = _repo.Insert(newScheme);

                // Copy rates
                var rates = _repo.Fetch<FeeSchemeRate>()
                    .Where(new { feeSchemeId = id })
                    .ToList();

                foreach (var rate in rates)
                {
                    _repo.Insert(new FeeSchemeRate
                    {
                        FeeSchemeId = newScheme.Id,
                        FundId = rate.FundId,
                        AmcId = rate.AmcId,
                        MinAmount = rate.MinAmount,
                        MaxAmount = rate.MaxAmount,
                        RatePercentage = rate.RatePercentage,
                        FixedAmount = rate.FixedAmount,
                        DisplayOrder = rate.DisplayOrder,
                        IsActive = true
                    });
                }

                _repo.Commit();

                return Ok(new { message = "Duplicated successfully", data = newScheme });
            }
            catch (Exception ex)
            {
                _repo.Rollback();
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    public class FeeSchemeSaveRequest
    {
        public FeeScheme Scheme { get; set; }
        public List<FeeSchemeRate> Rates { get; set; }
    }
}