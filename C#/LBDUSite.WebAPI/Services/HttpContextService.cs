namespace LBDUSite.WebAPI.Services
{
    public static class HttpContextService
    {
        public static  IHttpContextAccessor _httpContextAccessor;

        public static void Configuration(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public static HttpContext? GetHttpContext()
        {
            return _httpContextAccessor.HttpContext;
        }
    }
}
