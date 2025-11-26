namespace LBDUSite.ViewModels
{



    public class NewsCardViewModel
    {
 
        public int ArticleId { get; set; }
        public string Title { get; set; }
        public string Excerpt { get; set; }
        public DateTime PublishedDate { get; set; }
        public int ReadingTime { get; set; }
        public string Category { get; set; }
        public string CategoryName { get; set; }
        public string Slug { get; set; }
        public string FeaturedImageUrl { get; set; }
        public string Author { get; set; }
        public int Views { get; set; }

        public string PublishedDateDisplay => PublishedDate.ToString("dd MMM yyyy", new System.Globalization.CultureInfo("th-TH"));
        public string TimeAgo
        {
            get
            {
                var timeSpan = DateTime.Now - PublishedDate;
                if (timeSpan.TotalDays >= 365)
                    return $"{(int)(timeSpan.TotalDays / 365)} ปีที่แล้ว";
                if (timeSpan.TotalDays >= 30)
                    return $"{(int)(timeSpan.TotalDays / 30)} เดือนที่แล้ว";
                if (timeSpan.TotalDays >= 1)
                    return $"{(int)timeSpan.TotalDays} วันที่แล้ว";
                if (timeSpan.TotalHours >= 1)
                    return $"{(int)timeSpan.TotalHours} ชั่วโมงที่แล้ว";
                if (timeSpan.TotalMinutes >= 1)
                    return $"{(int)timeSpan.TotalMinutes} นาทีที่แล้ว";
                return "เมื่อสักครู่";
            }
        }
    }
}