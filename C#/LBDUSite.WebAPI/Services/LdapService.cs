using System;
using System.DirectoryServices.AccountManagement;
using Microsoft.Extensions.Configuration;

namespace LBDUSite.WebAPI.Services
{
  
    public class LdapService
    {
        private readonly string _domain;

        public LdapService(IConfiguration configuration)
        {
            _domain ="lhfund.co.th";
        }

        // 🔹 เช็คว่า User สามารถ Login ได้หรือไม่
        public bool AuthenticateUser(string username, string password)
        {
            try
            {
                using (PrincipalContext context = new PrincipalContext(ContextType.Domain, _domain))
                {
                    return context.ValidateCredentials(username, password);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"LDAP Error: {ex.Message}");
                return false;
            }
        }

        // 🔹 ดึงข้อมูลของ User จาก AD
        public string GetUserDetails(string username)
        {
            try
            {
                using (PrincipalContext context = new PrincipalContext(ContextType.Domain, _domain))
                using (UserPrincipal user = UserPrincipal.FindByIdentity(context, username))
                {
                    if (user == null)
                        return "User not found.";

                    return $"User: {user.DisplayName}, Email: {user.EmailAddress}";
                }
            }
            catch (Exception ex)
            {
                return $"Error: {ex.Message}";
            }
        }
    }

}
