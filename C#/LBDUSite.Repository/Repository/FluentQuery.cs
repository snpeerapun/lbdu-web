// FluentQuery.cs - Updated with OrderBy & Nested Include (ไม่มี Select fields)
using Dapper;
using LBDUSite.Repository.Interfaces;
using LBDUSite.Repository.Helpers;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Threading.Tasks;

namespace LBDUSite.Repository
{
    public class FluentQuery<T> : IFluentQuery<T> where T : class
    {
        private readonly IDbConnection _connection;
        private readonly IDbTransaction _transaction;

        private object _whereConditions;
        private string _whereSql;
        private object _whereParameters;
        private readonly List<IncludeDefinition> _includes;
        private readonly OrderByBuilder _orderByBuilder;
        private int? _take;
        private int? _skip;
        private bool _includeDeleted;

        public FluentQuery(IDbConnection connection, IDbTransaction transaction)
        {
            _connection = connection;
            _transaction = transaction;
            _includes = new List<IncludeDefinition>();
            _orderByBuilder = new OrderByBuilder();
            _includeDeleted = false;
        }

        #region Fluent Methods - Where

        public IFluentQuery<T> Where(object conditions)
        {
            _whereConditions = conditions;
            return this;
        }

        public IFluentQuery<T> Where(string sqlConditions, object parameters = null)
        {
            _whereSql = sqlConditions;
            _whereParameters = parameters;
            return this;
        }

        #endregion

        #region Fluent Methods - Include

        public IFluentQuery<T> Include<TProperty>() where TProperty : class
        {
            var propertyName = DetectPropertyName<TProperty>();
            if (!string.IsNullOrEmpty(propertyName) && !_includes.Any(i => i.PropertyName == propertyName))
            {
                _includes.Add(new IncludeDefinition
                {
                    PropertyName = propertyName,
                    PropertyType = typeof(TProperty)
                });
            }
            return this;
        }

        public IFluentQuery<T> Include(string propertyName)
        {
            if (!string.IsNullOrEmpty(propertyName) && !_includes.Any(i => i.PropertyName == propertyName))
            {
                _includes.Add(new IncludeDefinition { PropertyName = propertyName });
            }
            return this;
        }

        public IFluentQuery<T> Include(params string[] propertyNames)
        {
            if (propertyNames != null)
            {
                foreach (var name in propertyNames)
                {
                    if (!string.IsNullOrEmpty(name) && !_includes.Any(i => i.PropertyName == name))
                    {
                        _includes.Add(new IncludeDefinition { PropertyName = name });
                    }
                }
            }
            return this;
        }

        /// <summary>
        /// Include using expression: Include(u => u.Department)
        /// </summary>
        public IFluentQuery<T> Include<TProperty>(Expression<Func<T, TProperty>> navigationProperty) where TProperty : class
        {
            var propertyName = ExpressionHelper.GetPropertyName(navigationProperty);
            if (!_includes.Any(i => i.PropertyName == propertyName))
            {
                _includes.Add(new IncludeDefinition
                {
                    PropertyName = propertyName,
                    PropertyType = typeof(TProperty)
                });
            }
            return this;
        }

        /// <summary>
        /// Include collection: Include(d => d.Users)
        /// </summary>
        public IFluentQuery<T> Include<TProperty>(Expression<Func<T, IEnumerable<TProperty>>> navigationProperty) where TProperty : class
        {
            var propertyName = ExpressionHelper.GetPropertyName(navigationProperty);
            if (!_includes.Any(i => i.PropertyName == propertyName))
            {
                _includes.Add(new IncludeDefinition
                {
                    PropertyName = propertyName,
                    PropertyType = typeof(TProperty),
                    IsCollection = true
                });
            }
            return this;
        }

        /// <summary>
        /// Nested Include: Include(u => u.Department, d => d.Include(m => m.Manager))
        /// </summary>
        public IFluentQuery<T> Include<TProperty>(
            Expression<Func<T, TProperty>> navigationProperty,
            Action<IIncludeQuery<TProperty>> includeAction) where TProperty : class
        {
            var propertyName = ExpressionHelper.GetPropertyName(navigationProperty);
            var includeQuery = new IncludeQuery<TProperty>();
            includeAction?.Invoke(includeQuery);

            _includes.Add(new IncludeDefinition
            {
                PropertyName = propertyName,
                PropertyType = typeof(TProperty),
                NestedIncludes = includeQuery.Includes
            });
            return this;
        }

