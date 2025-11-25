using LBDUSite.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace LBDUSite.Controllers
{
    [Route("Contact")]
    public class ContactController : BaseController
    {
        private readonly ILogger<ContactController> _logger;
        private readonly IConfiguration _configuration;

        public ContactController(
            ILogger<ContactController> logger,
            IConfiguration configuration)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }

        // GET: /Contact
        // GET: /Contact/Index
        [HttpGet("")]
        [HttpGet("Index")]
        public IActionResult Index()
        {
            ViewBag.Title = "ติดต่อเรา";
            var viewModel = new ContactViewModel();
            ViewBag.ContactInfo = new ContactInfoViewModel();
            return View(viewModel);
        }

        // POST: /Contact
        // POST: /Contact/Index
        [HttpPost("")]
        [HttpPost("Index")]
        [ValidateAntiForgeryToken]
        public IActionResult Index(ContactViewModel model)
        {
            ViewBag.Title = "ติดต่อเรา";
            ViewBag.ContactInfo = new ContactInfoViewModel();

            if (!ModelState.IsValid)
            {
                return View(model);
            }

            try
            {
                // TODO: ส่งอีเมลหรือบันทึกข้อมูลลงฐานข้อมูล
                _logger.LogInformation($"Contact form submitted by {model.Email}");

                // ตัวอย่างการบันทึกข้อมูล (ถ้าต้องการ)
                // SaveContactMessage(model);

                // ตัวอย่างการส่งอีเมล (ถ้าต้องการ)
                // await SendEmailAsync(model);

                TempData["SuccessMessage"] = "ส่งข้อความเรียบร้อยแล้ว เราจะติดต่อกลับโดยเร็วที่สุด";
                return RedirectToAction("Index");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting contact form");
                ModelState.AddModelError("", "เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่อีกครั้ง");
                return View(model);
            }
        }

        // GET: /Contact/ThankYou
        [HttpGet("ThankYou")]
        public IActionResult ThankYou()
        {
            ViewBag.Title = "ขอบคุณ";
            return View();
        }

        #region Private Methods

        // ตัวอย่างเมธอดสำหรับบันทึกข้อมูลลงฐานข้อมูล
        /*
        private void SaveContactMessage(ContactViewModel model)
        {
            var contactMessage = new ContactMessage
            {
                FullName = model.FullName,
                Email = model.Email,
                Phone = model.Phone,
                Subject = model.Subject,
                Message = model.Message,
                CreatedDate = DateTime.Now,
                IsRead = false
            };

            _repo.Insert(contactMessage);
            _repo.SaveChanges();
        }
        */

        // ตัวอย่างเมธอดสำหรับส่งอีเมล
        /*
        private async Task SendEmailAsync(ContactViewModel model)
        {
            var emailSettings = _configuration.GetSection("EmailSettings");
            var toEmail = emailSettings["ContactEmail"] ?? "info@lbdufund.com";
            
            var emailBody = $@"
                <h2>ข้อความติดต่อใหม่จากเว็บไซต์</h2>
                <p><strong>ชื่อ:</strong> {model.FullName}</p>
                <p><strong>อีเมล:</strong> {model.Email}</p>
                <p><strong>โทรศัพท์:</strong> {model.Phone}</p>
                <p><strong>หัวข้อ:</strong> {model.Subject}</p>
                <p><strong>ข้อความ:</strong></p>
                <p>{model.Message}</p>
            ";

            // ใช้ Email Service ที่คุณมีในโปรเจกต์
            // await _emailService.SendEmailAsync(toEmail, $"ติดต่อเรา: {model.Subject}", emailBody);
        }
        */

        #endregion
    }
}