using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LBDUSite.Common
{
    public enum TaskStatus
    {
        Created = 1,
        Running = 2,
        Completed = 3,
        Cancelled = 4,
        Faulted = 5,

    }
    public enum TaskType
    {
        InvokeMethod = 164,
        Import = 165,
        Reporting = 166,
        EndOfDay = 167,
    }

}
