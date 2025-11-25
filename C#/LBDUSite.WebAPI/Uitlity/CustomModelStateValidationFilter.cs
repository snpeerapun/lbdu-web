using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace LBDUSite.WebAPI.Utility
{
    public class CustomModelStateValidationFilter : ActionFilterAttribute
    {

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            if (!context.ModelState.IsValid)
            {
                var errorMessages = context.ModelState.Values.SelectMany(v => v.Errors)
                                                             .Select(e => e.ErrorMessage)
                                                             .ToList();

                string errorMessage = string.Join(", ", errorMessages);
                context.Result = new BadRequestObjectResult(errorMessage);
            }

            base.OnActionExecuting(context);
        }
    }
}
