// ExpressionHelper.cs - รวมทุกอย่างไว้ที่เดียว
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace LBDUSite.Repository.Helpers
{
    #region Supporting Classes

    public class SelectInfo
    {
        public string PropertyName { get; set; }
        public string Alias { get; set; }
        public string TableAlias { get; set; }

        public string GetSqlColumn()
        {
            if (!string.IsNullOrEmpty(TableAlias))
                return $"{TableAlias}.{PropertyName}";
            return PropertyName;
        }

        public string GetSqlColumnWithAlias()
        {
            var column = GetSqlColumn();
            if (!string.IsNullOrEmpty(Alias) && Alias != PropertyName)
                return $"{column} AS {Alias}";
            return column;
        }
    }

    public class SelectBuilder
    {
        private readonly List<SelectInfo> _mainColumns = new List<SelectInfo>();

        public void AddColumn(string propertyName, string alias = null)
        {
            _mainColumns.Add(new SelectInfo
            {
                PropertyName = propertyName,
                Alias = alias ?? propertyName
            });
        }

        public bool HasSelection => _mainColumns.Any();

        public string BuildSelectClause(string tableAlias = null)
        {
            if (!HasSelection)
                return "*";

            var columns = _mainColumns.Select(col =>
            {
                var columnName = string.IsNullOrEmpty(tableAlias)
                    ? col.PropertyName
                    : $"{tableAlias}.{col.PropertyName}";

                return col.Alias != col.PropertyName
                    ? $"{columnName} AS {col.Alias}"
                    : columnName;
            });

            return string.Join(", ", columns);
        }

        public List<SelectInfo> GetColumns() => _mainColumns;

        public void Clear() => _mainColumns.Clear();
    }

    public class OrderInfo
    {
        public string PropertyName { get; set; }
        public OrderDirection Direction { get; set; }
    }

    public enum OrderDirection
    {
        Ascending,
        Descending
    }

    public class OrderByBuilder
    {
        private readonly List<OrderInfo> _orders = new List<OrderInfo>();

        public void Add(OrderInfo orderInfo)
        {
            _orders.Add(orderInfo);
        }

        public void Add(string propertyName, OrderDirection direction)
        {
            _orders.Add(new OrderInfo
            {
                PropertyName = propertyName,
                Direction = direction
            });
        }

        public bool HasOrdering => _orders.Any();

        public string Build()
        {
            if (!_orders.Any())
                return "";

            var orderClauses = _orders.Select(o =>
                $"{o.PropertyName} {(o.Direction == OrderDirection.Descending ? "DESC" : "ASC")}");

            return "ORDER BY " + string.Join(", ", orderClauses);
        }

        public void Clear() => _orders.Clear();
    }

    public class IncludeDefinition
    {
        public string PropertyName { get; set; }
        public Type PropertyType { get; set; }
        public bool IsCollection { get; set; }
        public List<IncludeDefinition> NestedIncludes { get; set; }
        public List<SelectInfo> SelectedFields { get; set; }

        public bool HasNestedIncludes => NestedIncludes != null && NestedIncludes.Count > 0;
        public bool HasSelectedFields => SelectedFields != null && SelectedFields.Count > 0;
    }

    #endregion

    #region Expression Parser
 
    public static class ExpressionHelper
    {
        /// <summary>
        /// Get property name from expression: u => u.FullName
        /// </summary>
        public static string GetPropertyName<T>(Expression<Func<T, object>> expression)
        {
            return GetPropertyNameInternal(expression.Body);
        }

        /// <summary>
        /// Get property name from generic expression (for Include)
        /// </summary>
        public static string GetPropertyName<T, TProperty>(Expression<Func<T, TProperty>> expression)
        {
            return GetPropertyNameInternal(expression.Body);
        }

        /// <summary>
        /// Get property name from IEnumerable expression (for Include collections)
        /// </summary>
        public static string GetPropertyName<T, TProperty>(Expression<Func<T, IEnumerable<TProperty>>> expression)
        {
            return GetPropertyNameInternal(expression.Body);
        }

        /// <summary>
        /// Internal method to extract property name from expression body
        /// </summary>
        private static string GetPropertyNameInternal(Expression expression)
        {
            if (expression is MemberExpression memberExpression)
            {
                return memberExpression.Member.Name;
            }

            if (expression is UnaryExpression unaryExpression &&
                unaryExpression.Operand is MemberExpression operand)
            {
                return operand.Member.Name;
            }

            throw new ArgumentException("Invalid expression - cannot extract property name");
        }

        /// <summary>
        /// Parse Select expression: u => new { u.Id, u.FullName, u.Email }
        /// </summary>
        public static List<SelectInfo> ParseSelect<T>(Expression<Func<T, object>> selector)
        {
            var columns = new List<SelectInfo>();

            if (selector.Body is NewExpression newExpression)
            {
                // Anonymous type: new { u.Id, u.FullName }
                for (int i = 0; i < newExpression.Members.Count; i++)
                {
                    var member = newExpression.Members[i];
                    var argument = newExpression.Arguments[i];

                    string propertyName = null;

                    if (argument is MemberExpression memberExpr)
                    {
                        propertyName = memberExpr.Member.Name;
                    }
                    else if (argument is UnaryExpression unaryExpr &&
                             unaryExpr.Operand is MemberExpression memberOperand)
                    {
                        propertyName = memberOperand.Member.Name;
                    }

                    if (propertyName != null)
                    {
                        columns.Add(new SelectInfo
                        {
                            PropertyName = propertyName,
                            Alias = member.Name
                        });
                    }
                }
            }
            else if (selector.Body is MemberExpression memberExpression)
            {
                // Single property: u => u.FullName
                columns.Add(new SelectInfo
                {
                    PropertyName = memberExpression.Member.Name,
                    Alias = memberExpression.Member.Name
                });
            }
            else if (selector.Body is UnaryExpression unaryExpression &&
                     unaryExpression.Operand is MemberExpression operand)
            {
                // Boxed value type: u => u.Id
                columns.Add(new SelectInfo
                {
                    PropertyName = operand.Member.Name,
                    Alias = operand.Member.Name
                });
            }

            return columns;
        }

        /// <summary>
        /// Parse OrderBy expression
        /// </summary>
        public static OrderInfo ParseOrderBy<T>(Expression<Func<T, object>> keySelector)
        {
            var direction = OrderDirection.Ascending;
            string propertyName = null;

            if (keySelector.Body is MethodCallExpression methodCall)
            {
                // Handle .Desc() extension
                if (methodCall.Method.Name == "Desc")
                {
                    direction = OrderDirection.Descending;

                    if (methodCall.Arguments[0] is MemberExpression memberArg)
                    {
                        propertyName = memberArg.Member.Name;
                    }
                    else if (methodCall.Arguments[0] is UnaryExpression unaryArg &&
                             unaryArg.Operand is MemberExpression operandArg)
                    {
                        propertyName = operandArg.Member.Name;
                    }
                }
            }
            else if (keySelector.Body is MemberExpression memberExpression)
            {
                propertyName = memberExpression.Member.Name;
            }
            else if (keySelector.Body is UnaryExpression unaryExpression &&
                     unaryExpression.Operand is MemberExpression operand)
            {
                propertyName = operand.Member.Name;
            }

            if (string.IsNullOrEmpty(propertyName))
                throw new ArgumentException("Invalid order by expression");

            return new OrderInfo
            {
                PropertyName = propertyName,
                Direction = direction
            };
        }
    }
 
    #endregion

    #region Extensions

    public static class OrderByExtensions
    {
        public static object Desc(this object value) => value;
    }

    #endregion
}