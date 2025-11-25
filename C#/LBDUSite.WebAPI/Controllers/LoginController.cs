using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Security.Cryptography;
using LBDUSite.WebAPI.Models;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using System.Reflection;
using System.Text;
using LBDUSite.WebAPI.Utility;

namespace LBDUSite.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public LoginController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpPost("login2")]
        public IActionResult Login2([FromBody] LoginRequest model)
        {
            if (IsValidUser(model.UserName, model.Password))
            {
                // Create claims for the authenticated user
            
 
                var token = Helper.CreateToken(model.UserName);
 
                // Return the token
                return Ok(new { token = token });
            }

            // Return error response for invalid credentials
            return Unauthorized();
        }
        private bool IsValidUser(string username, string password)
        {
            // Validate the user credentials (e.g., query from a database)
            // Return true if the credentials are valid, false otherwise
            // This is just a placeholder for demonstration purposes
            return username == "admin" && password == "password";
        }

      
    }
}
