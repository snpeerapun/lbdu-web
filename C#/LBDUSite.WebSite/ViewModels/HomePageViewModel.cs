namespace LBDUSite.ViewModels
{
    public class HomePageViewModel
    {
        public StatsViewModel Stats { get; set; }
        public List<CategoryViewModel> Categories { get; set; }
        public List<FundCardViewModel> FeaturedFunds { get; set; }
        public List<FundCardViewModel> PopularFunds { get; set; }
        public List<NewsCardViewModel> RecentNews { get; set; }
        public List<AMCViewModel> AMCList { get; set; }
        public List<EventActivityViewModel> EventActivities { get; set; }
        public LiveVideoViewModel LiveVideo { get; set; }
    }

    public class CategoryViewModel
    {
        public string CategoryName { get; set; }
        public string CategoryNameEn { get; set; }
        public int FundCount { get; set; }
        public string IconClass { get; set; }
        public string Description { get; set; }
        public string Color { get; set; }
    }

    public class AMCViewModel
    {
        public int AMCId { get; set; }
        public string NameTH { get; set; }
        public string NameEN { get; set; }
        public string ShortName { get; set; }
        public string Logo { get; set; }
        public int FundCount { get; set; }
        public string Website { get; set; }
    }

    public class EventActivityViewModel
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime EventDate { get; set; }
        public string EventType { get; set; } // Webinar, Workshop, Roadshow
        public bool IsOnline { get; set; }
        public bool IsFree { get; set; }
        public string Location { get; set; }
        public decimal? Price { get; set; }
        public string RegistrationUrl { get; set; }
        public string ImageUrl { get; set; }

        public string EventDateDisplay => EventDate.ToString("dd MMM yyyy", new System.Globalization.CultureInfo("th-TH"));
        public int DaysUntilEvent => (EventDate - DateTime.Now).Days;
    }

    public class LiveVideoViewModel
    {
        public string VideoId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public bool IsLive { get; set; }
        public int ViewerCount { get; set; }
        public DateTime StartTime { get; set; }
        public string ThumbnailUrl => $"https://img.youtube.com/vi/{VideoId}/maxresdefault.jpg";
        public string EmbedUrl => $"https://www.youtube.com/embed/{VideoId}";
    }
}