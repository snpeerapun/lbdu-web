
using System.Text;
using Microsoft.AspNetCore.Mvc;
using LBDUSite.WebAPI.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Cors;
using LBDUSite.WebAPI.Utility;
using LBDUSite.Repository;
using LBDUSite.Models;
using LBDUSite.WebAPI.Services;
using Org.BouncyCastle.Asn1.Ocsp;
namespace LBDUSite.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [EnableCors("AllowAllOrigins")]
    [ApiController]
	public class AuthController : ControllerBase
    {

		private UsersRepository usersRepository;
        private RolesRepository roleRepository;
        //private IUserService _userService;
        private readonly LdapService _ldapService;

        public AuthController(LdapService ldapService)
		{
            _ldapService = ldapService;
            usersRepository = new UsersRepository();
            roleRepository = new RolesRepository();
            //_userService = userService;
        }

        [HttpPost]
        [Route("login")]
        public   IActionResult Login([FromBody] LoginModel user)
        {
            var existingUser = usersRepository.GetByUserName(user.UserName);
            if (existingUser == null)
            {
                return BadRequest(new { message = "Invalid username or password" });
            }
            if (existingUser.LockoutEnabled==true )
            {
                return BadRequest(new { message = "Account locked. Please contact the administrator" });
            }

            // Perform authentication logic here
            User User = usersRepository.AuthenticateUser(user.UserName, user.Password);
            //bool isAuthenticated = _ldapService.AuthenticateUser(user.UserName, user.Password);

            if (User!=null)
            {
                existingUser.AccessFailedCount = 0;
                usersRepository.Update(existingUser);
                 
                List<AppConfig> appConfigs = new List<AppConfig>();
                //var menuList = menuRepository.GetSelectSubMenu(existingUser.Id);


                var obj = new
                {
                    //menu = menuList,
                    accessToken = Helper.CreateToken(user.UserName),
                    userInfo = existingUser,
                };

                return Ok(obj);
            }
            else {
                // Invalid login attempt
                // Update the failed login attempts count
                existingUser.AccessFailedCount++;
                usersRepository.Update(existingUser);
 
                int maxFailedAttempts = 3; // Set your desired maximum failed attempts count

                if (existingUser.AccessFailedCount >= maxFailedAttempts)
                {
                    // User account reached the maximum number of allowed failed login attempts
                    // Lock the account or handle the situation accordingly
                    existingUser.LockoutEnabled = true;
                    existingUser.LockoutEndDateUtc = DateTime.Now;
                    usersRepository.Update(existingUser);

                    return BadRequest(new { message = "Account locked due to too many failed login attempts" });
                }
                else
                {
                    return BadRequest(new { message = "Invalid username or password"});
                }
            }
        }

        /*
        [HttpPost, Route("login2")]
        public IActionResult Login2([FromBody]LoginModel user)
        {
            try
            {
                if (user == null)
                    return BadRequest("Invalid client request");

                MenuRepository menuRepository = new MenuRepository();
                RolesRepository roleRepository = new RolesRepository();
                User User = usersRepository.GetByUserNamePassword(user.UserName, user.Password);
                if (User != null)
                {

                    List<vwPermission> PermissionList = new List<vwPermission>();
                    List<SysMenu> MainMenuList = new List<SysMenu>();
                    roleRepository.GetMainMenuLoginAndPermissionList(out PermissionList, out MainMenuList, User.RoleId.Value);
                    if (MainMenuList != null)
                    {
                        foreach (var item in MainMenuList)
                        {
                            List<SysMenuItem> submenulist = new List<SysMenuItem>();
                            var SysMenuItem = menuRepository.GetSubMenuByMenuId(item.Id);
                            if (SysMenuItem != null)
                            {
                                foreach (var submenu in SysMenuItem)
                                {
                                    AspNetPermission perminnsion = roleRepository.getPerminnsionSubMenu(User.RoleId.Value, submenu.Id);
                                    if (perminnsion != null)
                                    {
                                        if (perminnsion.IsRead == true)
                                            submenulist.Add(submenu);
                                    }
                                }
                                item.SysMenuItem = submenulist;

                            }
                        }
                    }

                    var secretKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes("superSecretKey@345"));
                    var signinCredentials = new SigningCredentials(secretKey, SecurityAlgorithms.HmacSha256Signature);

                    var tokenHandler = new JwtSecurityTokenHandler();
                    var claims = new[] {
                            new Claim(ClaimTypes.Name, user.UserName),
                            new Claim(ClaimsIdentity.DefaultNameClaimType, user.UserName),
                            new Claim(ClaimsIdentity.DefaultRoleClaimType, roleRepository.getRole(User.RoleId.Value).Name)
                        };
                    var token = new JwtSecurityToken(
                        claims: claims,
                        expires: DateTime.UtcNow.AddDays(1),
                                signingCredentials: signinCredentials
                    );
                    //extract and assign the user of the jwt
                    var tokenString = tokenHandler.WriteToken(token);
                    var userlogin = new UserModel()
                    {
                        FullName = User.FullName,
                        PasswordSetting = User.PasswordSetting,
                        RoleId = User.RoleId,
                    };
                    var obj = new
                    {
                        token = tokenString,
                        userInfo =userlogin,
                        menuList = MainMenuList,
                        permission = PermissionList,
                    };

                    /*
                      var encoding = Encoding.GetEncoding("windows-874");
                      var json = JsonConvert.SerializeObject(obj); // Serialize ข้อมูลในรูปแบบ JSON
                      var bytes = encoding.GetBytes(json); // เข้ารหัสข้อมูลเป็น byte array
                      var base64EncodedText = Convert.ToBase64String(bytes);
                      return Ok(new { encrypt = base64EncodedText });
                     
                    return Ok(obj);
                }


                else
                {
                    return BadRequest("Username or password is incorrect");
                }
            }
            catch (Exception lexc)
            {
                return BadRequest(lexc.Message);
            }
        }
        */
      
      
        [HttpPost, Route("logout")]
		public IActionResult LogOut()
		{
			
			return Ok();
		}
        [HttpGet, Route("testapi")]
        public IActionResult TestApi()
        {
            string stringMessage = "TestApi";
            return Ok(stringMessage);
        }
    }
}