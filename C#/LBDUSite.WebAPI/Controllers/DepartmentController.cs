
using LBDUSite.Common;
using LBDUSite.Models;
using LBDUSite.Repository;
using LBDUSite.Repository.Interfaces;
using LBDUSite.WebAPI.Services;
using log4net;
using log4net.Config;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Text.Json;
 
namespace LBDUSite.WebAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class DepartmentController : BaseApiController
    {
        private readonly IRepositoryFactory _repo;
        public DepartmentController( IRepositoryFactory repo)
        {
            _repo = repo;
 
        }

        [Route("get/{id}")]
        [HttpGet]
        public Department Get(int Id)
        {
     
            //
            //.Info("Testing information log");
            var obj= _repo.FindById<Department>(Id);
 
            return obj;
        }

        [Route("getall")]
        [HttpGet]
        public List<Department> GetAll()
        {
            return _repo.GetList<Department>();
        }

        [Route("delete/{id}")]
        [HttpGet]
        public void Delete(int Id)
        {
            Department dept = _repo.FindById< Department>(Id);
            if (Id > 0) _repo.Delete(dept);
        }
 
        [Route("post")]
        [HttpPost]
        public IActionResult Post(Department department)
        {
            if (department.Id > 0)
            {
                department.UpdatedBy = base.userInfo.UserName;
                department.UpdatedAt = DateTime.Now;
                _repo.Update(department);
            }
            else
            {
                department.CreatedBy = base.userInfo.UserName;
                department.CreatedAt = DateTime.Now;
                department.Id=(int)_repo.Insert(department);
            }
            

            return Ok(department);
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
            var totalCount = _repo.GetList<Department>(condition, param).Count;
            var datalist = _repo.GetListPaged<Department>(page, limit, condition, orderby, param);

            var obj = new
            {
                data = datalist,
                total = totalCount.ToString(),
            };
            return Ok(obj);
        } 
    }

}