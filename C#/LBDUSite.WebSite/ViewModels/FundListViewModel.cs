 
namespace LBDUSite.ViewModels
{
    public class FundListViewModel
    {
        public List<FundCardViewModel> Funds { get; set; }
        public int CurrentPage { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public int TotalPages { get; set; }
        public string Category { get; set; }
        public string SearchTerm { get; set; }
    }
}
