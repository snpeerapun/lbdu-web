// RepositoryFactory.cs - Updated for FluentQuery return type
using Dapper;
using Dapper.Contrib.Extensions;
using LBDUSite.Common;
using LBDUSite.Repository.Interfaces;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace LBDUSite.Repository
{
    public class RepositoryFactory : IRepositoryFactory
    {
        private readonly string _connectionString;
        private IDbConnection _connection;
        private IDbTransaction _transaction;
        private bool _disposed = false;

        public bool IsInTransaction => _transaction != null;

        public RepositoryFactory(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new ArgumentNullException(nameof(configuration));
            InitializeConnection();
        }

        public RepositoryFactory(string connectionString)
        {
            _connectionString = connectionString ?? throw new ArgumentNullException(nameof(connectionString));
            InitializeConnection();
        }

        private void InitializeConnection()
        {
            _connection = new SqlConnection(_connectionString);
            _connection.Open();
        }

        #region Query Methods

        /// <summary>
        /// Returns FluentQuery<T> for implicit conversion
        /// </summary>
        public T Find<T>(object? parameters) where T : class
        {
            return _connection.Get<T>(parameters, _transaction);
        }

        public IFluentQuery<T> Fetch<T>() where T : class
        {
            return new FluentQuery<T>(_connection, _transaction);
        }


        public T FindById<T>(int id) where T : class
        {
            return _connection.Get<T>(id, _transaction);
        }

        /// <summary>
        /// Returns FluentQuery<T> for implicit conversion
        /// </summary>
        public List<T> FindAll<T>(object? parameters) where T : class
        {
            return _connection.GetList<T>(parameters, _transaction).ToList();
        }

        #endregion

        #region Basic CRUD

        public List<T> GetList<T>(string conditions = null, object parameters = null) where T : class
        {
            var tableName = GetTableName<T>();
            var sql = $"SELECT * FROM {tableName}";

            if (!string.IsNullOrEmpty(conditions))
            {
                if (!conditions.TrimStart().StartsWith("WHERE", StringComparison.OrdinalIgnoreCase))
                    sql += " WHERE " + conditions;
                else
                    sql += " " + conditions;
            }

            return _connection.Query<T>(sql, parameters, _transaction).ToList();
        }

        public List<T> GetListPaged<T>(int pageNumber, int rowsPerPage, string conditions, string orderby, object param) where T : class
        {
            if (pageNumber < 1) throw new ArgumentException("Page number must be > 0");
            if (rowsPerPage < 1) throw new ArgumentException("Rows per page must be > 0");

            var tableName = GetTableName<T>();
            var skip = (pageNumber - 1) * rowsPerPage;
            var sql = $"SELECT * FROM {tableName}";

            if (!string.IsNullOrEmpty(conditions))
            {
                if (!conditions.TrimStart().StartsWith("WHERE", StringComparison.OrdinalIgnoreCase))
                    sql += " WHERE " + conditions;
                else
                    sql += " " + conditions;
            }

            if (!string.IsNullOrEmpty(orderby))
                sql += $" ORDER BY {orderby}";
            else
                sql += " ORDER BY Id";

            sql += $" OFFSET {skip} ROWS FETCH NEXT {rowsPerPage} ROWS ONLY";

            return _connection.Query<T>(sql, param, _transaction).ToList();
        }

        public int Insert<T>(T entity) where T : class
        {
            var result = _connection.Insert(entity, _transaction);
            return Convert.ToInt32(result);
        }

        public int Update<T>(T entity) where T : class
        {
            return _connection.Update(entity, _transaction);
        }

        public void Delete<T>(T entity) where T : class
        {
            _connection.Delete(entity, _transaction);
        }

        #endregion

        #region Stored Procedures

        public void Execute(string procedureName, object parameters)
        {
            _connection.Execute(procedureName, parameters, _transaction, commandType: CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<dynamic>> ExecuteAsync(string procedureName, object parameters)
        {
            return await _connection.QueryAsync(procedureName, parameters, _transaction, commandType: CommandType.StoredProcedure);
        }

        public IEnumerable<dynamic> ExecuteList(string procedureName, object parameters)
        {
            return _connection.Query(procedureName, parameters, _transaction, commandType: CommandType.StoredProcedure);
        }

        #endregion

        #region Transaction

        public void BeginTransaction()
        {
            if (_transaction != null)
                throw new InvalidOperationException("Transaction already started.");
            _transaction = _connection.BeginTransaction();
        }

        public void Commit()
        {
            if (_transaction == null)
                throw new InvalidOperationException("No active transaction.");
            _transaction.Commit();
            _transaction.Dispose();
            _transaction = null;
        }

        public void Rollback()
        {
            if (_transaction == null)
                throw new InvalidOperationException("No active transaction.");
            _transaction.Rollback();
            _transaction.Dispose();
            _transaction = null;
        }

        #endregion

        #region Helper Methods

        private string GetTableName<T>() where T : class
        {
            var type = typeof(T);
            var tableAttr = type.GetCustomAttribute<TableAttribute>();
            return tableAttr != null ? tableAttr.Name : type.Name + "s";
        }

        #endregion

        #region Dispose

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (_disposed) return;

            if (disposing)
            {
                if (_transaction != null)
                {
                    _transaction.Rollback();
                    _transaction.Dispose();
                    _transaction = null;
                }

                if (_connection != null)
                {
                    if (_connection.State == ConnectionState.Open)
                        _connection.Close();
                    _connection.Dispose();
                    _connection = null;
                }
            }

            _disposed = true;
        }

        ~RepositoryFactory()
        {
            Dispose(false);
        }

        #endregion
    }
}