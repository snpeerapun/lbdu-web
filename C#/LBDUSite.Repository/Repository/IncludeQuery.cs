// IncludeQuery.cs - Support Select in Include
using LBDUSite.Repository.Helpers;
using LBDUSite.Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace LBDUSite.Repository
{
    public class IncludeQuery<T> : IIncludeQuery<T> where T : class
    {
        private readonly List<IncludeDefinition> _includes = new List<IncludeDefinition>();
        private readonly SelectBuilder _selectBuilder = new SelectBuilder();

        public List<IncludeDefinition> Includes => _includes;

        /// <summary>
        /// Select specific fields for this Include
        /// Usage: d => d.Select(dept => new { dept.Id, dept.Name })
        /// </summary>
        public IIncludeQuery<T> Select(Expression<Func<T, object>> selector)
        {
            var columns = ExpressionHelper.ParseSelect(selector);
            foreach (var col in columns)
            {
                _selectBuilder.AddColumn(col.PropertyName, col.Alias);
            }
            return this;
        }

        /// <summary>
        /// Select by field names
        /// Usage: d => d.Select("Id", "Name")
        /// </summary>
        public IIncludeQuery<T> Select(params string[] fields)
        {
            if (fields != null)
            {
                foreach (var field in fields)
                {
                    _selectBuilder.AddColumn(field);
                }
            }
            return this;
        }

        /// <summary>
        /// Nested Include: Include(u => u.Department)
        /// </summary>
        public IIncludeQuery<T> Include<TProperty>(Expression<Func<T, TProperty>> navigationProperty) where TProperty : class
        {
            var propertyName = ExpressionHelper.GetPropertyName(navigationProperty);
            if (!_includes.Any(i => i.PropertyName == propertyName))
            {
                var includeDef = new IncludeDefinition
                {
                    PropertyName = propertyName,
                    PropertyType = typeof(TProperty)
                };

                // Copy selected fields if any from current level
                if (_selectBuilder.HasSelection)
                {
                    includeDef.SelectedFields = _selectBuilder.GetColumns();
                }

                _includes.Add(includeDef);
            }
            return this;
        }

        /// <summary>
        /// Nested Include with sub-query
        /// Usage: d => d.Include(m => m.Manager, mgr => mgr.Select("Id", "Name"))
        /// </summary>
        public IIncludeQuery<T> Include<TProperty>(
            Expression<Func<T, TProperty>> navigationProperty,
            Action<IIncludeQuery<TProperty>> includeAction) where TProperty : class
        {
            var propertyName = ExpressionHelper.GetPropertyName(navigationProperty);
            var nestedIncludeQuery = new IncludeQuery<TProperty>();
            includeAction?.Invoke(nestedIncludeQuery);

            var includeDef = new IncludeDefinition
            {
                PropertyName = propertyName,
                PropertyType = typeof(TProperty),
                NestedIncludes = nestedIncludeQuery.Includes,
                // Get selected fields from the nested query
                SelectedFields = nestedIncludeQuery.GetSelectedFields()
            };

            _includes.Add(includeDef);
            return this;
        }

        /// <summary>
        /// Include collection: Include(d => d.Users)
        /// </summary>
        public IIncludeQuery<T> Include<TProperty>(Expression<Func<T, IEnumerable<TProperty>>> navigationProperty) where TProperty : class
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
        /// Include collection with nested includes
        /// Usage: Include(a => a.BankAccounts, bank => bank.Include(...))
        /// </summary>
        public IIncludeQuery<T> Include<TProperty>(
            Expression<Func<T, IEnumerable<TProperty>>> navigationProperty,
            Action<IIncludeQuery<TProperty>> includeAction) where TProperty : class
        {
            var propertyName = ExpressionHelper.GetPropertyName(navigationProperty);
            var includeQuery = new IncludeQuery<TProperty>();
            includeAction?.Invoke(includeQuery);

            var includeDef = new IncludeDefinition
            {
                PropertyName = propertyName,
                PropertyType = typeof(TProperty),
                IsCollection = true,
                NestedIncludes = includeQuery.Includes,
                SelectedFields = includeQuery.GetSelectedFields()
            };

            _includes.Add(includeDef);
            return this;
        }

        /// <summary>
        /// Include ICollection: Include(a => a.BankAccounts)
        /// </summary>
        public IIncludeQuery<T> Include<TProperty>(Expression<Func<T, ICollection<TProperty>>> navigationProperty) where TProperty : class
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
        /// Include ICollection with nested includes
        /// Usage: Include(a => a.BankAccounts, bank => bank.Include(...))
        /// </summary>
        public IIncludeQuery<T> Include<TProperty>(
            Expression<Func<T, ICollection<TProperty>>> navigationProperty,
            Action<IIncludeQuery<TProperty>> includeAction) where TProperty : class
        {
            var propertyName = ExpressionHelper.GetPropertyName(navigationProperty);
            var includeQuery = new IncludeQuery<TProperty>();
            includeAction?.Invoke(includeQuery);

            var includeDef = new IncludeDefinition
            {
                PropertyName = propertyName,
                PropertyType = typeof(TProperty),
                IsCollection = true,
                NestedIncludes = includeQuery.Includes,
                SelectedFields = includeQuery.GetSelectedFields()
            };

            _includes.Add(includeDef);
            return this;
        }
        /// <summary>
        /// Get selected fields for the main query
        /// </summary>
        internal List<SelectInfo> GetSelectedFields()
        {
            return _selectBuilder.HasSelection ? _selectBuilder.GetColumns() : null;
        }
    }
}