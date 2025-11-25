using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LBDUSite.Models
{
    using System.Collections.Generic;
    using System.Dynamic;

   
    public class DynamicParameters
    {
        private readonly List<KeyValuePair<string, object>> _parameters = new();
        private readonly List<string> _conditions = new();
        private int _paramIndex = 0;

        public void Add(object value, string conditionTemplate)
        {
            string paramName = "@p" + _paramIndex++;
            _parameters.Add(new KeyValuePair<string, object>(paramName, value));

            string condition = conditionTemplate.Replace("?", paramName);
            _conditions.Add(condition);
        }

        public (string condition, object param) Build()
        {
            string condition = _conditions.Count > 0
                ? "WHERE " + string.Join(" AND ", _conditions)
                : "";

            if (_parameters.Count == 0)
                return (condition, new { });

            var expando = new ExpandoObject() as IDictionary<string, object>;
            foreach (var pair in _parameters)
            {
                expando[pair.Key.TrimStart('@')] = pair.Value;
            }

            return (condition, expando);
        }
    }

}
