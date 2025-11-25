
using DocumentFormat.OpenXml.Office2016.Drawing.ChartDrawing;
using LBDUSite.Repository;
using LBDUSite.Repository.Interfaces;
using LBDUSite.WebAPI.Services;
using LBDUSite.WebAPI.Utility;
using log4net;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using System.Text.Json;

namespace LBDUSite.Web
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            /*
            var config = new ConfigurationBuilder()
           .SetBasePath(Directory.GetCurrentDirectory())
           .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
           .AddJsonFile($"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"}.json", optional: true)
           .AddJsonFile("appsettings.Development.json", optional: true) // Add this line for development
           .AddEnvironmentVariables()
           .Build();
            */
            builder.Services.AddSignalR();
          
            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            
            builder.Services.AddHttpContextAccessor();
            //builder.Services.AddScoped<HttpContextService>();
            builder.Services.AddAntiforgery(o => o.SuppressXFrameOptionsHeader = true);
            //builder.Services.AddSingleton<JobSchedulerRepository>();
            //builder.Services.AddHostedService<MyHostedService>();
            builder.Services.AddSingleton<ITaskCompletedEventHandler, TaskCompletedEventHandler>();
            builder.Services.AddMvc(options =>
            {
                options.Filters.Add(typeof(CustomExceptionFilter));
                options.Filters.Add(typeof(CustomModelStateValidationFilter));
                //options.Filters.Add<Cus>();
            });

            builder.Services.AddControllers().AddJsonOptions(o =>
            {
                o.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
                o.JsonSerializerOptions.DictionaryKeyPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
            });

            builder.Services.AddControllers(
               options => options.SuppressImplicitRequiredAttributeForNonNullableReferenceTypes = true


            );

            //builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
            //builder.Services.AddScoped<IRepositoryFactory, RepositoryFactory>();
            builder.Services.AddScoped<IRepositoryFactory, RepositoryFactory>();


            // 🔹 ลงทะเบียน LdapService
            builder.Services.AddSingleton<LdapService>();


            //builder.Services.Configure<ApiBehaviorOptions>(options =>
            //{
            //    options.SuppressModelStateInvalidFilter = true;
            //});

            // Add JWT Authentication Middleware - This code will intercept HTTP request and validate the JWT.
            var key = Encoding.UTF8.GetBytes(builder.Configuration.GetSection("AppSettings:Token").Value);
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(
                    opt => {
                        opt.TokenValidationParameters = new TokenValidationParameters
                        {
                            ValidateLifetime =true,
                            ValidateIssuerSigningKey = true,
                            IssuerSigningKey = new SymmetricSecurityKey(key),
                            ValidateIssuer = false,
                            ValidateAudience = false
                        };
                    }
                  );

            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "My API", Version = "v1" });
                        // Configure Swagger to include the authorization header
                        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                        {
                            Description = "JWT Authorization header using the Bearer scheme.",
                            Type = SecuritySchemeType.Http,
                            Scheme = "Bearer"
                        });
                        c.AddSecurityRequirement(new OpenApiSecurityRequirement
                        {
                            {
                                new OpenApiSecurityScheme
                                {
                                    Reference = new OpenApiReference
                                    {
                                        Type = ReferenceType.SecurityScheme,
                                        Id = "Bearer"
                                    }
                                },
                                Array.Empty<string>()
                            }
                        });
             });


            builder.Services.AddAuthorization();

            var app = builder.Build();
            //web socket
           

            var httpContextAccessor = app.Services.GetRequiredService<IHttpContextAccessor>();
            HttpContextService.Configuration(httpContextAccessor);           
            Helper.Configure(httpContextAccessor, builder.Configuration);
            Log4NetConfigService.Configure();


            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI();
            } 
            else
            {
               
                app.UseExceptionHandler("/Error");
                app.UseHsts();
            }


            app.UseCors(policy =>
            policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod()
            );

            app.UseHttpsRedirection();

            //https://referbruv.com/blog/building-custom-responses-for-unauthorized-requests-in-aspnet-core/
            /*
            app.Use(async (context, next) =>
            {
                await next();

                if (context.Response.StatusCode == (int)System.Net.HttpStatusCode.Unauthorized)
                {
                    await context.Response.WriteAsync("Token Validation Has Failed. Request Access Denied");
                }
            });
            */
      
            //app.UseMiddleware<ErrorHandlerMiddleware>();

            app.MapControllerRoute(
                name: "default",
                pattern: "{controller=Home}/{action=Index}/{id?}");

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot")),
                RequestPath = string.Empty,
                ServeUnknownFileTypes = true,

            });
            app.MapFallbackToFile("index.html");
            app.MapHub<ChatHub>("/chathub");
            //app.MapHub<ChatHub>("/chathub").RequireCors("AllowSpecificOrigin");
            app.MapControllers();
         
          
            app.Run();
        }
    }
}