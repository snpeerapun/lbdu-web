
using LBDUSite.ViewModels;
using System;
using System.Collections.Generic;

namespace LBDUSite.ViewModels
{
    public class HomePageViewModel
    {
        public StatsViewModel Stats { get; set; }
        public List<CategoryViewModel> Categories { get; set; }
        public List<FundCardViewModel> FeaturedFunds { get; set; }
        public List<FundCardViewModel> PopularFunds { get; set; }
        public List<NewsCardViewModel> RecentNews { get; set; }
    }

    public class StatsViewModel
    {
        public int TotalFunds { get; set; }
        public int TotalAMC { get; set; }
        public int TotalInvestors { get; set; }
        public string TotalVolume { get; set; } // "10B+"
    }
}