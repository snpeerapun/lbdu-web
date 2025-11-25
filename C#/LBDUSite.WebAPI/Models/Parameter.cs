namespace LBDUSite.WebAPI.Models

{
    using System.Text.Json;
    using Dapper;

    public class Parameters
    {
        private Dictionary<string, string> _params;

        public Parameters()
        {
            _params = new Dictionary<string, string>();
        }

        public void Add(string key, string value)
        {
            // เก็บแบบ Escape ตามดีไซน์เดิมของคุณ
            _params[key] = Uri.EscapeDataString(value ?? string.Empty);
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
            var dictionary = JsonSerializer.Deserialize<Dictionary<string, string>>(json)
                              ?? new Dictionary<string, string>();
            var parameters = new Parameters();
            foreach (var kvp in dictionary)
                parameters.Add(kvp.Key, kvp.Value);
            return parameters;
        }

        // ✅ ใช้เมื่อรับมาจาก Controller ที่ได้ JsonElement โดยตรง
        public static Parameters FromJsonElement(JsonElement json)
        {
            return FromJson(json.GetRawText());
        }

        // ✅ สำคัญ: แปลงไปเป็น DynamicParameters (สำหรับ Dapper)
        public DynamicParameters ToDynamicParameters()
        {
            var dp = new DynamicParameters();
            foreach (var kvp in _params)
            {
                // แปลงกลับจาก Escape → ค่าจริง ก่อนส่งเข้า DB
                var val = Uri.UnescapeDataString(kvp.Value ?? string.Empty);
                dp.Add(kvp.Key, val);
            }
            return dp;
        }

        // (ทางเลือก) ถ้าบางเคสคุณไม่อยาก Escape/Unescape ให้มี AddRaw
        public void AddRaw(string key, string value)
        {
            _params[key] = value;
        }
    }

}
