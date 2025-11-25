// IRepositoryFactory.cs - Updated with OrderBy & Nested Include
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace LBDUSite.Repository.Interfaces
{
    public interface IRepositoryFactory : IDisposable
    {
        #region Query Methods

        // ✅ วิธีที่ดีที่สุด - ใช้ default value
        T Find<T>(object parameter = null) where T : class;
        T FindById<T>(int id) where T : class;
        List<T> FindAll<T>(object parameter = null) where T : class;
        IFluentQuery<T> Fetch<T>() where T : class;
        #endregion

        #region Basic CRUD

        List<T> GetList<T>(string conditions = null, object parameters = null) where T : class;
        List<T> GetListPaged<T>(int pageNumber, int rowsPerPage, string conditions, string orderby, object param) where T : class;
        int Insert<T>(T entity) where T : class;
        int Update<T>(T entity) where T : class;
        void Delete<T>(T entity) where T : class;

        #endregion

        #region Stored Procedures

        void Execute(string procedureName, object parameters);
        Task<IEnumerable<dynamic>> ExecuteAsync(string procedureName, object parameters);
        IEnumerable<dynamic> ExecuteList(string procedureName, object parameters);

        #endregion

        #region Transaction

        void BeginTransaction();
        void Commit();
        void Rollback();
        bool IsInTransaction { get; }

        #endregion
    }

    public interface IFluentQuery<T> where T : class
    {
        #region Query Building

        IFluentQuery<T> Where(object conditions);
        IFluentQuery<T> Where(string sqlConditions, object parameters = null);

        // Include - Basic
        IFluentQuery<T> Include<TProperty>() where TProperty : class;
        IFluentQuery<T> Include(string propertyName);
        IFluentQuery<T> Include(params string[] propertyNames);

        // Include - With expression
        IFluentQuery<T> Include<TProperty>(Expression<Func<T, TProperty>> navigationProperty) where TProperty : class;
        IFluentQuery<T> Include<TProperty>(Expression<Func<T, IEnumerable<TProperty>>> navigationProperty) where TProperty : class;

        // Include - Nested (ซ้อนกันได้)
        IFluentQuery<T> Include<TProperty>(
            Expression<Func<T, TProperty>> navigationProperty,
            Action<IIncludeQuery<TProperty>> includeAction) where TProperty : class;

        // OrderBy - Multiple fields with direction
        IFluentQuery<T> OrderBy(params Expression<Func<T, object>>[] keySelectors);
        IFluentQuery<T> OrderBy(string orderByClause);
        IFluentQuery<T> OrderByDescending(string column);

        IFluentQuery<T> Take(int count);
        IFluentQuery<T> Skip(int count);
        IFluentQuery<T> WithDeleted();

        #endregion

        #region Terminal Operations

        T FirstOrDefault();
        List<T> ToList();
        int Count();
        bool Any();

        #endregion

        #region Aggregate Functions

        TValue Sum<TValue>(string columnName);
        decimal Average(string columnName);
        TValue Min<TValue>(string columnName);
        TValue Max<TValue>(string columnName);

        #endregion

        #region Async Operations

        Task<T> FirstOrDefaultAsync();
        Task<List<T>> ToListAsync();
        Task<int> CountAsync();
        Task<bool> AnyAsync();

        #endregion
    }

    /// <summary>
    /// Interface for nested include
    /// </summary>
    public interface IIncludeQuery<T> where T : class
    {
        IIncludeQuery<T> Include<TProperty>(Expression<Func<T, TProperty>> navigationProperty) where TProperty : class;
        IIncludeQuery<T> Include<TProperty>(Expression<Func<T, IEnumerable<TProperty>>> navigationProperty) where TProperty : class;
        IIncludeQuery<T> Include<TProperty>(
            Expression<Func<T, TProperty>> navigationProperty,
            Action<IIncludeQuery<TProperty>> includeAction) where TProperty : class;
    }
}

// Extension methods for OrderBy direction
public static class OrderByExtensions
{
    public static object Desc<T>(this T value) => value;
    public static object Asc<T>(this T value) => value;
}