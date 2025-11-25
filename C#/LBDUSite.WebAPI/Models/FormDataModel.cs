using LBDUSite.Models;

namespace LBDUSite.WebAPI.Models
{
    public class FormDataModel
    {
        public string JsonData { get; set; }
        public IFormFile File { get; set; }
    }
    public class RetrieveRequest
    {
        public string Type { get; set; }
        public Dictionary<string, object> Params { get; set; }
    }
    public class UserRequest
    {
        public User User { get; set; }
        public int[] Funds { get; set; }
    }
}
