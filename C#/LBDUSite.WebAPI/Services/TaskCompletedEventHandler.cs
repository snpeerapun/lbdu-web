using Microsoft.AspNetCore.SignalR;

namespace LBDUSite.WebAPI.Services
{
    public class TaskCompletedEvent
    {
        public string Message { get; set; }
    }
    public interface ITaskCompletedEventHandler
    {
        Task Handle(TaskCompletedEvent taskCompletedEvent);
    }

    public class TaskCompletedEventHandler : ITaskCompletedEventHandler
    {
        private readonly IHubContext<ChatHub> _hubContext;

        public TaskCompletedEventHandler(IHubContext<ChatHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task Handle(TaskCompletedEvent taskCompletedEvent)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "System", taskCompletedEvent.Message);
        }
    }

}
