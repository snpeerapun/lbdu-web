using System;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using LBDUSite.WebAPI.Services;
using DocumentFormat.OpenXml.Spreadsheet;
using LBDUSite.Models;
using LBDUSite.Repository;
using LBDUSite.WebAPI;
using log4net;

namespace LBDUSite.WebAPI.Controllers
{
    [Authorize]
    [ApiController]

    public class BaseApiController : ControllerBase
    {
        //protected readonly ILogger Logger;
        
      
        protected readonly string userName;
        protected readonly User userInfo;
        protected readonly Dictionary<String, String> appConfig;
        protected readonly AuditLogRepository auditLog;
        protected static readonly ILog Logger = LogManager.GetLogger(System.Environment.MachineName);
        public BaseApiController()
        {
            HttpContext? httpContext = HttpContextService.GetHttpContext();
            var userName = httpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);

            AppConfigRepository appConfigRepository = new AppConfigRepository();
            appConfig = appConfigRepository.GetConfig();
     
            UsersRepository usersRepository = new UsersRepository();
            userInfo = usersRepository.GetByUserName(userName);

            auditLog = new AuditLogRepository();
        }

 

        public static string ReplaceTextPath(string Text)
        {
            return Text.Replace("\\", "").Replace("\"", "").Replace("..", "");
        }
    }
}

