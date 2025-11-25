 
using LBDUSite.Models;
using LBDUSite.Repository;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Configuration;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Sockets;
using System.Reflection;
using System.Resources;
using System.Security.Principal;
using System.Text;
using System.Threading.Tasks;
using System.Security.Cryptography;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.OpenSsl;
using Org.BouncyCastle.Crypto.Parameters;
using Newtonsoft.Json;

using System.Net.Mail;
using Microsoft.AspNetCore.Mvc;
using ClosedXML.Excel;
using System.Net.NetworkInformation;
using System.Text.RegularExpressions;
using LBDUSite.WebAPI.Utility;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Ionic.Zip;
using LBDUSite.WebAPI.Models;
using DocumentFormat.OpenXml.Spreadsheet;
using Newtonsoft.Json.Linq;
using System.Dynamic;


namespace LBDUSite.WebAPI.Utility
{
 
	public static class Helper
    {

        private static IHttpContextAccessor? _httpContextAccessor;
        private static IConfiguration _configuration;

        public static void Configure(IHttpContextAccessor httpContextAccessor,IConfiguration configuration)
        {
            _httpContextAccessor = httpContextAccessor;
            _configuration = configuration;
        }

        public static string GetBaseUrl()
        {
            var request = _httpContextAccessor?.HttpContext?.Request;
            var baseUrl = $"{request?.Scheme}://{request?.Host}";

            return baseUrl;
        }
        public static string CreateToken(string username)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, username)
                // Add any other claims as needed
            };
            var _token = _configuration.GetSection("AppSettings:Token").Value;
            var key = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(_token));
            var cred = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);
            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddHours(2),
                signingCredentials: cred
            );

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);

            return jwt;
        }

        public static string GetLang(HttpRequestMessage request)
		{
			var headers = request.Headers;
			var lang = "en";
			if (headers.Contains("Accept-Language"))
			{
				lang = headers.GetValues("Accept-Language").First();
			}
			return lang;
		}

		public static string GetConfig(String config)
		{
			AppConfigRepository appConfigRepository = new AppConfigRepository();
			return appConfigRepository.GetConfig(config).ConfigValue;
		}

		public static string GetIPAddress()
        {
            var host = Dns.GetHostEntry(Dns.GetHostName());
            foreach (var ip in host.AddressList)
            {
                if (ip.AddressFamily == AddressFamily.InterNetwork)
                {
                    return ip.ToString();
                }
            }
            throw new Exception("No network adapters with an IPv4 address in the system!");
        }

        public static string GenSignature2(string path, string text)
        {
            RSACryptoServiceProvider rsaPrivate = RsaProviderFromPrivateKeyInPemFile(path);
            byte[] hash = Encoding.UTF8.GetBytes(text);
            //byte[] signature = rsaPrivate.SignData(hash, CryptoConfig.CreateFromName("SHA256"));
            //byte[] signature = rsaPrivate.Encrypt(hash, false);
            byte[] signature = rsaPrivate.SignData(hash, CryptoConfig.CreateFromName("SHA256"));
            String encrptText = Convert.ToBase64String(signature);

            //byte[] signature = key.SignData(hash, CryptoConfig.CreateFromName("SHA256"));

            return encrptText.Replace('+', '-').Replace('/', '_');
        }

        public static string GetUserAgent(string UserAgent)
		{
			return UserAgent.Split('(')[1].Split(')')[0];
		}

    

        public static string GenerateOTP()
        {
            int iOTPLength = 6;
            string[] saAllowedCharacters = { "1", "2", "3", "4", "5", "6", "7", "8", "9", "0" };

            string sOTP = String.Empty;
            string sTempChars = String.Empty;
            Random rand = new Random();
            for (int i = 0; i < iOTPLength; i++)
            {
                int p = rand.Next(0, saAllowedCharacters.Length);
                sTempChars = saAllowedCharacters[rand.Next(0, saAllowedCharacters.Length)];
                sOTP += sTempChars;
            }
            return sOTP;

        }
        
        public static string GenerateActivateCode()
		{
			int iOTPLength = 6;
			string[] saAllowedCharacters = { "1", "2", "3", "4", "5", "6", "7", "8", "9", "0" };

			string Code = String.Empty;
			string sTempChars = String.Empty;
			Random rand = new Random();
			for (int i = 0; i < iOTPLength; i++)
			{
				int p = rand.Next(0, saAllowedCharacters.Length);
				sTempChars = saAllowedCharacters[rand.Next(0, saAllowedCharacters.Length)];
				Code += sTempChars;
			}
			return Code;

		}

        public static Dictionary<string, string> GetTranslations(CultureInfo cultureInfo, string baseName, Assembly assembly)
        {
            ResourceManager rm = new ResourceManager(baseName, assembly);

            using (ResourceSet rs = rm.GetResourceSet(cultureInfo, true, true))
            {
                return rs.OfType<DictionaryEntry>()
                         .ToDictionary(r => r.Key.ToString(),
                              r => r.Value.ToString());
            }
        }
         
        public static bool SendSMS(string message, string[] recepient)
		{
			bool result = false;
			List<string> msgRecepient = new List<string>();			
			//if (recepient != null && recepient.Count() > 0)
			//{
			//	msgRecepient.Add("0909233798");
			//	foreach (var mobile in recepient)
			//	{
			//		msgRecepient.Add(mobile);
			//	}
			//}
			//else
			//{
				msgRecepient.Add("0909233798");
			//}
			using (var web = new System.Net.WebClient())
			{
				try
				{
					ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls | SecurityProtocolType.Tls11 | SecurityProtocolType.Tls12; // การ set security protocol ให้ออก https ได้
					string host = System.Configuration.ConfigurationManager.AppSettings["smsHost"];
					string userName = System.Configuration.ConfigurationManager.AppSettings["smsUserName"];
					string userPassword = System.Configuration.ConfigurationManager.AppSettings["smsPassword"];

					string msgText = message;
					foreach (var msn in msgRecepient)
					{
						var postData = "User=" + userName;
						postData += "&Password=" + userPassword;
						postData += "&Sender=LHFund";
						postData += "&Msg=" + msgText;
						postData += "&Encoding=0";
						postData += "&MsgType=T";
						postData += "&RefNo=" + DateTime.Now.ToString("yyyyMMddHHmm");
						var request = (HttpWebRequest)WebRequest.Create(host);
						postData += "&Msn=" + msn;

						byte[] data = Encoding.Default.GetBytes(postData);
						request.Method = "POST";
						request.ContentType = "application/x-www-form-urlencoded";
						request.ContentLength = data.Length;
						using (var stream = request.GetRequestStream())
						{
							stream.Write(data, 0, data.Length);
						}
						var response = (HttpWebResponse)request.GetResponse();
						var responseString = new StreamReader(response.GetResponseStream()).ReadToEnd();
						if (responseString.Contains("Status=0")) result = true;
					}
				}
				catch (Exception ex)
				{
					throw (ex);
				}

			}
			return result;
        }

        public static void SendEmail(String subject, String body, string[] to, string[] cc, string[] attachments)
        {
            try
            {
                var appConfig = new AppConfigRepository().GetConfig();
                var from =appConfig[ConfigurationKey.EMAIL_FROM.ToString()];
                var fromName = appConfig[ConfigurationKey.EMAIL_FROMNAME.ToString()];
                var fromAddress = new MailAddress(from, fromName);
                var user = appConfig[ConfigurationKey.EMAIL_USER.ToString()];
                var password = appConfig[ConfigurationKey.EMAIL_PASSWORD.ToString()];
                var host = appConfig[ConfigurationKey.EMAIL_SERVER.ToString()];
                var port = int.Parse(appConfig[ConfigurationKey.EMAIL_PORT.ToString()]);

                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls | SecurityProtocolType.Tls11 | SecurityProtocolType.Tls12;

                // Ignore certificate validation errors
                ServicePointManager.ServerCertificateValidationCallback = (sender, certificate, chain, sslPolicyErrors) => true;
                var smtpClient = new SmtpClient
                {

                    Host = host, // Your SMTP server address
                    Port = port, // Your SMTP server port
                    EnableSsl = true, // Whether to use SSL/TLS encryption
                    DeliveryMethod = SmtpDeliveryMethod.Network,
                    UseDefaultCredentials = false,
                    Credentials = new NetworkCredential(user, password)
                };

                var emailMessage = new MailMessage
                {
                    From = fromAddress,
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true,

                };

                if (to != null && to.Count() > 0)
                {
                    foreach (String item in to)
                    {
                        emailMessage.To.Add(new MailAddress(item));
                    }
                }
                if (cc != null && cc.Count() > 0)
                {
                    foreach (String item in cc)
                    {
                        emailMessage.CC.Add(new MailAddress(item));
                    }
                }

                if (attachments != null && attachments.Count() > 0)
                {
                    foreach (var attachment in attachments)
                    {
                        var attachmentFile = new System.Net.Mail.Attachment(attachment);
                        emailMessage.Attachments.Add(attachmentFile);
                    }
                }




                smtpClient.Send(emailMessage);

            }
            catch (Exception ex) {
                throw   ex;
            }
        }
 
        public static string GetTemplateEmail(string lang, string folderTemplate, string nameTemplate)
		{
			var response = new HttpResponseMessage();
			var path = Path.GetFullPath("Template/" + lang + "/" + folderTemplate + "/" + nameTemplate + ".html");// get root path
			if (File.Exists(path))
			{
				response.Content = new StringContent(File.ReadAllText(path), Encoding.UTF8, "text/html");
				response.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("text/html");
				return response.Content.ReadAsStringAsync().Result;// return string content
			}
			else
				return "";

		}
      
        public static string GenerateRefOTP()
        {
            int iRefLength = 4;
            char[] saAllowedCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".ToCharArray();

            string sOTP = String.Empty;
            string sTempChars = String.Empty;
            Random rand = new Random();
            for (int i = 0; i < iRefLength; i++)
            {
                int p = rand.Next(0, saAllowedCharacters.Length);
                sTempChars = saAllowedCharacters[rand.Next(0, saAllowedCharacters.Length)].ToString();
                sOTP += sTempChars;
            }
            return sOTP;

        }
        public static string ToQueryString(this object model)
        {
            var serialized = JsonConvert.SerializeObject(model);
            var deserialized = JsonConvert.DeserializeObject<Dictionary<string, string>>(serialized);
            var result = deserialized.Select((kvp) => kvp.Key.ToString() + "=" + Uri.EscapeDataString(kvp.Value)).Aggregate((p1, p2) => p1 + "&" + p2);
            return result;
        }

  
        public static string GenSignature(string path, string text)
        {
            RSACryptoServiceProvider rsaPrivate = RsaProviderFromPrivateKeyInPemFile(path);
            byte[] hash = Encoding.UTF8.GetBytes(text);
            byte[] signature = rsaPrivate.SignData(hash, new SHA256CryptoServiceProvider());
            //byte[] signature = rsaPrivate.SignData(hash, CryptoConfig.CreateFromName("SHA256"));
            String encrptText = Convert.ToBase64String(signature);
            return encrptText;
        }
       
        public static string Decrypt(string path, string text)
        {
            RSACryptoServiceProvider rsaPrivate = RsaProviderFromPrivateKeyInPemFile(path);
            //byte[] hash = Encoding.UTF8.GetBytes(text);
            byte[] decrypteds = rsaPrivate.Decrypt(Convert.FromBase64String(text),  RSAEncryptionPadding.OaepSHA1);
         
            return System.Text.Encoding.UTF8.GetString(decrypteds); ;

        }

        public static void UnzipWithPassword(string zipFilePath,string destination, string password)
        {

            // Open the zip file for reading with the password
            using (ZipFile archive = new ZipFile(zipFilePath))
            {
                archive.Password = password;
                archive.Encryption = EncryptionAlgorithm.PkzipWeak; // the default: you might need to select the proper value here
                archive.StatusMessageTextWriter = Console.Out;

                archive.ExtractAll(destination, ExtractExistingFileAction.Throw);
            }
        }
         

        public static RSACryptoServiceProvider RsaProviderFromPrivateKeyInPemFile(string privateKeyPath)
        {
            using (TextReader privateKeyTextReader = new StringReader(File.ReadAllText(privateKeyPath)))
            {
                PemReader pr = new PemReader(privateKeyTextReader);
                AsymmetricCipherKeyPair keyPair = (AsymmetricCipherKeyPair)pr.ReadObject();
                RSAParameters rsaParams = DotNetUtilities.ToRSAParameters((RsaPrivateCrtKeyParameters)keyPair.Private);

                RSACryptoServiceProvider csp = new RSACryptoServiceProvider();
                csp.ImportParameters(rsaParams);
                return csp;
            }
        }
        public static Response Request(string url, string method, String postData, String token)
        {
            String text = "";
            try
            {
                //ServicePointManager.Expect100Continue = true;
                //ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
                ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12 | SecurityProtocolType.Tls11 | SecurityProtocolType.Tls;

                var request = WebRequest.Create(url);
                request.ContentType = "application/json; charset=utf-8";
                request.Method = method;
                if (token != "")
                {
                    request.Headers.Add("Authorization", "Bearer " + token);
                }
                if (!string.IsNullOrEmpty(postData))
                {
                    Encoding encoding = new UTF8Encoding();
                    byte[] data = encoding.GetBytes(postData);
                    request.ContentLength = data.Length;
                    Stream newStream = request.GetRequestStream(); //open connection
                    newStream.Write(data, 0, data.Length); // Send the data.
                    newStream.Close();
                }
                var response = (HttpWebResponse)request.GetResponse();
                using (var sr = new StreamReader(response.GetResponseStream()))
                {
                    text = sr.ReadToEnd();
                }
                return new Response { StatusCode=response.StatusCode, Message=text} ;
            }
            catch (WebException e)
            {
                using (WebResponse response = e.Response)
                {
                    HttpWebResponse httpResponse = (HttpWebResponse)response;
                    //Console.WriteLine("Error code: {0}", httpResponse.StatusCode);
                    using (Stream stream = response.GetResponseStream())
                    using (var reader = new StreamReader(stream))
                    {
                        text = reader.ReadToEnd();
                    }
                    return new Response { StatusCode = httpResponse.StatusCode, Message = text };
                }
            }
        }

        public static Response PostJsonSync(string url, String postData, String token)
        {
            String text = "";
            try
            {
               
                new Logger().Debug(url+":"+ postData);

                ServicePointManager.Expect100Continue = true;
                //ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
                ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12 | SecurityProtocolType.Tls11 | SecurityProtocolType.Tls;

                var request = WebRequest.Create(url);
                request.ContentType = "application/json; charset=utf-8";
                request.Method = "POST";
                if (token != "")
                {
                    request.Headers.Add("X-Auth-Token", token);
                }
                if (!string.IsNullOrEmpty(postData))
                {
                    Encoding encoding = new UTF8Encoding();
                    byte[] data = encoding.GetBytes(postData);
                    request.ContentLength = data.Length;
                    Stream newStream = request.GetRequestStream(); //open connection
                    newStream.Write(data, 0, data.Length); // Send the data.
                    newStream.Close();
                }
                var response = (HttpWebResponse)request.GetResponse();
                using (var sr = new StreamReader(response.GetResponseStream()))
                {
                    text = sr.ReadToEnd();
                }
                return new Response { StatusCode = response.StatusCode, Message = text };
            }
            catch (WebException e)
            {
                using (WebResponse response = e.Response)
                {
                    HttpWebResponse httpResponse = (HttpWebResponse)response;
                    //Console.WriteLine("Error code: {0}", httpResponse.StatusCode);
                    using (Stream stream = response.GetResponseStream())
                    using (var reader = new StreamReader(stream))
                    {
                        text = reader.ReadToEnd();
                    }
                    return new Response { StatusCode = httpResponse.StatusCode, Message = text };
                }
            }
        }
         
        public static string DownloadFIle(string url,   String token,String fileName )
        {
            
            try
            {
                //ServicePointManager.Expect100Continue = true;
                //ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
                ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12 | SecurityProtocolType.Tls11 | SecurityProtocolType.Tls;

                var request = WebRequest.Create(url);
                request.ContentType = "application/zip";
                
                request.Method = "GET";
                request.Headers.Add("Authorization", "Bearer " + token);
                request.Headers.Add("Content-Disposition", "attachment; filename=download.zip");
                //request.Headers.Add("Zip-Password-Encrypted", password);
                WebResponse response = request.GetResponse();
                Stream stream = response.GetResponseStream();
                FileStream fileStream = new FileStream(fileName, FileMode.CreateNew);
                byte[] buffer = new byte[4096];
                int bytesRead = 0;

                while ((bytesRead = stream.Read(buffer, 0, buffer.Length)) > 0)
                {
                    fileStream.Write(buffer, 0, bytesRead);
                }

                fileStream.Close();
                stream.Close();
                //response.Close();

                string password = response.Headers["Zip-Password-Encrypted"];

                return password;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public static string ReplacePlaceholders(string template, object values)
        {
            string result ="";

            var response = new HttpResponseMessage();
            var filePath = Path.GetFullPath("Template/" + template + ".html");// get root path
            result = File.ReadAllText(filePath);
             
            foreach (var property in values.GetType().GetProperties())
            {
                string placeholder = "{" + property.Name + "}";
                object replacement = property.GetValue(values, null);

                result = Regex.Replace(result, placeholder, replacement.ToString());
            }

            return result;
        }

     
        public static string GetContentTypeFromExtension(string extension)
        {
            switch (extension)
            {
                case "jpg":
                case "jpeg":
                    return "image/jpeg";
                case "png":
                    return "image/png";
                case "gif":
                    return "image/gif";
                case "pdf":
                    return "application/pdf";
                // Add more cases for other file extensions if needed
                default:
                    return "application/octet-stream";
            }
        }
        public static IActionResult ExportToExcel(
         List<dynamic> items,
         Dictionary<string, string>? columnFormats = null, // ✅ Custom column format
         Dictionary<string, string>? columnFormulas = null // ✅ Custom formulas
     )
        {
            if (items == null || items.Count == 0)
            {
                return new BadRequestObjectResult("No data available for export.");
            }

            using (var workbook = new XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add("ExportData");

                // ✅ Convert dynamic list to JSON and deserialize into Dictionary<string, object>
                string jsonString = JsonConvert.SerializeObject(items);
                var structuredData = JsonConvert.DeserializeObject<List<Dictionary<string, object>>>(jsonString);

                if (structuredData == null || structuredData.Count == 0)
                {
                    return new BadRequestObjectResult("Invalid data structure.");
                }

                // ✅ Extract column names (keys)
                var properties = structuredData.First().Keys.ToList();

                // ✅ Set headers
                for (int i = 0; i < properties.Count; i++)
                {
                    worksheet.Cell(1, i + 1).Value = properties[i];
                    worksheet.Cell(1, i + 1).Style.Font.Bold = true;
                }

                // ✅ Populate data
                for (int i = 0; i < structuredData.Count; i++)
                {
                    var row = structuredData[i];
                    for (int j = 0; j < properties.Count; j++)
                    {
                        var cell = worksheet.Cell(i + 2, j + 1);
                        var value = row[properties[j]];

                        // ✅ Set cell value
                        if (value is int || value is double || value is decimal)
                            cell.Value = Convert.ToDouble(value);
                        else if (value is DateTime dateTime)
                        {
                            cell.Value = dateTime;
                            cell.Style.DateFormat.Format = "yyyy-MM-dd";
                        }
                        else
                            cell.Value = value?.ToString();

                        // ✅ Apply column format if specified
                        if (columnFormats != null && columnFormats.TryGetValue(properties[j], out string format))
                        {
                            cell.Style.NumberFormat.Format = format;
                        }
                    }
                }

                // ✅ Apply formulas if specified
                if (columnFormulas != null)
                {
                    foreach (var columnFormula in columnFormulas)
                    {
                        string columnName = columnFormula.Key;
                        string formula = columnFormula.Value;

                        // Find the index of the column
                        int columnIndex = properties.IndexOf(columnName);
                        if (columnIndex != -1)
                        {
                            int lastRow = structuredData.Count + 1; // Last row after data
                            worksheet.Cell(lastRow + 1, columnIndex + 1).FormulaA1 = formula;
                        }
                    }
                }

                worksheet.Columns().AdjustToContents(); // ✅ Auto-adjust column width

                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    return new FileContentResult(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    {
                        FileDownloadName = $"Export_{DateTime.Now:yyyyMMddHHmmss}.xlsx"
                    };
                }
            }
        }

        // ✅ Extract property names from object (supports dynamic types)
        private static List<string> GetProperties<T>(List<T> items)
        {
            if (items == null || items.Count == 0) return new List<string>();

            var firstItem = items.First();

            switch (firstItem)
            {
                case ExpandoObject expando:
                    return ((IDictionary<string, object>)expando).Keys.ToList();
                case Dictionary<string, object> dict:
                    return dict.Keys.ToList();
                default:
                    return firstItem.GetType().GetProperties().Select(p => p.Name).ToList();
            }
        }

        private static List<object> GetValues<T>(T item, List<string> properties)
        {
            switch (item)
            {
                case ExpandoObject expando:
                    return properties.Select(p => ((IDictionary<string, object>)expando).TryGetValue(p, out var val) ? val : null).ToList();
                case Dictionary<string, object> dict:
                    return properties.Select(p => dict.ContainsKey(p) ? dict[p] : null).ToList();
                default:
                    return properties.Select(p => item?.GetType().GetProperty(p)?.GetValue(item, null)).ToList();
            }
        }

        // ✅ Set cell value with appropriate type
        private static void SetCellValue(IXLCell cell, object value)
        {
            switch (value)
            {
                case null:
                    cell.Value = "";
                    break;
                case DateTime dateTime:
                    cell.Value = dateTime;
                    cell.Style.DateFormat.Format = "yyyy-MM-dd";
                    break;
                case int intValue:
                    cell.Value = intValue;
                    break;
                case double doubleValue:
                    cell.Value = doubleValue;
                    break;
                case bool boolValue:
                    cell.Value = boolValue ? "TRUE" : "FALSE";
                    break;
                default:
                    cell.Value = value.ToString();
                    break;
            }
        }

    }
}
