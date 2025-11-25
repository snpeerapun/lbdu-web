using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace LBDUSite.Repository
{
    public interface IGenericRepository<T> where T : class
    {
 
        List<T> GetList(string conditions, object parameters);
        List<T> GetListPaged(int pageNumber, int rowsPerPage, string conditions, string orderby, object parameters);
        int? Insert(T entity);
        void Delete(T entity);
        void Update(T entity);

    }
}
