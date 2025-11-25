using LBDUSite.Models;
using LBDUSite.Repository.Interfaces;
using LBDUSite.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace LBDUSite.Controllers
{
    [Route("Article")]
    public class ArticleController : BaseController
    {
        private readonly IRepositoryFactory _repo;
        private readonly IMemoryCache _cache;
        private readonly ILogger<ArticleController> _logger;

        public ArticleController(
            IRepositoryFactory repo,
            IMemoryCache cache,
            ILogger<ArticleController> logger)
        {
            _repo = repo ?? throw new ArgumentNullException(nameof(repo));
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        // GET: /Article
        // GET: /Article/Index
        [HttpGet("")]
        [HttpGet("Index")]
        public IActionResult Index(string? category = null, string? search = null, int page = 1)
        {
            try
            {
                var query = _repo.Fetch<Article>()
                    .Include<ContentCategory>()
                    .Include<User>()
                    .Where(new { Status = "Published" });

                // Apply category filter
                if (!string.IsNullOrEmpty(category))
                {
                    query = query.Where("Category.CategoryName = @Category", new { Category = category });
                }

                // Apply search filter
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(
                        "(Title LIKE @Search OR Excerpt LIKE @Search OR Content LIKE @Search)",
                        new { Search = $"%{search}%" }
                    );
                }

                // Count total
                var totalCount = query.Count();

                // Apply pagination
                var pageSize = 12;
                var articles = query
                    .OrderByDescending("PublishedDate")
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                var viewModel = new ArticleListViewModel
                {
                    Articles = articles.Select(a => MapToArticleCardViewModel(a)).ToList(),
                    CurrentPage = page,
                    PageSize = pageSize,
                    TotalCount = totalCount,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                    Category = category,
                    SearchTerm = search
                };

                ViewBag.Title = string.IsNullOrEmpty(category)
                    ? "บทความและข่าวสาร"
                    : $"บทความหมวด {category}";

                return View(viewModel);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading article list");
                return InternalServerError("เกิดข้อผิดพลาดในการโหลดรายการบทความ");
            }
        }

        // GET: /Article/Detail/{slug}
        [HttpGet("Detail/{slug}")]
        public IActionResult Detail(string slug)
        {
            try
            {
                var article = _repo.Fetch<Article>()
                    .Include<ContentCategory>()
                    .Include<User>()
                    .Where(new { Slug = slug, Status = "Published" })
                    .FirstOrDefault();

                if (article == null)
                {
                    return HttpNotFound("ไม่พบบทความที่ต้องการ");
                }

                // Increment view count
                article.ViewCount = (article.ViewCount ?? 0) + 1;
                _repo.Update(article);
                //_repo.SaveChanges();

                var viewModel = MapToArticleDetailViewModel(article);

                // Get related articles
                viewModel.RelatedArticles = GetRelatedArticles(article.Id, article.CategoryId ?? 0);

                ViewBag.Title = article.Title;

                return View(viewModel);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading article detail");
                return InternalServerError("เกิดข้อผิดพลาดในการโหลดบทความ");
            }
        }

        #region Private Methods

        private ArticleCardViewModel MapToArticleCardViewModel(Article article)
        {
            return new ArticleCardViewModel
            {
                ArticleId = article.Id,
                Title = article.Title,
                Slug = article.Slug,
                Excerpt = article.Excerpt,
                FeaturedImageUrl = article.FeaturedImageUrl,
                PublishedDate = article.PublishedDate,
                CategoryName = article.Category?.CategoryName,
                AuthorName = article.Author?.FirstName+" "+article.Author?.LastName ?? "Admin",
                ViewCount = article.ViewCount ?? 0,
                ReadingTime = CalculateReadingTime(article.Content),
                IsFeatured = article.IsFeatured ?? false,
                IsPopular = article.IsPopular ?? false
            };
        }

        private ArticleDetailViewModel MapToArticleDetailViewModel(Article article)
        {
            var tagList = new List<string>();
            if (!string.IsNullOrEmpty(article.Tags))
            {
                tagList = article.Tags.Split(',').Select(t => t.Trim()).ToList();
            }

            return new ArticleDetailViewModel
            {
                ArticleId = article.Id,
                Title = article.Title,
                Slug = article.Slug,
                Excerpt = article.Excerpt,
                Content = article.Content,
                FeaturedImageUrl = article.FeaturedImageUrl,
                PublishedDate = article.PublishedDate,
                CategoryName = article.Category?.CategoryName,
                AuthorName = article.Author?.FirstName+" "+article.Author?.LastName ?? "Admin",
                ViewCount = article.ViewCount ?? 0,
                Tags = article.Tags,
                TagList = tagList
            };
        }

        private List<ArticleCardViewModel> GetRelatedArticles(int currentArticleId, int categoryId)
        {
            var relatedArticles = _repo.Fetch<Article>()
                .Include<ContentCategory>()
                .Include<User>()
                .Where(new { CategoryId = categoryId, Status = "Published" })
                .Where("Id != @Id", new { Id = currentArticleId })
                .OrderByDescending("PublishedDate")
                .Take(3)
                .ToList();

            return relatedArticles.Select(a => MapToArticleCardViewModel(a)).ToList();
        }

        private int CalculateReadingTime(string content)
        {
            if (string.IsNullOrEmpty(content))
                return 1;

            // Average reading speed: 200 words per minute
            var wordCount = content.Split(new[] { ' ', '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries).Length;
            var minutes = (int)Math.Ceiling(wordCount / 200.0);
            return Math.Max(1, minutes);
        }

        #endregion
    }
}