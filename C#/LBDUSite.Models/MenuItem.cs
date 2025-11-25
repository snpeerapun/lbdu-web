using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LBDUSite.Models
{
    public class MenuItem
    {
        public int Id { get; set; }
        public string MenuCode { get; set; }
        public string MenuName { get; set; }
        public string MenuURL { get; set; }
        public string MenuIcon { get; set; }
        public int Seq { get; set; }
 
        // รายการเมนูย่อย
        public List<MenuItem> SubMenus { get; set; } = new List<MenuItem>();
    }
}
