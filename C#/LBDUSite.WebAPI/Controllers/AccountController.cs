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
    public class AccountController : BaseApiController
    {
        private readonly IRepositoryFactory _repo;

        public AccountController(IRepositoryFactory repo)
        {
            _repo = repo;
        }

        /// <summary>
        /// Get Account by ID
        /// </summary>
        [Route("get/{id}")]
        [HttpGet]
        public IActionResult Get(int id)
        {
            try
            {
                var Account = _repo.FindById<Account>(id);

                if (Account == null)
                    return NotFound(new { message = "Account not found" });

                return Ok(Account);
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
                    //AccountTypes = _repo.FindAll<AccountType>(),
                    //amcs = _repo.FindAll<AssetManagementCompany>(),
                };
                return Ok(resp);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        /// <summary>
        /// Create or Update Account
        /// </summary>
        [Route("post")]
        [HttpPost]
        public IActionResult Post(Account account)
        {
            try
            {
                if (account == null)    return BadRequest(new { message = "Invalid data" });

                if (account.Id > 0)
                {
                    account.UpdatedAt = DateTime.Now;
                    account.UpdatedBy = base.userInfo.Id;
                    _repo.Update(account);

                }
                else
                {
                 
                    account.CreatedBy = base.userInfo.Id;
                    account.CreatedAt = DateTime.Now;
                    account.Id = _repo.Insert(account);
                 
                }
                return Ok(new
                {
                    message = "Saved successfully",
                    data = account
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Delete Account (soft delete)
        /// </summary>
        [Route("delete/{id}")]
        [HttpDelete]
        public IActionResult Delete(int id)
        {
            try
            {
                var Account = _repo.FindById<Account>(id);

                if (Account == null)
                    return NotFound(new { message = "Account not found" });

                Account.UpdatedBy = base.userInfo.Id;
                Account.UpdatedAt = DateTime.Now;

                _repo.Update(Account);

                return Ok(new { message = "Deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
         
         
    }
}