        #endregion

        #region Fluent Methods - OrderBy

        /// <summary>
        /// OrderBy with multiple fields and directions
        /// Examples:
        /// - OrderBy(u => u.FullName)
        /// - OrderBy(u => u.DepartmentId, u => u.FullName.Desc())
        /// </summary>
        public IFluentQuery<T> OrderBy(params Expression<Func<T, object>>[] keySelectors)
        {
            _orderByBuilder.Clear();

            if (keySelectors != null && keySelectors.Length > 0)
            {
                foreach (var selector in keySelectors)
                {
                    var orderInfo = ExpressionHelper.ParseOrderBy(selector);
                    _orderByBuilder.Add(orderInfo);
                }
            }

            return this;
        }

        /// <summary>
        /// OrderBy string (backward compatibility)
        /// </summary>
        public IFluentQuery<T> OrderBy(string orderByClause)
        {
            _orderByBuilder.Clear();

            if (!string.IsNullOrEmpty(orderByClause))
            {
                var parts = orderByClause.Split(',');
                foreach (var part in parts)
                {
                    var trimmed = part.Trim();
                    var tokens = trimmed.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);

                    if (tokens.Length > 0)
                    {
                        var propertyName = tokens[0];
                        var direction = OrderDirection.Ascending;

                        if (tokens.Length > 1 && tokens[1].Equals("DESC", StringComparison.OrdinalIgnoreCase))
                        {
                            direction = OrderDirection.Descending;
                        }

                        _orderByBuilder.Add(propertyName, direction);
                    }
                }
            }

            return this;
        }

        public IFluentQuery<T> OrderByDescending(string column)
        {
            _orderByBuilder.Clear();
            _orderByBuilder.Add(column, OrderDirection.Descending);
            return this;
        }

        #endregion

        #region Fluent Methods - Other

        public IFluentQuery<T> Take(int count)
        {
            _take = count;
            return this;
        }

        public IFluentQuery<T> Skip(int count)
        {
            _skip = count;
            return this;
        }

        public IFluentQuery<T> WithDeleted()
        {
            _includeDeleted = true;
            return this;
        }

        #endregion

        #region Terminal Operations

        public T FirstOrDefault()
        {
            var entity = ExecuteQuerySingle();
            if (entity != null && _includes.Any())
                LoadIncludes(entity);
            return entity;
        }

        public List<T> ToList()
        {
            var results = ExecuteQueryList().ToList();
            if (results.Any() && _includes.Any())
            {
                foreach (var entity in results)
                    LoadIncludes(entity);
            }
            return results;
        }

        public int Count()
        {
            var tableName = GetTableName();
            var whereClause = BuildWhereClause();
            var sql = $"SELECT COUNT(*) FROM {tableName} {whereClause}";
            var parameters = _whereParameters ?? _whereConditions;
            return _connection.ExecuteScalar<int>(sql, parameters, _transaction);
        }

        public bool Any()
        {
            return Count() > 0;
        }

        #endregion

        #region Aggregate Functions

        public TValue Sum<TValue>(string columnName)
        {
            var tableName = GetTableName();
            var whereClause = BuildWhereClause();
            var sql = $"SELECT ISNULL(SUM({columnName}), 0) FROM {tableName} {whereClause}";
            var parameters = _whereParameters ?? _whereConditions;
            return _connection.ExecuteScalar<TValue>(sql, parameters, _transaction);
        }

        public decimal Average(string columnName)
        {
            var tableName = GetTableName();
            var whereClause = BuildWhereClause();
            var sql = $"SELECT ISNULL(AVG(CAST({columnName} AS DECIMAL(18,2))), 0) FROM {tableName} {whereClause}";
            var parameters = _whereParameters ?? _whereConditions;
            return _connection.ExecuteScalar<decimal>(sql, parameters, _transaction);
        }

        public TValue Min<TValue>(string columnName)
        {
            var tableName = GetTableName();
            var whereClause = BuildWhereClause();
            var sql = $"SELECT MIN({columnName}) FROM {tableName} {whereClause}";
            var parameters = _whereParameters ?? _whereConditions;
            return _connection.ExecuteScalar<TValue>(sql, parameters, _transaction);
        }

        public TValue Max<TValue>(string columnName)
        {
            var tableName = GetTableName();
            var whereClause = BuildWhereClause();
            var sql = $"SELECT MAX({columnName}) FROM {tableName} {whereClause}";
            var parameters = _whereParameters ?? _whereConditions;
            return _connection.ExecuteScalar<TValue>(sql, parameters, _transaction);
        }

