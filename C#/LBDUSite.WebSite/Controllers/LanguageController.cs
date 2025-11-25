using LBDUSite.Services;
using Microsoft.AspNetCore.Mvc;

namespace LBDUSite.Controllers
{
    [Route("Language")]
    public class LanguageController : Controller
    {
        private readonly ILocalizationService _localization;

        public LanguageController(ILocalizationService localization)
        {
            _localization = localization ?? throw new ArgumentNullException(nameof(localization));
        }

        // GET: /Language/Change?lang=en&returnUrl=/
        [HttpGet("Change")]
        public IActionResult Change(string lang, string? returnUrl = null)
        {
            if (string.IsNullOrEmpty(lang) || (lang != "th" && lang != "en"))
            {
                lang = "th"; // Default to Thai
            }

            // เปลี่ยนภาษา
            _localization.SetLanguage(lang);

            // Redirect กลับไปหน้าเดิม
            if (!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl))
            {
                return Redirect(returnUrl);
            }

            // ถ้าไม่มี returnUrl ให้กลับไปหน้าแรก
            return RedirectToAction("Index", "Home");
        }

        // API สำหรับ AJAX
        // POST: /Language/SetLanguage
        [HttpGet("SetLanguage")]
        public IActionResult SetLanguage([FromBody] LanguageRequest request)
        {
            if (string.IsNullOrEmpty(request.Language) ||
                (request.Language != "th" && request.Language != "en"))
            {
                return BadRequest(new { success = false, message = "Invalid language code" });
            }

            _localization.SetLanguage(request.Language);

            return Ok(new { success = true, language = request.Language });
        }

        // GET: /Language/Current
        [HttpGet("Current")]
        public IActionResult Current()
        {
            var currentLang = _localization.GetCurrentLanguage();
            return Ok(new { language = currentLang });
        }
    }

    public class LanguageRequest
    {
        public string Language { get; set; }
    }
}