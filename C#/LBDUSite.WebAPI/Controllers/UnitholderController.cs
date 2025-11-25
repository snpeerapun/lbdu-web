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
    public class UnitHolderController : BaseApiController
    {
        private readonly IRepositoryFactory _repo;

        public UnitHolderController(IRepositoryFactory repo)
        {
            _repo = repo;
        }

        /// <summary>
        /// Get UnitHolder by ID
        /// </summary>
        [Route("get/{id}")]
        [HttpGet]
        public IActionResult Get(int id)
        {
            try
            {
                var unitholder = _repo.FindById<Unitholder>(id);

                if (unitholder == null)
                    return NotFound(new { message = "UnitHolder not found" });

                return Ok(unitholder);
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
        /// Create or Update UnitHolder
        /// </summary>
        [Route("post")]
        [HttpPost]
        public IActionResult Post(Unitholder unitholder)
        {
            try
            {
                if (unitholder == null) return BadRequest(new { message = "Invalid data" });

                if (unitholder.Id > 0)
                {
                    unitholder.UpdatedAt = DateTime.Now;
                    unitholder.UpdatedBy = base.userInfo.Id;
                    _repo.Update(unitholder);

                }
                else
                {

                    //unitholder.IsActive = true;
                    unitholder.CreatedBy = base.userInfo.Id;
                    unitholder.CreatedAt = DateTime.Now;
                    unitholder.Id = _repo.Insert(unitholder);

                }
                return Ok(new
                {
                    message = "Saved successfully",
                    data = unitholder
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Delete UnitHolder (soft delete)
        /// </summary>
        [Route("delete/{id}")]
        [HttpDelete]
        public IActionResult Delete(int id)
        {
            try
            {
                var unitholder = _repo.FindById<Unitholder>(id);

                if (unitholder == null)
                    return NotFound(new { message = "UnitHolder not found" });

                // Soft delete
                //unitholder.IsActive = false;
                unitholder.UpdatedBy = base.userInfo.Id;
                unitholder.UpdatedAt = DateTime.Now;

                _repo.Update(unitholder);

                return Ok(new { message = "Deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

 
    }
}