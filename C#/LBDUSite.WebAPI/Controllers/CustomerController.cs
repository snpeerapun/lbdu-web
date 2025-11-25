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
    public class CustomerController : BaseApiController
    {
        private readonly IRepositoryFactory _repo;

        public CustomerController(IRepositoryFactory repo)
        {
            _repo = repo;
        }

        /// <summary>
        /// Get Customer by ID
        /// </summary>
        [Route("get/{id}")]
        [HttpGet]
        public IActionResult Get(int id)
        {
            try
            {
          

                // ✅ Expression Syntax
                var customer = _repo.Fetch<Customer>()
                    .Where(new { id = id })
                    .Include(c => c.CustomerAddresses)
                    .Include(c => c.CustomerRelationsPersons)
                    .Include(c => c.Accounts, account => {
                        account.Include(a => a.BankAccounts);
                        account.Include(a => a.Unitholders);
                    })
                    .Include(c => c.Documents, document => {
                        document.Include(d => d.DocumentType);
                     })
                    .FirstOrDefault();

                if (customer == null)
                    return NotFound(new { message = "Asset Management Company not found" });

                return Ok(customer);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get Customer with related data
        /// </summary>
        [Route("detail/{id}")]
        [HttpGet]
        public IActionResult GetDetail(int id)
        {
            try
            {
                // Get Customer with includes if needed
                var Customer = _repo.Find<Customer>(new { Id = id });
                if (Customer == null) return NotFound(new { message = "Asset Management Company not found" });

                return Ok(Customer);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get all active Customers
        /// </summary>
        [Route("getall")]
        [HttpGet]
        public IActionResult GetAll()
        {
            try
            {
                List<Customer> Customers = _repo.FindAll<Customer>(new { IsActive = true });
                return Ok(Customers);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


        /// <summary>
        /// Create or Update Customer
        /// </summary>
        [Route("post")]
        [HttpPost]
        public IActionResult Post(Customer customer)
        {
            try
            {
                if (customer == null)  return BadRequest(new { message = "Invalid data" });

                customer.CustomerName= customer.FirstNameTh+" "+customer.LastNameTh;
                if(customer.CustomerType == "Juristic")  customer.CustomerName = customer.CompanyNameTh;
                if (customer.Id > 0)
                {
                    customer.UpdatedBy = base.userInfo.Id;
                    customer.UpdatedAt = DateTime.Now;
                    _repo.Update(customer);
                }
                else
                {
                    customer.CreatedBy = base.userInfo.Id;
                    customer.CreatedAt = DateTime.Now;
                    customer.Id = _repo.Insert(customer);

                }
                return Ok(new { message = "Saved successfully", data = customer });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // save relate person 
        [Route("relateperson/post")]
        [HttpPost]
        public IActionResult PostRelatePerson(CustomerRelationsPerson relatePerson)
        {
            try
            {
                if (relatePerson == null) return BadRequest(new { message = "Invalid data" });

                if (relatePerson.Id > 0)
                {
                    //relatePerson.UpdatedBy = base.userInfo.Id;
                    relatePerson.UpdatedAt = DateTime.Now;
                    _repo.Update(relatePerson);
                }
                else
                {
                    //relatePerson.CreatedBy = base.userInfo.Id;
                    relatePerson.CreatedAt = DateTime.Now;
                    relatePerson.Id = _repo.Insert(relatePerson);

                }
                return Ok(new { message = "Saved successfully", data = relatePerson });
            }
            catch (Exception ex) {
                return BadRequest(new { message = ex.Message });
            }
        }
        //delete relate person
        [Route("relateperson/delete/{id}")]
        [HttpDelete]
        public IActionResult DeleteRelatePerson(int id)
        {
           try {
                if (id == 0) return BadRequest(new { message = "Invalid data" });

                var obj = _repo.FindById<CustomerRelationsPerson>(id);  
                if (obj != null) {
                    _repo.Delete(obj);
                }
                return Ok(new { message = "deleted successfully",});
            } catch (Exception ex) {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Route("bankaccount/post")]
        [HttpPost]
        public IActionResult PostBankAccount(BankAccount bankAccount)
        {
            try
            {
                if (bankAccount == null) return BadRequest(new { message = "Invalid data" });   

                if (bankAccount.Id > 0)
                {
                    bankAccount.UpdatedBy = base.userInfo.Id;
                    bankAccount.UpdatedAt = DateTime.Now;
                    _repo.Update(bankAccount);
                }
                else
                {
                    bankAccount.CreatedBy = base.userInfo.Id;
                    bankAccount.CreatedAt = DateTime.Now;
                    bankAccount.Id = _repo.Insert(bankAccount);
                    _repo.Update(bankAccount);
                }
                return Ok(new { message = "Saved successfully", data = bankAccount });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


        [Route("getdata")]
        [HttpGet]
        public IActionResult GetData()
        {
            try
            {

                var resp = new
                {
                    occupations = _repo.FindAll<Occupation>(),
                    businessTypes = _repo.FindAll<BusinessType>(),
                    documentTypes = _repo.FindAll<DocumentType>(), //documentCategories
                };
                return Ok(resp);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Delete Customer (soft delete)
        /// </summary>
        [Route("delete/{id}")]
        [HttpDelete]
        public IActionResult Delete(int id)
        {
            try
            {
                var customer = _repo.FindById<Customer>(id);

                if (customer == null)
                    return NotFound(new { message = "Asset Management Company not found" });

                // Soft delete

                customer.UpdatedBy = base.userInfo.Id;
                customer.UpdatedAt = DateTime.Now;

                _repo.Update(customer);

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
                var Customer = _repo.FindById<Customer>(id);

                if (Customer == null)
                    return NotFound(new { message = "Asset Management Company not found" });

                _repo.Delete(Customer);

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
            var totalCount = _repo.GetList<Customer>(condition, param).Count();
            var datalist = _repo.GetListPaged<Customer>(page, limit, condition, orderby, param);

            var obj = new
            {
                data = datalist,
                total = totalCount.ToString(),
            };
            return Ok(obj);
        }

    }

    #region Request Models

    public class CustomerSearchRequest
    {
        public string? CustomerCode { get; set; }
        public string? ShortName { get; set; }
        public string? FullName { get; set; }
        public bool? IsActive { get; set; }
    }

    #endregion
}