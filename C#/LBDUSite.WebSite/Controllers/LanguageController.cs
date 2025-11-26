using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc;

namespace LBDUSite.Controllers
{
    public class LanguageController : Controller
    {
        [HttpGet]
        public IActionResult Change(string lang, string returnUrl = "/")
        {
            // Validate และแปลง lang เป็น culture code
            string culture;
            if (lang == "th")
                culture = "th-TH";
            else if (lang == "en")
                culture = "en-US";
            else
                culture = "th-TH"; // Default

            // ตั้งค่า Cookie สำหรับ ASP.NET Core Localization
            Response.Cookies.Append(
                CookieRequestCultureProvider.DefaultCookieName,
                CookieRequestCultureProvider.MakeCookieValue(new RequestCulture(culture)),
                new CookieOptions
                {
                    Expires = DateTimeOffset.UtcNow.AddYears(1),
                    HttpOnly = true,
                    SameSite = SameSiteMode.Lax,
                    IsEssential = true,
                    Path = "/"
                }
            );

            // ตั้งค่า Cookie เสริมสำหรับ Custom ของคุณ (ถ้าต้องการ)
            Response.Cookies.Append(
                "Language",
                lang,
                new CookieOptions
                {
                    Expires = DateTimeOffset.UtcNow.AddYears(1),
                    HttpOnly = true,
                    SameSite = SameSiteMode.Lax,
                    Path = "/"
                }
            );

            // Redirect back
            if (string.IsNullOrEmpty(returnUrl) || !Url.IsLocalUrl(returnUrl))
            {
                returnUrl = "/";
            }

            return LocalRedirect(returnUrl);
        }
    }
}