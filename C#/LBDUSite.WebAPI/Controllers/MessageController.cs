using LBDUSite.WebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace LBDUSite.WebAPI.Controllers
{
    [ApiController]
    [AllowAnonymous]
    public class MessageController : BaseApiController
    {
        private readonly IHubContext<ChatHub> _hubContext;

        public MessageController(IHubContext<ChatHub> hubContext)
        {
            _hubContext = hubContext;
        }

        [HttpGet("send")]
        public async Task<IActionResult> SendMessage([FromQuery] string user, [FromQuery] string message)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveMessage", user, message);
            return Ok();
        }
    }
}
