using System.Net;

namespace LBDUSite.WebAPI.Models
{
  public class Response {
        public HttpStatusCode StatusCode { get; set; }
        public String Message { get; set; }
    }
}
