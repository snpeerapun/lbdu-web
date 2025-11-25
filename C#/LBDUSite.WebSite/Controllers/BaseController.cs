using Microsoft.AspNetCore.Mvc;

namespace LBDUSite.Controllers
{
    public class BaseController : Controller
    {
        protected IActionResult HttpNotFound()
        {
            Response.StatusCode = 404;
            return View("~/Views/Shared/NotFound.cshtml");
        }

        protected IActionResult HttpNotFound(string message)
        {
            Response.StatusCode = 404;
            ViewBag.Message = message;
            return View("~/Views/Shared/NotFound.cshtml");
        }

        protected IActionResult BadRequest(string message)
        {
            Response.StatusCode = 400;
            ViewBag.Message = message;
            return View("~/Views/Shared/Error.cshtml");
        }

        protected IActionResult InternalServerError(string message = "เกิดข้อผิดพลาดภายในระบบ")
        {
            Response.StatusCode = 500;
            ViewBag.Message = message;
            return View("~/Views/Shared/Error.cshtml");
        }

        protected IActionResult Forbidden(string message = "คุณไม่มีสิทธิ์เข้าถึงหน้านี้")
        {
            Response.StatusCode = 403;
            ViewBag.Message = message;
            return View("~/Views/Shared/Error.cshtml");
        }
    }
}