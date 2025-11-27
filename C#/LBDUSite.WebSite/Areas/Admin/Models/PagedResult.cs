using System;
using System.Collections.Generic;

namespace LBDUSite.Areas.Admin.Models
{
    public class PagedResult<T>
    {
        public List<T> Items { get; set; }
        public int CurrentPage { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
        public bool HasPrevious => CurrentPage > 1;
        public bool HasNext => CurrentPage < TotalPages;
        public string SortBy { get; set; }
        public string SortOrder { get; set; }
        public string Search { get; set; }

        public PagedResult()
        {
            Items = new List<T>();
        }

        public PagedResult(List<T> items, int totalCount, int currentPage, int pageSize, string sortBy = null, string sortOrder = "asc", string search = null)
        {
            Items = items;
            TotalCount = totalCount;
            CurrentPage = currentPage;
            PageSize = pageSize;
            SortBy = sortBy;
            SortOrder = sortOrder;
            Search = search;
        }
    }

    public class PagingParameters
    {
        private const int MaxPageSize = 100;
        private int _pageSize = 10;

        public int Page { get; set; } = 1;
        
        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = (value > MaxPageSize) ? MaxPageSize : (value < 1 ? 10 : value);
        }

        public string Search { get; set; }
        public string SortBy { get; set; }
        public string SortOrder { get; set; } = "asc";

        // Helper method
        public string GetSortIcon(string columnName)
        {
            if (SortBy?.ToLower() != columnName.ToLower())
                return "fa-sort";
            
            return SortOrder == "desc" ? "fa-sort-down" : "fa-sort-up";
        }

        public string GetNextSortOrder(string columnName)
        {
            if (SortBy?.ToLower() != columnName.ToLower())
                return "asc";
            
            return SortOrder == "asc" ? "desc" : "asc";
        }
    }
}
