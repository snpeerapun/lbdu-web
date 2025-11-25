using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace LBDUSite.Common
{
    public enum ReportFormat
    {
        PDF,
        WORD,
        EXCEL,
        PPTX,
        ZIP,
    }

    public class Parameters
    {
        private Dictionary<string, string> _params;

        public Parameters()
        {
            _params = new Dictionary<string, string>();
        }

        public void Add(string key, string value)
        {
            _params[key] = Uri.EscapeDataString(value);
        }

        public override string ToString()
        {
            return string.Join("&", _params.Select(kvp => $"{kvp.Key}={kvp.Value}"));
        }
        public string ToJson()
        {
            return JsonSerializer.Serialize(_params);
        }
        public static Parameters FromJson(string json)
        {
            var dictionary = JsonSerializer.Deserialize<Dictionary<string, string>>(json);
            var parameters = new Parameters();
            foreach (var kvp in dictionary)
            {
                parameters.Add(kvp.Key, kvp.Value);
            }
            return parameters;
        }
    }
    public class SSRSClient
    {
        private readonly HttpClient _client;

        public SSRSClient(string baseUrl, string username, string password,string domain)
        {
            var handler = new HttpClientHandler();
            if (handler.SupportsAutomaticDecompression)
            {
                handler.AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate;
            }

            // Set network credentials
            handler.Credentials = new NetworkCredential(username, password, domain);

            _client = new HttpClient(handler);
            _client.BaseAddress = new Uri(baseUrl);
            _client.DefaultRequestHeaders.Accept.Clear();
            _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/octet-stream"));
        }
 

        public async Task<byte[]> GetReportAsync(string reportPath, Parameters parameters, ReportFormat format)
        {
            
            string formatParameter = $"&rs:Format={format.ToString().ToUpper()}";
            string apiUrl = $"{reportPath}&{parameters}{formatParameter}";
            HttpResponseMessage response = await _client.GetAsync(apiUrl);
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadAsByteArrayAsync();
            }
            else
            {
                throw new Exception("Failed to retrieve report: " + response.StatusCode);
            }
        }
   
        public void SaveToFile(byte[] pdfBytes, string filePath)
        {
            using (FileStream fs = new FileStream(filePath, FileMode.Create))
            {
                fs.Write(pdfBytes, 0, pdfBytes.Length);
            }
        }
    }
}
