using LBDUSite.Models;
using LBDUSite.Repository.Interfaces;
using LBDUSite.WebAPI.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;

namespace LBDUSite.WebAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AddressController : BaseApiController
    {
        private readonly IRepositoryFactory _repo;

        public AddressController(IRepositoryFactory repo)
        {
            _repo = repo;
        }

        /// <summary>
        /// Get all provinces
        /// </summary>
        [Route("provinces")]
        [HttpGet]
        public IActionResult GetProvinces()
        {
            try
            {
                var provinces = _repo.FindAll<Province>();
                return Ok(provinces);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get districts by province
        /// </summary>
        [Route("districts/{provinceId}")]
        [HttpGet]
        public IActionResult GetDistricts(int provinceId)
        {
            try
            {
                var districts = _repo.FindAll<District>(new { provinceId = provinceId });
                return Ok(districts);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get subdistricts by district
        /// </summary>
        [Route("subdistricts/{districtId}")]
        [HttpGet]
        public IActionResult GetSubDistricts(int districtId)
        {
            try
            {
                var subdistricts = _repo.FindAll<SubDistrict>(new { districtId = districtId });
                 
                return Ok(subdistricts);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get customer addresses
        /// </summary>
        [Route("customer/{customerId}")]
        [HttpGet]
        public IActionResult GetCustomerAddresses(long customerId)
        {
            try
            {
                var addresses = _repo.Fetch<CustomerAddress>()
                    .Where(new { customerId = customerId, isActive = true })
                    .Include<Province>()
                    .Include<District>()
                    .Include<SubDistrict>()
                    .ToList();

                return Ok(addresses);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get address by ID
        /// </summary>
        [Route("get/{id}")]
        [HttpGet]
        public IActionResult Get(long id)
        {
            try
            {
                var address = _repo.Fetch<CustomerAddress>()
                    .Where(new { id = id })
                    .Include<Province>()
                    .Include<District>()
                    .Include<SubDistrict>()
                    .FirstOrDefault();

                if (address == null)
                    return NotFound(new { message = "Address not found" });

                return Ok(address);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Create or Update customer address
        /// </summary>
        [Route("post")]
        [HttpPost]
        public IActionResult Post( CustomerAddress address)
        {
            try
            {
                if (address == null)
                    return BadRequest(new { message = "Invalid data" });

                // Validate customer exists
                var customer = _repo.FindById<Customer>(address.CustomerId);
                if (customer == null)
                    return BadRequest(new { message = "Customer not found" });

                if (address.Id > 0)
                {
                    // Update
                    _repo.Update(address);
                }
                else
                {
                    // Insert
                    address.IsActive = true;
                    address.CreatedAt = DateTime.Now;
                    address.Id = _repo.Insert(address);
                }

                // If set as primary, unset other addresses
                if (address.IsPrimary == true)
                {
                    SetAsPrimary(address.CustomerId, address.Id, address.AddressType);
                }

                return Ok(new
                {
                    message = "Saved successfully",
                    data = address
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Delete address (soft delete)
        /// </summary>
        [Route("delete/{id}")]
        [HttpDelete]
        public IActionResult Delete(long id)
        {
            try
            {
                var address = _repo.FindById<CustomerAddress>(id);
                if (address == null)
                    return NotFound(new { message = "Address not found" });

                address.IsActive = false;
                _repo.Update(address);

                return Ok(new { message = "Deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Set address as primary
        /// </summary>
        [Route("set-primary/{id}")]
        [HttpPut]
        public IActionResult SetPrimary(long id)
        {
            try
            {
                var address = _repo.FindById<CustomerAddress>(id);
                if (address == null)
                    return NotFound(new { message = "Address not found" });

                SetAsPrimary(address.CustomerId, address.Id, address.AddressType);

                return Ok(new { message = "Set as primary successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        #region Private Methods

        private void SetAsPrimary(long customerId, long addressId, string addressType)
        {
            // Unset all primary for same customer and address type
            var addresses = _repo.FindAll<CustomerAddress>(new { customerId = customerId, addressType = addressType, isActive = true });
 
            foreach (var addr in addresses)
            {
                if (addr.Id == addressId)
                {
                    addr.IsPrimary = true;
                }
                else
                {
                    addr.IsPrimary = false;
                }
                _repo.Update(addr);
            }
        }

        #endregion
    }
}