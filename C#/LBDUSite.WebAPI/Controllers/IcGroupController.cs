using DocumentFormat.OpenXml.Spreadsheet;
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
    public class IcGroupController : BaseApiController
    {
        private readonly IRepositoryFactory _repo;

        public IcGroupController(IRepositoryFactory repo)
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
            var totalCount = _repo.GetList<IcGroup>(condition, param).Count();
            var datalist = _repo.GetListPaged<IcGroup>(page, limit, condition, orderby, param);

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
                var groups = _repo.FindAll<IcGroup>(new { isActive = true });
                var consultants = _repo.FindAll<InvestmentConsultant>(new { status = "ACTIVE" });
       
                return Ok(new { groups = groups, consultants = consultants });
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
                var group = _repo.FindById<IcGroup>(id);
                if (group == null)
                    return NotFound(new { message = "IC Group not found" });

                var members = _repo.Fetch<IcGroupMember>()
                    .Where(new { icGroupId = id, isActive = true })
                    .ToList();

                return Ok(new { group = group, members = members });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Route("post")]
        [HttpPost]
        public IActionResult Post([FromBody] IcGroupSaveRequest request)
        {
            try
            {
                _repo.BeginTransaction();

                if (request.Group.Id > 0)
                {
                    request.Group.UpdatedAt = DateTime.Now;
                    request.Group.UpdatedBy = base.userInfo.Id;
                    _repo.Update(request.Group);
                }
                else
                {
                    request.Group.CreatedAt = DateTime.Now;
                    request.Group.CreatedBy = base.userInfo.Id;
                    request.Group.Id = _repo.Insert(request.Group);
                }

                var groupId = request.Group.Id;

                // Delete existing members
                var existing = _repo.FindAll<IcGroupMember>(new { icGroupId = groupId });
                    
                foreach (var member in existing)
                {
                    _repo.Delete(member);
                }

                // Insert new members
                if (request.Members != null)
                {
                    foreach (var icId in request.Members)
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

                _repo.Commit();

                return Ok(new { message = "Saved successfully", data = request.Group });
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
                var group = _repo.FindById<IcGroup>(id);
                if (group == null)
                    return NotFound(new { message = "IC Group not found" });

                group.IsActive = false;
                group.UpdatedAt = DateTime.Now;
                group.UpdatedBy = base.userInfo.Id;
                _repo.Update(group);

                return Ok(new { message = "Deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    public class IcGroupSaveRequest
    {
        public IcGroup Group { get; set; }
        public List<long> Members { get; set; }
    }
}