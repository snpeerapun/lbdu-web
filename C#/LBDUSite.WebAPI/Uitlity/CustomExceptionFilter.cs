using log4net;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace LBDUSite.WebAPI.Utility
{
    public  class CustomExceptionFilter:ExceptionFilterAttribute
    {

        public override void OnException(ExceptionContext context)
        {
            // Customize this object to fit your needs
            ILog Logger = LogManager.GetLogger(System.Environment.MachineName);
            Logger.Error(context.Exception.Message, context.Exception);
            //Helper.SendEmail("error", context.Exception.StackTrace, new string[] { "yai2k5@gmail.com" }, null, null);
            var result = new ObjectResult(new
            {
                context.Exception.Message, // Or a different generic message
                context.Exception.Source,
                context.Exception.StackTrace,
                ExceptionType = context.Exception.GetType().FullName,
            })
            {
                StatusCode = (int)HttpStatusCode.InternalServerError
            };

            // Log the exception
            //_logger.LogError("Unhandled exception occurred while executing request: {ex}", context.Exception);

            // Set the result
            context.Result = result;
        }
 
    }
}
