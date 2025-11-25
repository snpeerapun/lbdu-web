using LBDUSite.Models;
using LBDUSite.Repository;
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
    public class AmcController : BaseApiController
    {
        private readonly IRepositoryFactory _repo;

        public AmcController(IRepositoryFactory repo)
        {
            _repo = repo;
        }

        /// <summary>
        /// Get AMC by ID
        /// </summary>
        [Route("get/{id}")]
        [HttpGet]
        public IActionResult Get(int id)
        {
            try
            {
                var amc = _repo.FindById<AssetManagementCompany>(id);

                if (amc == null)
                    return NotFound(new { message = "Asset Management Company not found" });

                return Ok(amc);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get AMC with related data
        /// </summary>
        [Route("detail/{id}")]
        [HttpGet]
        public IActionResult GetDetail(int id)
        {
            try
            {
                // Get AMC with includes if needed
                var amc = _repo.Find<AssetManagementCompany>(new { Id = id });
                if (amc == null) return NotFound(new { message = "Asset Management Company not found" });

                return Ok(amc);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get all active AMCs
        /// </summary>
        [Route("getall")]
        [HttpGet]
        public IActionResult GetAll()
        {
            try
            {
                List<AssetManagementCompany> amcs = _repo.FindAll<AssetManagementCompany>(new { IsActive = true });
                return Ok(amcs);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


        /// <summary>
        /// Create or Update AMC
        /// </summary>
        [Route("post")]
        [HttpPost]
        public IActionResult Post(AssetManagementCompany amc)
        {
            try
            {
                if (amc == null)  return BadRequest(new { message = "Invalid data" });

                if (amc.Id > 0)
                {
                    amc.UpdatedBy = base.userInfo.Id;
                    amc.UpdatedAt = DateTime.Now;
                    _repo.Update(amc);
                }
                else
                {
                    amc.CreatedBy = base.userInfo.Id;
                    amc.CreatedAt = DateTime.Now;
                    amc.Id = _repo.Insert(amc);

                }
                return Ok(new { message = "Saved successfully", data = amc });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Delete AMC (soft delete)
        /// </summary>
        [Route("delete/{id}")]
        [HttpDelete]
        public IActionResult Delete(int id)
        {
            try
            {
                var amc = _repo.FindById<AssetManagementCompany>(id);

                if (amc == null)
                    return NotFound(new { message = "Asset Management Company not found" });

                // Soft delete
                amc.IsActive = false;
                amc.UpdatedBy = base.userInfo.Id;
                amc.UpdatedAt = DateTime.Now;

                _repo.Update(amc);

                return Ok(new { message = "Deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Permanent delete
        /// </summary>
        [Route("harddelete/{id}")]
        [HttpDelete]
        public IActionResult HardDelete(int id)
        {
            try
            {
                var amc = _repo.FindById<AssetManagementCompany>(id);

                if (amc == null)
                    return NotFound(new { message = "Asset Management Company not found" });

                _repo.Delete(amc);

                return Ok(new { message = "Permanently deleted" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


        /// <summary>
        /// Get paginated list with search
        /// </summary>

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
            var totalCount = _repo.GetList<AssetManagementCompany>(condition, param).Count();
            var datalist = _repo.GetListPaged<AssetManagementCompany>(page, limit, condition, orderby, param);

            var obj = new
            {
                data = datalist,
                total = totalCount.ToString(),
            };
            return Ok(obj);
        }

    }

    #region Request Models

    public class AmcSearchRequest
    {
        public string? AmcCode { get; set; }
        public string? ShortName { get; set; }
        public string? FullName { get; set; }
        public bool? IsActive { get; set; }
    }

    #endregion
}