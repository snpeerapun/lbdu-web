
using DocumentFormat.OpenXml.Spreadsheet;
using LBDUSite.Common;
using LBDUSite.Models;
using LBDUSite.Repository;
using LBDUSite.Repository.Interfaces;
using LBDUSite.WebAPI.Models;
using LBDUSite.WebAPI.Utility;
using Microsoft.AspNetCore.Authorization;
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
	public class UsersController : BaseApiController
	{
 
        private readonly IRepositoryFactory _repo;

        public UsersController(IRepositoryFactory repo)
        {
                _repo = repo;
        }
		
        [Route("get/{id}")]
        [HttpGet]
        public IActionResult Get(int Id)
        {
            //XmlConfigurator.Configure();

            //Logger.Info("Testing information log");
            var user = _repo.FindById<User>(Id);
            // Include collection of User
            var user2 = _repo.Fetch<User>()
            .Select(u => new { u.Id, u.FullName, u.Email })
            .Where(new { IsActive = 1 })
            .Include<Department>()
            .OrderBy(u => u.FullName).FirstOrDefault(); ;
    
           
            // Include collection of Departments
            var department = _repo.Fetch<Department>()
            .Where(new { IsActive = true, Id = 17 })
            .Include<User>()  // Include collection of Users
            .OrderBy(u => u.Code).FirstOrDefault();


            var users = _repo.Fetch<User>()
              .Select(u => new { u.Id, u.FullName, u.DepartmentId })
              .Where(new { IsActive = 1 })
              .Include(u => u.Department!, d => d
                  .Select(dept => new {dept.Id, dept.Name })
              )
              .FirstOrDefaultDynamic();

            var departments = _repo.Fetch<Department>()
            .Select(u => new { u.Id, u.Name })
            .Where(new { IsActive = true, Id = 17 })
            .Include(u => u.Users!, d => d
                .Select(o => new { o.Id, o.FullName, o.Email })
            )   
           .OrderBy(u => u.Code).FirstOrDefaultDynamic();

            return Ok(departments);
        }
	 
     
        [Route("delete/{id}")]
        [HttpGet]
        public void Delete(int Id)
        {
            var obj = _repo.FindById<User>(Id);         
            
            if (Id > 0) _repo.Delete(obj);
        }


        [Route("getdata")]
        [HttpGet]
        public IActionResult GetData()
        {
            var data = new
            {
                roles = _repo.FindAll<Role>(),
                departments = _repo.FindAll<Department>(),
                //funds = usersRepository.FindAll<Fund>(new { isActive = 1 }).OrderBy(x => x.FundCode).ToList(),
 
            };

            return Ok(data);
        }

 

        [Route("post")]
        [HttpPost]
        public IActionResult Post(UserRequest userRequest)
        {
            User user = userRequest.User;
            int[] funds = userRequest.Funds;
            try {
                user.FullName = user.FirstName + " " + user.LastName;
                if (user.Id > 0)
                {

                    user.UpdatedBy = base.userInfo.Id;
                    user.UpdatedAt = DateTime.Now;
                    _repo.Update(user);
                }
                else
                {
                    
                    if (!CheckDuplicateUserName(user.UserName)) { 
                        string password = SecurePasswordHasher.GeneratePassword();
                        user.PasswordHash = SecurePasswordHasher.Hash(password);//SecurePasswordHasher.Hash(users.PasswordHash);
                        //user.PasswordSetting = true;
                        user.CreatedBy = base.userInfo.Id;
                        user.CreatedAt = DateTime.Now;
                        user.Id =_repo.Insert(user);
                    }
                    else  
                        return BadRequest(new { message = "Username already exists." });

                     
                    
                }
               
                return Ok(user);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
              
        }
        bool CheckDuplicateUserName(String username)
        {
            var user = _repo.Fetch<User>().Where(new { IsActive = 1, UserName = username });
            if (user == null)
                return false;
            else
                return true;
        }
        /*
       
        [Route("changepassword")]
        [HttpPost]
        [CustomModelStateValidationFilter]
    
        public IActionResult ChangePassword(ConfirmPasswordModel confirmPassword)
        {
            try
            {

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                User user = usersRepository.GetOne(this.userInfo.Id);

                if (SecurePasswordHasher.Verify(confirmPassword.CurrentPassword, user.PasswordHash))  
                {

                    user.PasswordHash = SecurePasswordHasher.Hash(confirmPassword.NewPassword);
                    user.PasswordSetting = false;
                    usersRepository.Update(user);
                    return Ok("Password reset successful.");
                }
                else
                    return BadRequest(new { message = "Incorrect currrent password" });

            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
         */
        [Route("export")]
        [HttpGet]
        public IActionResult Export()
        {

            var obj = _repo .FindAll<User>();
            var dataList = (obj as IEnumerable<dynamic>)?.ToList();
            if (dataList == null || !dataList.Any())
            {
                return BadRequest("No data available for export.");
            }
            return Helper.ExportToExcel(dataList);
        }
        [Route("list")]
        [HttpPost]
        public IActionResult GetList(JsonElement jsonData)
        {
            int page = jsonData.GetProperty("page").GetInt32();
            int limit = jsonData.GetProperty("limit").GetInt32();
            string orderby = jsonData.GetProperty("order").GetString() ?? "";
            string filter = jsonData.GetProperty("filter").GetString() ?? "";

            var param = new { filter = '%' + filter + '%' };
            string condition = (!string.IsNullOrEmpty(filter)) ? " where FullName+UserName+Email like @filter" : "";

            var offset = (page - 1) * limit;
            var totalCount = _repo.GetList<User>(condition, param).Count;
            
            const int Unlimited = int.MaxValue;
            var pageSize = (limit > 0) ? limit : Unlimited;
            var datalist = _repo.GetListPaged<User>(page, pageSize, condition, orderby, param);

            var obj = new
            {
                data = datalist,
                total = totalCount.ToString(),
            };
            return Ok(obj);
        }
    }
}