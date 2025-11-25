using Microsoft.Extensions.Localization;
using System.Reflection;

namespace LBDUSite.Services
{
    public interface ILocalizationService
    {
        string GetString(string key);
        string GetString(string key, params object[] args);
        string GetCurrentLanguage();
        void SetLanguage(string culture);
    }

    public class LocalizationService : ILocalizationService
    {
        private readonly IStringLocalizer _localizer;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private string _currentLanguage = "th";

        public LocalizationService(
            IStringLocalizerFactory factory,
            IHttpContextAccessor httpContextAccessor)
        {
            var type = typeof(Resources);
            var assemblyName = new AssemblyName(type.GetTypeInfo().Assembly.FullName);
            _localizer = factory.Create("Resources", assemblyName.Name);
            _httpContextAccessor = httpContextAccessor;

            // ดึงภาษาจาก Cookie หรือ Session
            var context = _httpContextAccessor.HttpContext;
            if (context != null)
            {
                if (context.Request.Cookies.TryGetValue("Language", out var language))
                {
                    _currentLanguage = language;
                }
                else if (context.Session.GetString("Language") != null)
                {
                    _currentLanguage = context.Session.GetString("Language") ?? "th";
                }
            }
        }

        public string GetString(string key)
        {
            return _localizer[key];
        }

        public string GetString(string key, params object[] args)
        {
            return string.Format(_localizer[key], args);
        }

        public string GetCurrentLanguage()
        {
            var context = _httpContextAccessor.HttpContext;
            if (context != null)
            {
                if (context.Request.Cookies.TryGetValue("Language", out var language))
                {
                    return language;
                }
                if (context.Session.GetString("Language") != null)
                {
                    return context.Session.GetString("Language") ?? "th";
                }
            }
            return _currentLanguage;
        }

        public void SetLanguage(string culture)
        {
            _currentLanguage = culture;
            var context = _httpContextAccessor.HttpContext;
            if (context != null)
            {
                // บันทึกลง Cookie (เก็บ 1 ปี)
                context.Response.Cookies.Append("Language", culture, new CookieOptions
                {
                    Expires = DateTimeOffset.Now.AddYears(1),
                    HttpOnly = true,
                    SameSite = SameSiteMode.Lax
                });

                // บันทึกลง Session
                context.Session.SetString("Language", culture);
            }
        }
    }

    // Empty class for resource reference
    public class Resources
    {
    }
}