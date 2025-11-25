using Microsoft.Extensions.Configuration;

namespace LBDUSite.Repository
{

    public static class DbConnect
    {
        public static IConfiguration Configuration { get; }

        static DbConnect()
        {
            var configurationBuilder = new ConfigurationBuilder()
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);
            Configuration = configurationBuilder.Build();
        }

        public static string DefaultConnection => Configuration.GetConnectionString("DefaultConnection");
        // Add other configuration properties here
    }

}
