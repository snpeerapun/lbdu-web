using LBDUSite.Models;
using Org.BouncyCastle.Crypto.Generators;

namespace LBDUSite.Services
{
    public interface IAdminAuthService
    {
        Task<AdminUser> ValidateUserAsync(string username, string password);
        Task<bool> HasPermissionAsync(string username, string module, string action);
        Task<List<string>> GetUserPermissionsAsync(string username);
        string HashPassword(string password);
        bool VerifyPassword(string password, string passwordHash);
        Task LogActivityAsync(string username, string action, string module, string details, string ipAddress);
    }

    public class AdminAuthService : IAdminAuthService
    {
        // TODO: Inject DbContext or Repository

        public async Task<User> ValidateUserAsync(string username, string password)
        {
            // TODO: Query from database
            // Mock data for demo
             
            return null;
        }

        public async Task<bool> HasPermissionAsync(string username, string module, string action)
        {
            // TODO: Check from database
            var user = await GetUserByUsernameAsync(username);

          

            // TODO: Check specific role permissions from database
            return true;
        }

        public async Task<List<string>> GetUserPermissionsAsync(string username)
        {
            // TODO: Get from database
            return new List<string>
            {
                "Dashboard.View",
                "Users.View",
                "Users.Create",
                "Users.Edit",
                "Settings.View"
            };
        }

        public string HashPassword(string password)
        {
            // Using BCrypt or similar
            // return BCrypt .BCrypt.HashPassword(password);
            return "true";
        }

        public bool VerifyPassword(string password, string passwordHash)
        {
            //return BCrypt.Net.BCrypt.Verify(password, passwordHash);
            return true;
        }

        public async Task LogActivityAsync(string username, string action, string module, string details, string ipAddress)
        {
            // TODO: Save to database
            var log = new ActivityLog
            {
                Username = username,
                Action = action,
                Module = module,
                Details = details,
                IpAddress = ipAddress,
                CreatedAt = DateTime.Now
            };

            // await _context.ActivityLogs.AddAsync(log);
            // await _context.SaveChangesAsync();
        }

        private async Task<User> GetUserByUsernameAsync(string username)
        {
            // TODO: Get from database
            return null;
        }

        Task<AdminUser> IAdminAuthService.ValidateUserAsync(string username, string password)
        {
            throw new NotImplementedException();
        }
    }
}