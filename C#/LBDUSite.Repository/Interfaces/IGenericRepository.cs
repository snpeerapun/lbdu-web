using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;

namespace LBDUSite.Repository.Interfaces
{
    public interface IGenericRepository<T> where T : class
    {
        // --- Connection ---
        void ConnectDB(string connection);
        IDbConnection CreateConnection(string connectionString);
        IDbConnection CreateConnection();

        // --- Dapper.Contrib (sync) ---
        int? Insert(T entity);
        int Update(T entity);
        void Delete(T entity);

        // รุ่น object ตรง ๆ (ใช้ตอน type ไม่แน่ใจ / dynamic)
        int? Insert2(object obj);
        void Update2(object model);
        void Delete2(object entity);

        // --- Raw Execute / Stored Procedure ---
        void Execute(string name, object parameters);
        Task<IEnumerable<dynamic>> ExecuteAsync(string name, object parameters);
        IEnumerable<dynamic> ExecuteList(string name, object parameters);

        // --- Query helpers (Dapper.Contrib GetListPaged) ---
        List<T> GetListPaged(int pageNumber, int rowsPerPage, string conditions, string orderby, object param);
        List<TU> GetListPaged<TU>(int pageNumber, int rowsPerPage, string conditions, string orderby, object param);

        // --- Simple lookups ---
        T GetByCode(string code);
        T FindById(int? id);
        TU FindById<TU>(int? id);

        // --- GetList (ระวัง: มีทั้งเวอร์ชัน type ของคลาส และ generic ใหม่นอกเหนือจาก T) ---
        List<T> GetList(string conditions = null, object parameters = null);
        List<TU> GetList<TU>(string conditions = null, object parameters = null);

        // --- Find/FindAll ---
        T Find(object parameter);
        TU Find<TU>(object parameter);
        List<T> FindAll(object parameters = null);
        List<TU> FindAll<TU>(object parameter = null);
        List<TU> FindAll<TU>(string condition, object parameter = null);

        // --- Delete by anonymous where (โหลดแล้วลบทีละตัว) ---
        void Delete<TU>(object parameters);

        // --- Utilities ที่คุณมีอยู่ ---
        T GetGuid(string guid, int tenantId);
        string GetDocNo(string prefix, string tableName);
        int GetMax(string prefix);
    }
}