        #endregion

        #region Implicit Operators

        public static implicit operator T(FluentQuery<T> query)
        {
            return query?.FirstOrDefault();
        }

        public static implicit operator List<T>(FluentQuery<T> query)
        {
            return query?.ToList();
        }

        #endregion

        #region Async Operations

        public async Task<T> FirstOrDefaultAsync()
        {
            return await Task.Run(() => FirstOrDefault());
        }

        public async Task<List<T>> ToListAsync()
        {
            return await Task.Run(() => ToList());
        }

        public async Task<int> CountAsync()
        {
            return await Task.Run(() => Count());
        }

        public async Task<bool> AnyAsync()
        {
            return await Task.Run(() => Any());
        }

        #endregion

        #region Private Query Methods

        private T ExecuteQuerySingle()
        {
            var tableName = GetTableName();
            var whereClause = BuildWhereClause();
            var orderByClause = _orderByBuilder.Build();

            var sql = $"SELECT * FROM {tableName} {whereClause} {orderByClause}";

            var parameters = _whereParameters ?? _whereConditions;
            return _connection.QueryFirstOrDefault<T>(sql, parameters, _transaction);
        }

        private IEnumerable<T> ExecuteQueryList()
        {
            var tableName = GetTableName();
            var whereClause = BuildWhereClause();
            var orderByClause = _orderByBuilder.Build();
            var limitClause = BuildLimitClause();

            var sql = $"SELECT * FROM {tableName} {whereClause} {orderByClause} {limitClause}";

            var parameters = _whereParameters ?? _whereConditions;
            return _connection.Query<T>(sql, parameters, _transaction);
        }

        private string BuildWhereClause()
        {
            var conditions = new List<string>();

            if (!string.IsNullOrEmpty(_whereSql))
            {
                var clause = _whereSql.TrimStart();
                if (!clause.StartsWith("WHERE", StringComparison.OrdinalIgnoreCase))
                    conditions.Add(_whereSql);
                else
                    return _whereSql;
            }
            else if (_whereConditions != null)
            {
                var props = _whereConditions.GetType().GetProperties();
                foreach (var prop in props)
                    conditions.Add($"{prop.Name} = @{prop.Name}");
            }

            if (!_includeDeleted && HasIsDeletedColumn())
                conditions.Add("IsDeleted = 0");

            if (conditions.Any())
                return "WHERE " + string.Join(" AND ", conditions);

            return "";
        }

        private string BuildLimitClause()
        {
            if (_take.HasValue && _skip.HasValue)
            {
                if (!_orderByBuilder.HasOrdering)
                {
                    return $"ORDER BY (SELECT NULL) OFFSET {_skip} ROWS FETCH NEXT {_take} ROWS ONLY";
                }
                return $"OFFSET {_skip} ROWS FETCH NEXT {_take} ROWS ONLY";
            }
            else if (_take.HasValue)
            {
                if (!_orderByBuilder.HasOrdering)
                {
                    return $"ORDER BY (SELECT NULL) OFFSET 0 ROWS FETCH NEXT {_take} ROWS ONLY";
                }
                return $"OFFSET 0 ROWS FETCH NEXT {_take} ROWS ONLY";
            }
            return "";
        }

        #endregion

        #region Include Loading

        private void LoadIncludes(T entity)
        {
            if (!_includes.Any() || entity == null) return;

            foreach (var include in _includes)
                LoadInclude(entity, include);
        }

        private void LoadInclude(T entity, IncludeDefinition include)
        {
            var property = typeof(T).GetProperty(include.PropertyName);
            if (property == null) return;

            if (include.IsCollection || IsCollectionType(property.PropertyType))
            {
                LoadOneToManyRelationship(entity, property, include);
            }
            else if (property.PropertyType.IsClass && property.PropertyType != typeof(string))
            {
                LoadManyToOneRelationship(entity, property, include);
            }
        }

