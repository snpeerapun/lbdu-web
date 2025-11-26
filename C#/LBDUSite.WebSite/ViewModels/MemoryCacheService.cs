// Services/MemoryCacheService.cs

using Microsoft.Extensions.Caching.Memory;
using System.Collections.Concurrent;

namespace LBDUSite.Services
{
    public class MemoryCacheService : ICacheService
    {
        private readonly IMemoryCache _cache;
        private readonly ConcurrentDictionary<string, byte> _cacheKeys;

        public MemoryCacheService(IMemoryCache cache)
        {
            _cache = cache;
            _cacheKeys = new ConcurrentDictionary<string, byte>();
        }

        public void Set<T>(string key, T value, TimeSpan? expiration = null)
        {
            var options = new MemoryCacheEntryOptions();
            if (expiration.HasValue)
            {
                options.SetSlidingExpiration(expiration.Value);
            }

            _cache.Set(key, value, options);
            _cacheKeys.TryAdd(key, 0);
        }

        public void Remove(string key)
        {
            _cache.Remove(key);
            _cacheKeys.TryRemove(key, out _);
        }

        public void RemoveByPrefix(string prefix)
        {
            var keysToRemove = _cacheKeys.Keys.Where(k => k.StartsWith(prefix)).ToList();
            foreach (var key in keysToRemove)
            {
                Remove(key);
            }
        }

        public void Clear()
        {
            var keys = _cacheKeys.Keys.ToList();
            foreach (var key in keys)
            {
                Remove(key);
            }
        }

        public IEnumerable<string> GetAllKeys()
        {
            return _cacheKeys.Keys;
        }
    }
}