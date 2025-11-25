namespace LBDUSite.ViewModels
{
    public class CategoryViewModel
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public string IconClass { get; set; }
        public int FundCount { get; set; }
    }

    public class NewsCardViewModel
    {
        public int ArticleId { get; set; }
        public string Title { get; set; }
        public string Excerpt { get; set; }
        public string Slug { get; set; }
        public string FeaturedImageUrl { get; set; }
        public DateTime PublishedDate { get; set; }
        public string CategoryName { get; set; }
        public int ReadingTime { get; set; } // minutes

        public string PublishedDateDisplay => PublishedDate.ToString("dd MMM yyyy",
            new System.Globalization.CultureInfo("th-TH"));
    }
}