        private void LoadManyToOneRelationship(T entity, PropertyInfo property, IncludeDefinition include)
        {
            var foreignKeyProperty = typeof(T).GetProperty(property.Name + "Id");
            if (foreignKeyProperty == null) return;

            var foreignKeyValue = foreignKeyProperty.GetValue(entity);
            if (foreignKeyValue == null || Convert.ToInt32(foreignKeyValue) == 0) return;

            var relatedType = include.PropertyType ?? property.PropertyType;
            var tableName = GetTableNameForType(relatedType);
            var sql = $"SELECT * FROM {tableName} WHERE Id = @Id";

            var relatedEntity = _connection.Query(relatedType, sql, new { Id = foreignKeyValue }, _transaction).FirstOrDefault();

            if (relatedEntity != null)
            {
                property.SetValue(entity, relatedEntity);

                // Load nested includes
                if (include.HasNestedIncludes)
                {
                    foreach (var nestedInclude in include.NestedIncludes)
                    {
                        LoadIncludeOnEntity(relatedEntity, nestedInclude);
                    }
                }
            }
        }

        private void LoadOneToManyRelationship(T entity, PropertyInfo property, IncludeDefinition include)
        {
            var entityType = typeof(T);
            Type childType = include.PropertyType;

            if (childType == null && property.PropertyType.IsGenericType)
            {
                childType = property.PropertyType.GetGenericArguments()[0];
            }

            if (childType == null) return;

            var idProperty = entityType.GetProperty("Id");
            if (idProperty == null) return;

            var entityId = idProperty.GetValue(entity);
            if (entityId == null) return;

            var foreignKeyColumn = entityType.Name + "Id";
            var tableName = GetTableNameForType(childType);
            var sql = $"SELECT * FROM {tableName} WHERE {foreignKeyColumn} = @ParentId";

            var children = _connection.Query(childType, sql, new { ParentId = entityId }, _transaction);
            var listType = typeof(List<>).MakeGenericType(childType);
            var childList = Activator.CreateInstance(listType) as System.Collections.IList;

            foreach (var child in children)
            {
                childList?.Add(child);

                // Load nested includes for each child
                if (include.HasNestedIncludes)
                {
                    foreach (var nestedInclude in include.NestedIncludes)
                    {
                        LoadIncludeOnEntity(child, nestedInclude);
                    }
                }
            }

            property.SetValue(entity, childList);
        }

        private void LoadIncludeOnEntity(object entity, IncludeDefinition include)
        {
            if (entity == null) return;

            var entityType = entity.GetType();
            var property = entityType.GetProperty(include.PropertyName);
            if (property == null) return;

            if (include.IsCollection || IsCollectionType(property.PropertyType))
            {
                LoadOneToManyRelationshipGeneric(entity, entityType, property, include);
            }
            else if (property.PropertyType.IsClass && property.PropertyType != typeof(string))
            {
                LoadManyToOneRelationshipGeneric(entity, entityType, property, include);
            }
        }

        private void LoadManyToOneRelationshipGeneric(object entity, Type entityType, PropertyInfo property, IncludeDefinition include)
        {
            var foreignKeyProperty = entityType.GetProperty(property.Name + "Id");
            if (foreignKeyProperty == null) return;

            var foreignKeyValue = foreignKeyProperty.GetValue(entity);
            if (foreignKeyValue == null || Convert.ToInt32(foreignKeyValue) == 0) return;

            var relatedType = include.PropertyType ?? property.PropertyType;
            var tableName = GetTableNameForType(relatedType);
            var sql = $"SELECT * FROM {tableName} WHERE Id = @Id";

            var relatedEntity = _connection.Query(relatedType, sql, new { Id = foreignKeyValue }, _transaction).FirstOrDefault();

            if (relatedEntity != null)
            {
                property.SetValue(entity, relatedEntity);

                if (include.HasNestedIncludes)
                {
                    foreach (var nestedInclude in include.NestedIncludes)
                    {
                        LoadIncludeOnEntity(relatedEntity, nestedInclude);
                    }
                }
            }
        }

        private void LoadOneToManyRelationshipGeneric(object entity, Type entityType, PropertyInfo property, IncludeDefinition include)
        {
            Type childType = include.PropertyType;

            if (childType == null && property.PropertyType.IsGenericType)
            {
                childType = property.PropertyType.GetGenericArguments()[0];
            }

            if (childType == null) return;

            var idProperty = entityType.GetProperty("Id");
            if (idProperty == null) return;

            var entityId = idProperty.GetValue(entity);
            if (entityId == null) return;

            var foreignKeyColumn = entityType.Name + "Id";
            var tableName = GetTableNameForType(childType);
            var sql = $"SELECT * FROM {tableName} WHERE {foreignKeyColumn} = @ParentId";

            var children = _connection.Query(childType, sql, new { ParentId = entityId }, _transaction);
            var listType = typeof(List<>).MakeGenericType(childType);
            var childList = Activator.CreateInstance(listType) as System.Collections.IList;

            foreach (var child in children)
            {
                childList?.Add(child);

                if (include.HasNestedIncludes)
                {
                    foreach (var nestedInclude in include.NestedIncludes)
                    {
                        LoadIncludeOnEntity(child, nestedInclude);
                    }
                }
            }

            property.SetValue(entity, childList);
        }

