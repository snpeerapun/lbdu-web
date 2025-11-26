using LBDUSite.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace LBDUSite.Attributes
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class AdminAuthorizeAttribute : Attribute, IAuthorizationFilter
    {
        public string Module { get; set; }
        public string Action { get; set; }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            // Check if user is authenticated
            var username = context.HttpContext.Session.GetString("AdminUsername");

            if (string.IsNullOrEmpty(username))
            {
                context.Result = new RedirectToActionResult("Login", "Admin", new { returnUrl = context.HttpContext.Request.Path });
                return;
            }

            // Check permissions if Module and Action are specified
            if (!string.IsNullOrEmpty(Module) && !string.IsNullOrEmpty(Action))
            {
                var authService = context.HttpContext.RequestServices.GetService<IAdminAuthService>();
                var hasPermission = authService.HasPermissionAsync(username, Module, Action).Result;

                if (!hasPermission)
                {
                    context.Result = new RedirectToActionResult("AccessDenied", "Admin", null);
                    return;
                }
            }
        }
    }
}