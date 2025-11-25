using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Security.Principal;
using System.Threading.Tasks;
using LBDUSite.Models;
using LBDUSite.Repository;
using LBDUSite.WebAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace LBDUSite.WebAPI.Controllers
{
    [Authorize]
    [EnableCors("AllowAllOrigins")]
    [ApiController]
    [Route("api/[controller]")]
    public class AppConfigController : BaseApiController
    {
        private AppConfigRepository appConfigRepository;
        public AppConfigController()
        {
            appConfigRepository = new AppConfigRepository();
        }


        [Route("post")]
        [HttpPost]
        public IActionResult Post(List<AppConfig> appConfigs)
        {
            try
            {
                if (appConfigs.Count>0)
                {
                    foreach (var appConfig in appConfigs) {
                        AppConfig obj = appConfigRepository.GetConfig(appConfig.ConfigKey);

                        if (obj != null)
                        {
                            obj.ConfigValue = appConfig.ConfigValue;
                            appConfigRepository.Update(obj);
                        }
                        else appConfigRepository.Insert(appConfig);
                    }
                     
                }
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Route("get")]
        [HttpGet]
        public IActionResult Get()
        {
            try
            {
                List<AppConfig> obj = appConfigRepository.GetList();
                return Ok(obj);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}