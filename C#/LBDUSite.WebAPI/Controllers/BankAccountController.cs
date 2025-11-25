using LBDUSite.Models;
using LBDUSite.Repository.Interfaces;
using LBDUSite.WebAPI.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;

namespace LBDUSite.WebAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class BankAccountController : BaseApiController
    {
        private readonly IRepositoryFactory _repo;

        public BankAccountController(IRepositoryFactory repo)
        {
            _repo = repo;
        }

        /// <summary>
        /// Get BankAccount by ID
        /// </summary>
        [Route("get/{id}")]
        [HttpGet]
        public IActionResult Get(int id)
        {
            try
            {
                var BankAccount = _repo.FindById<BankAccount>(id);

                if (BankAccount == null)
                    return NotFound(new { message = "BankAccount not found" });

                return Ok(BankAccount);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
         
        /// <summary>
        /// Create or Update BankAccount
        /// </summary>
        [Route("post")]
        [HttpPost]
        public IActionResult Post(BankAccount bankAccount)
        {
            try
            {
                if (bankAccount == null) return BadRequest(new { message = "Invalid data" });

                if (bankAccount.Id > 0)
                {
                    bankAccount.UpdatedAt = DateTime.Now;
                    bankAccount.UpdatedBy = base.userInfo.Id;
                    _repo.Update(bankAccount);

                }
                else
                {

                    bankAccount.IsActive = true;
                    bankAccount.CreatedBy = base.userInfo.Id;
                    bankAccount.CreatedAt = DateTime.Now;
                    bankAccount.Id = _repo.Insert(bankAccount);

                }
                return Ok(new
                {
                    message = "Saved successfully",
                    data = bankAccount
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Delete BankAccount (soft delete)
        /// </summary>
        [Route("delete/{id}")]
        [HttpDelete]
        public IActionResult Delete(int id)
        {
            try
            {
                var bankAccount = _repo.FindById<BankAccount>(id);

                if (bankAccount == null)
                    return NotFound(new { message = "BankAccount not found" });

                // Soft delete
                bankAccount.IsActive = false;
                bankAccount.UpdatedBy = base.userInfo.Id;
                bankAccount.UpdatedAt = DateTime.Now;

                _repo.Update(bankAccount);

                return Ok(new { message = "Deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
       
    }

}