        private bool IsCollectionType(Type type)
        {
            if (type == typeof(string)) return false;

            if (type.IsGenericType)
            {
                var genericTypeDef = type.GetGenericTypeDefinition();
                return genericTypeDef == typeof(ICollection<>) ||
                       genericTypeDef == typeof(IEnumerable<>) ||
                       genericTypeDef == typeof(List<>);
            }

            return type.GetInterfaces().Any(i =>
                i.IsGenericType &&
                (i.GetGenericTypeDefinition() == typeof(IEnumerable<>) ||
                 i.GetGenericTypeDefinition() == typeof(ICollection<>)));
        }

        private string DetectPropertyName<TProperty>() where TProperty : class
        {
            var propertyType = typeof(TProperty);
            var entityType = typeof(T);

            var exactMatch = entityType.GetProperties()
                .FirstOrDefault(p => p.PropertyType == propertyType);
            if (exactMatch != null) return exactMatch.Name;

            var collectionMatch = entityType.GetProperties()
                .FirstOrDefault(p =>
                    p.PropertyType.IsGenericType &&
                    p.PropertyType.GetGenericArguments().Any(arg => arg == propertyType));
            if (collectionMatch != null) return collectionMatch.Name;

            var pluralName = propertyType.Name + "s";
            var pluralProperty = entityType.GetProperty(pluralName);
            if (pluralProperty != null) return pluralName;

            return propertyType.Name;
        }

        #endregion

        #region Helper Methods

        private string GetTableName()
        {
            var type = typeof(T);
            var tableAttr = type.GetCustomAttribute<TableAttribute>();
            return tableAttr != null ? tableAttr.Name : type.Name + "s";
        }

        private string GetTableNameForType(Type type)
        {
            // Try multiple methods to get [Table] attribute

            // Method 1: GetCustomAttribute<T>
            var attr1 = type.GetCustomAttribute<TableAttribute>(false);
            if (attr1 != null && !string.IsNullOrEmpty(attr1.Name))
                return attr1.Name;

            // Method 2: GetCustomAttributes
            var attrs = type.GetCustomAttributes(typeof(TableAttribute), false);
            if (attrs.Length > 0)
            {
                var attr2 = attrs[0] as TableAttribute;
                if (attr2 != null && !string.IsNullOrEmpty(attr2.Name))
                    return attr2.Name;
            }

            // Method 3: Using Attribute.GetCustomAttribute
            var attr3 = Attribute.GetCustomAttribute(type, typeof(TableAttribute)) as TableAttribute;
            if (attr3 != null && !string.IsNullOrEmpty(attr3.Name))
                return attr3.Name;

            // Fallback
            return ApplyNamingConvention(type.Name);
        }

        private string ApplyNamingConvention(string name)
        {
            // Acronyms
            if (IsAcronym(name))
                return name;

            // Uncountable nouns
            if (name.EndsWith("Info", StringComparison.OrdinalIgnoreCase) ||
                name.EndsWith("Data", StringComparison.OrdinalIgnoreCase) ||
                name.EndsWith("Status", StringComparison.OrdinalIgnoreCase))
                return name;

            // Pluralization rules
            if (name.EndsWith("ss", StringComparison.OrdinalIgnoreCase))
                return name + "es";

            if (name.EndsWith("s", StringComparison.OrdinalIgnoreCase))
                return name;

            if (name.Length > 1 &&
                name.EndsWith("y", StringComparison.OrdinalIgnoreCase) &&
                !IsVowel(name[name.Length - 2]))
                return name.Substring(0, name.Length - 1) + "ies";

            return name + "s";
        }

        private bool IsAcronym(string name)
        {
            return name.Length >= 2 &&
                   name.Length <= 5 &&
                   name.All(char.IsUpper);
        }

        private bool IsVowel(char c)
        {
            return "AEIOUaeiou".Contains(c);
        } 
 
        private bool HasIsDeletedColumn()
        {
            return typeof(T).GetProperty("IsDeleted") != null;
        }

        #endregion
    }
}