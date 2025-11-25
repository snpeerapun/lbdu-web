using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace LBDUSite.WebAPI.Utility
{

   public class MyJobScheduler : BackgroundService
{
    private readonly int _intervalMinutes;
    private Timer _timer;

    public MyJobScheduler(int intervalMinutes)
    {
        _intervalMinutes = intervalMinutes;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Set up a recurring timer to run the job every 10 minutes
        _timer = new Timer(async _ =>
        {
            // Calculate the current time and the next scheduled time at the long hand, number 12 position
            DateTime now = DateTime.UtcNow;
            DateTime currentInterval = new DateTime(now.Year, now.Month, now.Day, now.Hour, now.Minute, 0);
            DateTime nextScheduledTime = currentInterval.AddMinutes(_intervalMinutes - (currentInterval.Minute % _intervalMinutes));

            // Calculate the delay until the next scheduled time
            TimeSpan delay = nextScheduledTime - DateTime.UtcNow;

            //Helper.LoadApplication();
            // Execute the job
            // Code to execute the job goes here
        }, null, TimeSpan.Zero, TimeSpan.FromMinutes(_intervalMinutes));

        // Wait for the cancellation token to be signaled
        await Task.Delay(Timeout.Infinite, stoppingToken);
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        // Stop the timer when the service is stopped
        _timer?.Change(Timeout.Infinite, 0);

        await base.StopAsync(cancellationToken);
    }
}
}
