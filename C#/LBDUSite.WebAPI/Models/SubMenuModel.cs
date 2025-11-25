using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LBDUSite.WebAPI.Models
{
	public class SubMenuModel
	{
		public int Id { get; set; }
		public string Code { get; set; }
		public string Name { get; set; }
		public string Description { get; set; }
		public string Url { get; set; }
		public string Status { get; set; }
		public string MainMenu { get; set; }
		public int? Seq { get; set; }
	}
}
