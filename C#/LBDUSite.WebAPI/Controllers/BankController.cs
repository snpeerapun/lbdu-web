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
    public class BankController : BaseApiController
    {
        private readonly IRepositoryFactory _repo;

        public BankController(IRepositoryFactory repo)
        {
            _repo = repo;
        }

        /// <summary>
        /// Get Bank by ID
        /// </summary>
        [Route("get/{id}")]
        [HttpGet]
        public IActionResult Get(int id)
        {
            try
            {
                var Bank = _repo.FindById<Bank>(id);

                if (Bank == null)
                    return NotFound(new { message = "Asset Management Company not found" });

                return Ok(Bank);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
 

        /// <summary>
        /// Get all active Banks
        /// </summary>
        [Route("getall")]
        [HttpGet]
        public IActionResult GetAll()
        {
            try
            {
                List<Bank> Banks = _repo.FindAll<Bank>(new { IsActive = true });
                return Ok(Banks);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


        /// <summary>
        /// Create or Update Bank
        /// </summary>
        [Route("post")]
        [HttpPost]
        public IActionResult Post(Bank Bank)
        {
            try
            {
                if (Bank == null) return BadRequest(new { message = "Invalid data" });

                if (Bank.Id > 0)
                {
                    Bank.UpdatedBy = base.userInfo.Id;
                    Bank.UpdatedAt = DateTime.Now;
                    _repo.Update(Bank);
                }
                else
                {
                    Bank.CreatedBy = base.userInfo.Id;
                    Bank.CreatedAt = DateTime.Now;
                    Bank.Id = _repo.Insert(Bank);

                }
                return Ok(new { message = "Saved successfully", data = Bank });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Delete Bank (soft delete)
        /// </summary>
        [Route("delete/{id}")]
        [HttpDelete]
        public IActionResult Delete(int id)
        {
            try
            {
                var Bank = _repo.FindById<Bank>(id);

                if (Bank == null)
                    return NotFound(new { message = "Asset Management Company not found" });

                // Soft delete
                Bank.IsActive = false;
                Bank.UpdatedBy = base.userInfo.Id;
                Bank.UpdatedAt = DateTime.Now;

                _repo.Update(Bank);

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
                var Bank = _repo.FindById<Bank>(id);

                if (Bank == null)
                    return NotFound(new { message = "Asset Management Company not found" });

                _repo.Delete(Bank);

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
            var totalCount = _repo.GetList<Bank>(condition, param).Count();
            var datalist = _repo.GetListPaged<Bank>(page, limit, condition, orderby, param);

            var obj = new
            {
                data = datalist,
                total = totalCount.ToString(),
            };
            return Ok(obj);
        }

    }

    #region Request Models

    public class BankSearchRequest
    {
        public string? BankCode { get; set; }
        public string? ShortName { get; set; }
        public string? FullName { get; set; }
        public bool? IsActive { get; set; }
    }

    #endregion
}