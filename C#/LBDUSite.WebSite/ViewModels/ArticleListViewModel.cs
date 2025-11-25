using System;
using System.Collections.Generic;

namespace LBDUSite.ViewModels
{
    public class ArticleListViewModel
    {
        public List<ArticleCardViewModel> Articles { get; set; } = new List<ArticleCardViewModel>();
        public int CurrentPage { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public int TotalPages { get; set; }
        public string? Category { get; set; }
        public string? SearchTerm { get; set; }

        public bool HasPreviousPage => CurrentPage > 1;
        public bool HasNextPage => CurrentPage < TotalPages;
    }

    public class ArticleCardViewModel
    {
        public int ArticleId { get; set; }
        public string Title { get; set; }
        public string Slug { get; set; }
        public string? Excerpt { get; set; }
        public string? FeaturedImageUrl { get; set; }
        public DateTime? PublishedDate { get; set; }
        public string? CategoryName { get; set; }
        public string? AuthorName { get; set; }
        public int? ViewCount { get; set; }
        public int ReadingTime { get; set; } // นาที
        public bool IsFeatured { get; set; }
        public bool IsPopular { get; set; }

        public string PublishedDateDisplay => PublishedDate?.ToString("dd MMMM yyyy",
            new System.Globalization.CultureInfo("th-TH")) ?? "ไม่ระบุวันที่";

        public string DefaultImageUrl => FeaturedImageUrl ?? "/images/default-article.jpg";
    }

    public class ArticleDetailViewModel
    {
        public int ArticleId { get; set; }
        public string Title { get; set; }
        public string Slug { get; set; }
        public string? Excerpt { get; set; }
        public string Content { get; set; }
        public string? FeaturedImageUrl { get; set; }
        public DateTime? PublishedDate { get; set; }
        public string? CategoryName { get; set; }
        public string? AuthorName { get; set; }
        public int? ViewCount { get; set; }
        public string? Tags { get; set; }
        public List<string> TagList { get; set; } = new List<string>();
        public List<ArticleCardViewModel> RelatedArticles { get; set; } = new List<ArticleCardViewModel>();

        public string PublishedDateDisplay => PublishedDate?.ToString("dd MMMM yyyy",
            new System.Globalization.CultureInfo("th-TH")) ?? "ไม่ระบุวันที่";

        public string DefaultImageUrl => FeaturedImageUrl ?? "/images/default-article.jpg";
    }
}