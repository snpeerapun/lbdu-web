// Services/ICacheService.cs
namespace LBDUSite.Services
{
    public interface ICacheService
    {
        void Remove(string key);
        void RemoveByPrefix(string prefix);
        void Clear();
        IEnumerable<string> GetAllKeys();
    }
}