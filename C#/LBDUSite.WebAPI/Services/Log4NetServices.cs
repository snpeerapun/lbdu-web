using log4net;
using System.Reflection;
using System.Xml;

namespace LBDUSite.WebAPI.Services
{
    public static class Log4NetConfigService
    {

        public static void Configure()
        {
            XmlDocument log4netConfig = new XmlDocument();
            log4netConfig.Load(File.OpenRead("log4net.config"));
            var repo = LogManager.CreateRepository(Assembly.GetEntryAssembly(), typeof(log4net.Repository.Hierarchy.Hierarchy));
            log4net.Config.XmlConfigurator.Configure(repo, log4netConfig["log4net"]);
            log4net.Util.LogLog.InternalDebugging = true;

        }
    }
}
