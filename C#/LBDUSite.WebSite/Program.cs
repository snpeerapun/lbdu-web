using LBDUSite.Repository;
using LBDUSite.Repository.Interfaces;
using LBDUSite.Services;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.Extensions.Options;
using System.Globalization;
using System.IO.Compression;

var builder = WebApplication.CreateBuilder(args);

// ==================== CONFIGURATION ====================
var configuration = builder.Configuration;

// ==================== LOGGING ====================
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

// ==================== SERVICES ====================

// 1. Add Localization Services
// ในส่วน Services Configuration
builder.Services.AddLocalization(options =>
{
    options.ResourcesPath = "Resources";
});

// Configure Supported Cultures
var supportedCultures = new[]
{
    new CultureInfo("th-TH"),
    new CultureInfo("en-US")
};

builder.Services.Configure<RequestLocalizationOptions>(options =>
{
    options.DefaultRequestCulture = new RequestCulture("th-TH");
    options.SupportedCultures = supportedCultures;
    options.SupportedUICultures = supportedCultures;
    options.FallBackToParentCultures = true;
    options.FallBackToParentUICultures = true;

    options.RequestCultureProviders = new List<IRequestCultureProvider>
    {
        new CookieRequestCultureProvider(),
        new QueryStringRequestCultureProvider(),
        new AcceptLanguageHeaderRequestCultureProvider()
    };
});

builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(60); // Session timeout 60 นาที
    options.Cookie.HttpOnly = true; // เพื่อความปลอดภัย
    options.Cookie.IsEssential = true;
    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
});

// 3. Register Localization Service
builder.Services.AddScoped<ILocalizationService, LocalizationService>();

// 4. Add HttpContextAccessor (ต้องมีสำหรับ LocalizationService)
builder.Services.AddHttpContextAccessor();

// 5. MVC with JSON options
builder.Services.AddControllersWithViews()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
        options.JsonSerializerOptions.WriteIndented = true;
    });

// 6. Repository Factory - Scoped lifecycle
builder.Services.AddScoped<IRepositoryFactory>(provider =>
{
    var config = provider.GetRequiredService<IConfiguration>();
    return new RepositoryFactory(config);
});

// 7. Cache Service
builder.Services.AddSingleton<ICacheService, MemoryCacheService>();
builder.Services.AddMemoryCache();

// 8. Session (ลบการเรียกซ้ำออก - ใช้แค่ครั้งเดียว)
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromHours(2);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.Cookie.Name = ".LBDUSite.Session";
});

// 9. Response Caching
builder.Services.AddResponseCaching();

// 10. Response Compression
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
});

builder.Services.Configure<BrotliCompressionProviderOptions>(options =>
{
    options.Level = CompressionLevel.Fastest;
});

builder.Services.Configure<GzipCompressionProviderOptions>(options =>
{
    options.Level = CompressionLevel.SmallestSize;
});

// 11. HTTP Client for external APIs
builder.Services.AddHttpClient("SECApi", client =>
{
    client.BaseAddress = new Uri(configuration["ExternalAPIs:SEC:BaseUrl"] ?? "https://api.sec.or.th/");
    client.Timeout = TimeSpan.FromSeconds(30);
});

// 12. Anti-forgery
builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-CSRF-TOKEN";
    options.Cookie.Name = ".LBDUSite.Antiforgery";
});

// ==================== BUILD APP ====================
var app = builder.Build();

// ==================== MIDDLEWARE PIPELINE ====================

// Exception Handling
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

// Response Compression
app.UseResponseCompression();

// HTTPS Redirection
app.UseHttpsRedirection();

// Static Files
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        if (app.Environment.IsProduction())
        {
            ctx.Context.Response.Headers.Append("Cache-Control", "public,max-age=604800");
        }
    }
});

// ✅ CRITICAL: Localization ต้องอยู่ก่อน UseRouting()
app.UseRequestLocalization(app.Services.GetRequiredService<IOptions<RequestLocalizationOptions>>().Value);

// Routing
app.UseRouting();

// Session (ต้องอยู่หลัง UseRouting แต่ก่อน UseEndpoints)
app.UseSession();

// Authentication & Authorization
app.UseAuthorization();

// Response Caching
app.UseResponseCaching();

// ==================== ROUTING ====================
app.MapControllerRoute(
    name: "admin",
    pattern: "Admin/{controller=Dashboard}/{action=Index}/{id?}",
    defaults: new { area = "Admin" }
);
// Default route - flexible for all controllers
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");
 
// ==================== RUN ====================
app.Run();