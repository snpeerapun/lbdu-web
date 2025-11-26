using LBDUSite.Services;
using Microsoft.AspNetCore.Localization;
using Microsoft.Extensions.Localization;
using System.Globalization;
using System.Reflection;

namespace LBDUSite.Services
{
    public interface ILocalizationService
    {
        string GetString(string key);
        string GetString(string key, params object[] args);
        string GetCurrentLanguage();
    }

    public class LocalizationService : ILocalizationService
    {
        private readonly IStringLocalizer _localizer;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public LocalizationService(
            IStringLocalizerFactory factory,
            IHttpContextAccessor httpContextAccessor)
        {
            var type = typeof(Resources);
            var assemblyName = new AssemblyName(type.GetTypeInfo().Assembly.FullName);
            _localizer = factory.Create("Resources", assemblyName.Name);
            _httpContextAccessor = httpContextAccessor;
        }

        public string GetString(string key)
        {
            // ใช้ Culture ที่ถูกตั้งค่าโดย ASP.NET Core Localization Middleware
            var localizedString = _localizer[key];

            // ถ้าไม่เจอ ให้ return key กลับไป
            if (localizedString.ResourceNotFound)
            {
                return $"[{key}]"; // แสดงว่าไม่เจอ resource
            }

            return localizedString.Value;
        }

        public string GetString(string key, params object[] args)
        {
            var format = GetString(key);
            return string.Format(format, args);
        }

        public string GetCurrentLanguage()
        {
            // ดึงจาก CurrentCulture ที่ ASP.NET Core ตั้งค่าไว้
            var culture = CultureInfo.CurrentCulture.Name;

            if (culture.StartsWith("th"))
                return "th";
            else if (culture.StartsWith("en"))
                return "en";

            return "th"; // Default
        }
    }

    public class Resources
    {
    }
}
 