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
    public class BankBranchController : BaseApiController
    {
        private readonly IRepositoryFactory _repo;

        public BankBranchController(IRepositoryFactory repo)
        {
            _repo = repo;
        }

        /// <summary>
        /// Get BankBranch by ID
        /// </summary>
        [Route("get/{id}")]
        [HttpGet]
        public IActionResult Get(int id)
        {
            try
            {
                var BankBranch = _repo.FindById<BankBranch>(id);

                if (BankBranch == null)
                    return NotFound(new { message = "Asset Management Company not found" });

                return Ok(BankBranch);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Route("getbybank/{id}")]
        [HttpGet]
        public IActionResult GetByBank(int id)
        {
            try
            {
                var BankBranch = _repo.FindAll<BankBranch>(new { BankId = id });
                return Ok(BankBranch);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get all active BankBranchs
        /// </summary>
        [Route("getall")]
        [HttpGet]
        public IActionResult GetAll()
        {
            try
            {
                List<BankBranch> BankBranchs = _repo.FindAll<BankBranch>(new { IsActive = true });
                return Ok(BankBranchs);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


        /// <summary>
        /// Create or Update BankBranch
        /// </summary>
        [Route("post")]
        [HttpPost]
        public IActionResult Post(BankBranch BankBranch)
        {
            try
            {
                if (BankBranch == null) return BadRequest(new { message = "Invalid data" });

                if (BankBranch.Id > 0)
                {
                    BankBranch.UpdatedBy = base.userInfo.Id;
                    BankBranch.UpdatedAt = DateTime.Now;
                    _repo.Update(BankBranch);
                }
                else
                {
                    BankBranch.CreatedBy = base.userInfo.Id;
                    BankBranch.CreatedAt = DateTime.Now;
                    BankBranch.Id = _repo.Insert(BankBranch);

                }
                return Ok(new { message = "Saved successfully", data = BankBranch });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Delete BankBranch (soft delete)
        /// </summary>
        [Route("delete/{id}")]
        [HttpDelete]
        public IActionResult Delete(int id)
        {
            try
            {
                var BankBranch = _repo.FindById<BankBranch>(id);

                if (BankBranch == null)
                    return NotFound(new { message = "Asset Management Company not found" });

                // Soft delete
                BankBranch.IsActive = false;
                BankBranch.UpdatedBy = base.userInfo.Id;
                BankBranch.UpdatedAt = DateTime.Now;

                _repo.Update(BankBranch);

                return Ok(new { message = "Deleted successfully" });
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
            var totalCount = _repo.GetList<BankBranch>(condition, param).Count();
            var datalist = _repo.GetListPaged<BankBranch>(page, limit, condition, orderby, param);

            var obj = new
            {
                data = datalist,
                total = totalCount.ToString(),
            };
            return Ok(obj);
        }

    }

    #region Request Models

    public class BankBranchSearchRequest
    {
        public string? BankBranchCode { get; set; }
        public string? ShortName { get; set; }
        public string? FullName { get; set; }
        public bool? IsActive { get; set; }
    }

    #endregion
}