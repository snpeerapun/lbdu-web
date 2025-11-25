using LBDUSite.Repository;
using LBDUSite.Repository.Interfaces;
using LBDUSite.Services;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.ResponseCompression;
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
builder.Services.AddLocalization(options => options.ResourcesPath = "Resources");

// 2. Configure Supported Cultures
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

    // Request Culture Providers
    options.RequestCultureProviders = new List<IRequestCultureProvider>
    {
        new CookieRequestCultureProvider(),
        new QueryStringRequestCultureProvider(),
        new AcceptLanguageHeaderRequestCultureProvider()
    };
});

// 3. Register Localization Service
builder.Services.AddScoped<ILocalizationService, LocalizationService>();

// 4. Add Session (required for language switching)
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromHours(2);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

// 5. Add HttpContextAccessor
builder.Services.AddHttpContextAccessor();

// MVC with JSON options
builder.Services.AddControllersWithViews()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
        options.JsonSerializerOptions.WriteIndented = true;
    });

// Repository Factory - Scoped lifecycle
builder.Services.AddScoped<IRepositoryFactory>(provider =>
{
    var config = provider.GetRequiredService<IConfiguration>();
    return new RepositoryFactory(config);
});

builder.Services.AddSingleton<ICacheService, MemoryCacheService>();
// Memory Cache
builder.Services.AddMemoryCache();

// Session
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.Cookie.Name = ".LBDUSite.Session";
});

// Response Caching
builder.Services.AddResponseCaching();

// Response Compression
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

// HTTP Client for external APIs
builder.Services.AddHttpClient("SECApi", client =>
{
    client.BaseAddress = new Uri(configuration["ExternalAPIs:SEC:BaseUrl"] ?? "https://api.sec.or.th/");
    client.Timeout = TimeSpan.FromSeconds(30);
});

// Anti-forgery
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
    /*
    app.Use(async (context, next) =>
    {
        context.Response.Headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
        context.Response.Headers["Pragma"] = "no-cache";
        context.Response.Headers["Expires"] = "0";
        await next();
    });
    */
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
//Localization
app.UseRequestLocalization();

// Routing
app.UseRouting();

// Session
app.UseSession();

// Authentication & Authorization
app.UseAuthorization();

// Response Caching
app.UseResponseCaching();

// ==================== ROUTING (SIMPLIFIED) ====================

// ✅ Default route only - flexible for all controllers
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

// ==================== RUN ====================
app.Run();