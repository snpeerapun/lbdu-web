

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
 
namespace LBDUSite.Models
{
    [Table("ActivityLogs")]
    public class ActivityLog
    {
        [Key]
        public virtual long Id { get; set; }
        public virtual int? UserId { get; set; }
        public virtual string Username { get; set; }
        public virtual string Action { get; set; }
        public virtual string Module { get; set; }
        public virtual string? Details { get; set; }
        public virtual string? IpAddress { get; set; }
        public virtual string? UserAgent { get; set; }
        public virtual string? RequestUrl { get; set; }
        public virtual int? StatusCode { get; set; }
        public virtual DateTime CreatedAt { get; set; }

        // Many-to-One relationship
        [ForeignKey("UserId")]
        public virtual AdminUser? User { get; set; }

    }

    [Table("AdminUsers")]
    public class AdminUser
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string Username { get; set; }
        public virtual string PasswordHash { get; set; }
        public virtual string FullName { get; set; }
        public virtual string Email { get; set; }
        public virtual string Role { get; set; }
        public virtual bool IsActive { get; set; }
        public virtual string? ProfileImage { get; set; }
        public virtual DateTime CreatedAt { get; set; }
        public virtual DateTime? UpdatedAt { get; set; }
        public virtual DateTime? LastLoginAt { get; set; }
        public virtual string? CreatedBy { get; set; }
        public virtual string? UpdatedBy { get; set; }


        // One-to-Many relationship
        [InverseProperty("User")]
        public virtual ICollection<ActivityLog>? ActivityLogs { get; set; }
    }

    [Table("AMC")]
    public class AMC
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string UniqueId { get; set; }
        public virtual string NameTH { get; set; }
        public virtual string? NameEN { get; set; }
        public virtual string? ShortName { get; set; }
        public virtual string? LogoUrl { get; set; }
        public virtual string? Website { get; set; }
        public virtual string? PhoneNumber { get; set; }
        public virtual string? Email { get; set; }
        public virtual string? Address { get; set; }
        public virtual string? Description { get; set; }
        public virtual bool? IsActive { get; set; }
        public virtual DateTime? LastUpdatedFromAPI { get; set; }
        public virtual DateTime? CreatedDate { get; set; }
        public virtual DateTime? UpdatedDate { get; set; }


        // One-to-Many relationship
        [InverseProperty("AMC")]
        public virtual ICollection<Fund>? Funds { get; set; }
    }

    [Table("APISyncLogs")]
    public class APISyncLog
    {
        [Key]
        public virtual long Id { get; set; }
        public virtual string APIName { get; set; }
        public virtual string? APIEndpoint { get; set; }
        public virtual string? SyncType { get; set; }
        public virtual DateTime StartTime { get; set; }
        public virtual DateTime? EndTime { get; set; }
        public virtual string? Status { get; set; }
        public virtual int? RecordsProcessed { get; set; }
        public virtual int? RecordsSuccess { get; set; }
        public virtual int? RecordsError { get; set; }
        public virtual string? ErrorMessage { get; set; }
        public virtual DateTime? CreatedDate { get; set; }


    }

    [Table("ArticleRelatedFunds")]
    public class ArticleRelatedFund
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual int ArticleId { get; set; }
        public virtual int FundId { get; set; }
        public virtual int? DisplayOrder { get; set; }
        public virtual DateTime? CreatedDate { get; set; }

        // Many-to-One relationship
        [ForeignKey("ArticleId")]
        public virtual Article? Article { get; set; }
        // Many-to-One relationship
        [ForeignKey("FundId")]
        public virtual Fund? Fund { get; set; }

    }

    [Table("Articles")]
    public class Article
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string Title { get; set; }
        public virtual string Slug { get; set; }
        public virtual string? Excerpt { get; set; }
        public virtual string Content { get; set; }
        public virtual string? FeaturedImageUrl { get; set; }
        public virtual int? CategoryId { get; set; }
        public virtual int? AuthorId { get; set; }
        public virtual string? Status { get; set; }
        public virtual DateTime? PublishedDate { get; set; }
        public virtual int? ViewCount { get; set; }
        public virtual bool? IsFeatured { get; set; }
        public virtual bool? IsPopular { get; set; }
        public virtual string? Tags { get; set; }
        public virtual string? MetaTitle { get; set; }
        public virtual string? MetaDescription { get; set; }
        public virtual string? MetaKeywords { get; set; }
        public virtual DateTime? CreatedDate { get; set; }
        public virtual int? CreatedBy { get; set; }
        public virtual DateTime? UpdatedDate { get; set; }
        public virtual int? UpdatedBy { get; set; }

        // Many-to-One relationship
        [ForeignKey("AuthorId")]
        public virtual User? Author { get; set; }
        // Many-to-One relationship
        [ForeignKey("CategoryId")]
        public virtual ContentCategory? Category { get; set; }

        // One-to-Many relationship
        [InverseProperty("Article")]
        public virtual ICollection<ArticleRelatedFund>? ArticleRelatedFunds { get; set; }
    }

    [Table("AuditTrails")]
    public class AuditTrail
    {
        [Key]
        public virtual long Id { get; set; }
        public virtual string TableName { get; set; }
        public virtual int RecordId { get; set; }
        public virtual string Action { get; set; }
        public virtual string? ColumnName { get; set; }
        public virtual string? OldValue { get; set; }
        public virtual string? NewValue { get; set; }
        public virtual int? ChangedBy { get; set; }
        public virtual DateTime? ChangedDate { get; set; }
        public virtual string? IPAddress { get; set; }

        // Many-to-One relationship
        [ForeignKey("ChangedBy")]
        public virtual User? ChangedByUser { get; set; }

    }

    [Table("ContentCategories")]
    public class ContentCategory
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string CategoryName { get; set; }
        public virtual string CategorySlug { get; set; }
        public virtual int? ParentCategoryId { get; set; }
        public virtual string? Description { get; set; }
        public virtual int? DisplayOrder { get; set; }
        public virtual bool? IsActive { get; set; }
        public virtual DateTime? CreatedDate { get; set; }
        public virtual int? CreatedBy { get; set; }
        public virtual DateTime? UpdatedDate { get; set; }
        public virtual int? UpdatedBy { get; set; }

        // Many-to-One relationship
        [ForeignKey("ParentCategoryId")]
        public virtual ContentCategory? ParentCategory { get; set; }

        // One-to-Many relationship
        [InverseProperty("Category")]
        public virtual ICollection<Article>? Articles { get; set; }
        // One-to-Many relationship
        [InverseProperty("ParentCategory")]
        public virtual ICollection<ContentCategory>? ContentCategories { get; set; }
    }

    [Table("FundAssets")]
    public class FundAsset
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual int FundId { get; set; }
        public virtual int? AssetSeq { get; set; }
        public virtual string? AssetName { get; set; }
        public virtual string? AssetRatio { get; set; }
        public virtual DateTime? LastUpdatedFromAPI { get; set; }
        public virtual DateTime? CreatedDate { get; set; }
        public virtual DateTime? UpdatedDate { get; set; }

        // Many-to-One relationship
        [ForeignKey("FundId")]
        public virtual Fund? Fund { get; set; }

    }

    [Table("FundBenchmarks")]
    public class FundBenchmark
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual int FundId { get; set; }
        public virtual int? GroupSeq { get; set; }
        public virtual string? Benchmark { get; set; }
        public virtual DateTime? LastUpdatedFromAPI { get; set; }
        public virtual DateTime? CreatedDate { get; set; }
        public virtual DateTime? UpdatedDate { get; set; }

        // Many-to-One relationship
        [ForeignKey("FundId")]
        public virtual Fund? Fund { get; set; }

    }

    [Table("FundClasses")]
    public class FundClass
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual int FundId { get; set; }
        public virtual string? ClassId { get; set; }
        public virtual string ClassAbbrName { get; set; }
        public virtual string? ClassName { get; set; }
        public virtual string? ClassAdditionalDesc { get; set; }
        public virtual DateTime? LastUpdatedFromAPI { get; set; }
        public virtual DateTime? CreatedDate { get; set; }
        public virtual DateTime? UpdatedDate { get; set; }

        // Many-to-One relationship
        [ForeignKey("FundId")]
        public virtual Fund? Fund { get; set; }

        // One-to-Many relationship
        [InverseProperty("FundClass")]
        public virtual ICollection<FundDividend>? FundDividends { get; set; }
        // One-to-Many relationship
        [InverseProperty("FundClass")]
        public virtual ICollection<FundFee>? FundFees { get; set; }
        // One-to-Many relationship
        [InverseProperty("FundClass")]
        public virtual ICollection<FundInvestmentInfo>? FundInvestmentInfo { get; set; }
        // One-to-Many relationship
        [InverseProperty("FundClass")]
        public virtual ICollection<FundNAV>? FundNAV { get; set; }
        // One-to-Many relationship
        [InverseProperty("FundClass")]
        public virtual ICollection<FundPerformance>? FundPerformances { get; set; }
        // One-to-Many relationship
        [InverseProperty("FundClass")]
        public virtual ICollection<Transaction>? Transactions { get; set; }
        // One-to-Many relationship
        [InverseProperty("FundClass")]
        public virtual ICollection<UserPortfolioItem>? UserPortfolioItems { get; set; }
    }

    [Table("FundDividends")]
    public class FundDividend
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual int FundId { get; set; }
        public virtual int? FundClassId { get; set; }
        public virtual string? DividendPolicy { get; set; }
        public virtual string? DividendPolicyRemark { get; set; }
        public virtual DateTime? BookClosingDate { get; set; }
        public virtual DateTime? PaymentDate { get; set; }
        public virtual decimal? DividendPerShare { get; set; }
        public virtual DateTime? LastUpdatedFromAPI { get; set; }
        public virtual DateTime? CreatedDate { get; set; }
        public virtual DateTime? UpdatedDate { get; set; }

        // Many-to-One relationship
        [ForeignKey("FundClassId")]
        public virtual FundClass? FundClass { get; set; }
        // Many-to-One relationship
        [ForeignKey("FundId")]
        public virtual Fund? Fund { get; set; }

    }

    [Table("FundFees")]
    public class FundFee
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual int FundId { get; set; }
        public virtual int? FundClassId { get; set; }
        public virtual string FeeTypeDesc { get; set; }
        public virtual string? Rate { get; set; }
        public virtual string? RateUnit { get; set; }
        public virtual string? ActualValue { get; set; }
        public virtual string? ActualValueUnit { get; set; }
        public virtual string? FeeOtherDesc { get; set; }
        public virtual DateTime? LastUpdatedFromAPI { get; set; }
        public virtual DateTime? CreatedDate { get; set; }
        public virtual DateTime? UpdatedDate { get; set; }

        // Many-to-One relationship
        [ForeignKey("FundClassId")]
        public virtual FundClass? FundClass { get; set; }
        // Many-to-One relationship
        [ForeignKey("FundId")]
        public virtual Fund? Fund { get; set; }

    }

    [Table("FundInvestmentInfo")]
    public class FundInvestmentInfo
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual int FundId { get; set; }
        public virtual int? FundClassId { get; set; }
        public virtual decimal? MinimumSubIPO { get; set; }
        public virtual string? MinimumSubIPOCur { get; set; }
        public virtual decimal? MinimumSub { get; set; }
        public virtual string? MinimumSubCur { get; set; }
        public virtual decimal? MinimumRedempt { get; set; }
        public virtual string? MinimumRedemptCur { get; set; }
        public virtual decimal? MinimumRedemptUnit { get; set; }
        public virtual decimal? LowbalVal { get; set; }
        public virtual string? LowbalValCur { get; set; }
        public virtual decimal? LowbalUnit { get; set; }
        public virtual DateTime? LastUpdatedFromAPI { get; set; }
        public virtual DateTime? CreatedDate { get; set; }
        public virtual DateTime? UpdatedDate { get; set; }

        // Many-to-One relationship
        [ForeignKey("FundClassId")]
        public virtual FundClass? FundClass { get; set; }
        // Many-to-One relationship
        [ForeignKey("FundId")]
        public virtual Fund? Fund { get; set; }

    }

    [Table("FundInvolveParties")]
    public class FundInvolveParty
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual int FundId { get; set; }
        public virtual string? EntityType { get; set; }
        public virtual int? Seq { get; set; }
        public virtual string? EntityName { get; set; }
        public virtual string? Address { get; set; }
        public virtual string? Position { get; set; }
        public virtual DateTime? EffectiveDate { get; set; }
        public virtual DateTime? LastUpdatedFromAPI { get; set; }
        public virtual DateTime? CreatedDate { get; set; }
        public virtual DateTime? UpdatedDate { get; set; }

        // Many-to-One relationship
        [ForeignKey("FundId")]
        public virtual Fund? Fund { get; set; }

    }

    [Table("FundNAV")]
    public class FundNAV
    {
        [Key]
        public virtual long Id { get; set; }
        public virtual int FundId { get; set; }
        public virtual int? FundClassId { get; set; }
        public virtual DateTime NAVDate { get; set; }
        public virtual decimal NAV { get; set; }
        public virtual decimal? NAVChange { get; set; }
        public virtual decimal? NAVChangePercent { get; set; }
        public virtual decimal? TotalNetAsset { get; set; }
        public virtual decimal? TotalUnits { get; set; }
        public virtual DateTime? LastUpdatedFromAPI { get; set; }
        public virtual DateTime? CreatedDate { get; set; }

        // Many-to-One relationship
        [ForeignKey("FundClassId")]
        public virtual FundClass? FundClass { get; set; }
        // Many-to-One relationship
        [ForeignKey("FundId")]
        public virtual Fund? Fund { get; set; }

    }

    [Table("FundPerformances")]
    public class FundPerformance
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual int FundId { get; set; }
        public virtual int? FundClassId { get; set; }
        public virtual string? PerformanceTypeDesc { get; set; }
        public virtual string? ReferencePeriod { get; set; }
        public virtual decimal? PerformanceValue { get; set; }
        public virtual string? AsOfDate { get; set; }
        public virtual DateTime? LastUpdatedFromAPI { get; set; }
        public virtual DateTime? CreatedDate { get; set; }
        public virtual DateTime? UpdatedDate { get; set; }

        // Many-to-One relationship
        [ForeignKey("FundClassId")]
        public virtual FundClass? FundClass { get; set; }
        // Many-to-One relationship
        [ForeignKey("FundId")]
        public virtual Fund? Fund { get; set; }

    }

    [Table("FundPortfolio")]
    public class FundPortfolio
    {
        [Key]
        public virtual long Id { get; set; }
        public virtual int FundId { get; set; }
        public virtual DateTime AsOfDate { get; set; }
        public virtual string? Period { get; set; }
        public virtual string? AssetLiabId { get; set; }
        public virtual string? IssueCode { get; set; }
        public virtual string? ISINCode { get; set; }
        public virtual string? Issuer { get; set; }
        public virtual decimal? AssetLiabValue { get; set; }
        public virtual decimal? PercentNAV { get; set; }
        public virtual DateTime? LastUpdatedFromAPI { get; set; }
        public virtual DateTime? CreatedDate { get; set; }

        // Many-to-One relationship
        [ForeignKey("FundId")]
        public virtual Fund? Fund { get; set; }

    }

    [Table("FundRedemptionInfo")]
    public class FundRedemptionInfo
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual int FundId { get; set; }
        public virtual string? RedempPeriod { get; set; }
        public virtual string? RedempPeriodOth { get; set; }
        public virtual string? SettlementPeriod { get; set; }
        public virtual DateTime? BuyingCutOffTime { get; set; }
        public virtual DateTime? SellingCutOffTime { get; set; }
        public virtual DateTime? LastUpdatedFromAPI { get; set; }
        public virtual DateTime? CreatedDate { get; set; }
        public virtual DateTime? UpdatedDate { get; set; }

        // Many-to-One relationship
        [ForeignKey("FundId")]
        public virtual Fund? Fund { get; set; }

    }

    [Table("FundRisks")]
    public class FundRisk
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual int FundId { get; set; }
        public virtual string? GroupCodeDesc { get; set; }
        public virtual string? CodeDesc { get; set; }
        public virtual DateTime? LastUpdatedFromAPI { get; set; }
        public virtual DateTime? CreatedDate { get; set; }
        public virtual DateTime? UpdatedDate { get; set; }

        // Many-to-One relationship
        [ForeignKey("FundId")]
        public virtual Fund? Fund { get; set; }

    }

    [Table("Funds")]
    public class Fund
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string ProjId { get; set; }
        public virtual string? RegisId { get; set; }
        public virtual DateTime? RegisDate { get; set; }
        public virtual DateTime? CancelDate { get; set; }
        public virtual string ProjNameTH { get; set; }
        public virtual string? ProjNameEN { get; set; }
        public virtual string ProjAbbrName { get; set; }
        public virtual int AMCId { get; set; }
        public virtual string? FundStatus { get; set; }
        public virtual string? PermitUSInvestment { get; set; }
        public virtual int? InvestCountryFlag { get; set; }
        public virtual string? PolicyDesc { get; set; }
        public virtual string? ManagementStyle { get; set; }
        public virtual string? ProjRetailType { get; set; }
        public virtual string? ProjTermFlag { get; set; }
        public virtual int? ProjTermYY { get; set; }
        public virtual int? ProjTermMM { get; set; }
        public virtual int? ProjTermDD { get; set; }
        public virtual string? RiskSpectrum { get; set; }
        public virtual string? RiskSpectrumDesc { get; set; }
        public virtual bool? IsActive { get; set; }
        public virtual bool? IsPopular { get; set; }
        public virtual bool? IsRecommended { get; set; }
        public virtual DateTime? LastUpdatedFromAPI { get; set; }
        public virtual DateTime? CreatedDate { get; set; }
        public virtual DateTime? UpdatedDate { get; set; }

        // Many-to-One relationship
        [ForeignKey("AMCId")]
        public virtual AMC? AMC { get; set; }

        // One-to-Many relationship
        [InverseProperty("Fund")]
        public virtual ICollection<ArticleRelatedFund>? ArticleRelatedFunds { get; set; }
        // One-to-Many relationship
        [InverseProperty("Fund")]
        public virtual ICollection<FundAsset>? FundAssets { get; set; }
        // One-to-Many relationship
        [InverseProperty("Fund")]
        public virtual ICollection<FundBenchmark>? FundBenchmarks { get; set; }
        // One-to-Many relationship
        [InverseProperty("Fund")]
        public virtual ICollection<FundClass>? FundClasses { get; set; }
        // One-to-Many relationship
        [InverseProperty("Fund")]
        public virtual ICollection<FundDividend>? FundDividends { get; set; }
        // One-to-Many relationship
        [InverseProperty("Fund")]
        public virtual ICollection<FundFee>? FundFees { get; set; }
        // One-to-Many relationship
        [InverseProperty("Fund")]
        public virtual ICollection<FundInvestmentInfo>? FundInvestmentInfo { get; set; }
        // One-to-Many relationship
        [InverseProperty("Fund")]
        public virtual ICollection<FundInvolveParty>? FundInvolveParties { get; set; }
        // One-to-Many relationship
        [InverseProperty("Fund")]
        public virtual ICollection<FundNAV>? FundNAV { get; set; }
        // One-to-Many relationship
        [InverseProperty("Fund")]
        public virtual ICollection<FundPerformance>? FundPerformances { get; set; }
        // One-to-Many relationship
        [InverseProperty("Fund")]
        public virtual ICollection<FundPortfolio>? FundPortfolio { get; set; }
        // One-to-Many relationship
        [InverseProperty("Fund")]
        public virtual ICollection<FundRedemptionInfo>? FundRedemptionInfo { get; set; }
        // One-to-Many relationship
        [InverseProperty("Fund")]
        public virtual ICollection<FundRisk>? FundRisks { get; set; }
        // One-to-Many relationship
        [InverseProperty("Fund")]
        public virtual ICollection<FundURL>? FundURLs { get; set; }
        // One-to-Many relationship
        [InverseProperty("Fund")]
        public virtual ICollection<Transaction>? Transactions { get; set; }
        // One-to-Many relationship
        [InverseProperty("Fund")]
        public virtual ICollection<UserAlert>? UserAlerts { get; set; }
        // One-to-Many relationship
        [InverseProperty("Fund")]
        public virtual ICollection<UserFavorite>? UserFavorites { get; set; }
        // One-to-Many relationship
        [InverseProperty("Fund")]
        public virtual ICollection<UserPortfolioItem>? UserPortfolioItems { get; set; }
    }

    [Table("FundURLs")]
    public class FundURL
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual int FundId { get; set; }
        public virtual string? URLHalfYearReport { get; set; }
        public virtual string? URLAnnualReport { get; set; }
        public virtual string? URLFactsheet { get; set; }
        public virtual DateTime? LastUpdatedFromAPI { get; set; }
        public virtual DateTime? CreatedDate { get; set; }
        public virtual DateTime? UpdatedDate { get; set; }

        // Many-to-One relationship
        [ForeignKey("FundId")]
        public virtual Fund? Fund { get; set; }

    }

    [Table("LoginAttempts")]
    public class LoginAttempt
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string Username { get; set; }
        public virtual string IpAddress { get; set; }
        public virtual bool IsSuccessful { get; set; }
        public virtual DateTime AttemptedAt { get; set; }


    }

    [Table("MediaLibrary")]
    public class MediaLibrary
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string FileName { get; set; }
        public virtual string? FileType { get; set; }
        public virtual string FilePath { get; set; }
        public virtual long? FileSize { get; set; }
        public virtual string? MimeType { get; set; }
        public virtual int? Width { get; set; }
        public virtual int? Height { get; set; }
        public virtual string? Title { get; set; }
        public virtual string? AltText { get; set; }
        public virtual string? Description { get; set; }
        public virtual int? UploadedBy { get; set; }
        public virtual DateTime? UploadedDate { get; set; }

        // Many-to-One relationship
        [ForeignKey("UploadedBy")]
        public virtual User? UploadedByUser { get; set; }

    }

    [Table("Notifications")]
    public class Notification
    {
        [Key]
        public virtual long Id { get; set; }
        public virtual int UserId { get; set; }
        public virtual string Title { get; set; }
        public virtual string Message { get; set; }
        public virtual string? NotificationType { get; set; }
        public virtual string? RelatedEntityType { get; set; }
        public virtual int? RelatedEntityId { get; set; }
        public virtual string? ActionUrl { get; set; }
        public virtual bool? IsRead { get; set; }
        public virtual DateTime? ReadDate { get; set; }
        public virtual DateTime? CreatedDate { get; set; }

        // Many-to-One relationship
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }

    }

    [Table("Pages")]
    public class Page
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string Title { get; set; }
        public virtual string Slug { get; set; }
        public virtual string? Content { get; set; }
        public virtual string? Template { get; set; }
        public virtual int? ParentPageId { get; set; }
        public virtual int? DisplayOrder { get; set; }
        public virtual bool? IsPublished { get; set; }
        public virtual bool? IsVisibleInMenu { get; set; }
        public virtual string? MetaTitle { get; set; }
        public virtual string? MetaDescription { get; set; }
        public virtual string? MetaKeywords { get; set; }
        public virtual DateTime? CreatedDate { get; set; }
        public virtual int? CreatedBy { get; set; }
        public virtual DateTime? UpdatedDate { get; set; }
        public virtual int? UpdatedBy { get; set; }

        // Many-to-One relationship
        [ForeignKey("ParentPageId")]
        public virtual Page? ParentPage { get; set; }

        // One-to-Many relationship
        [InverseProperty("ParentPage")]
        public virtual ICollection<Page>? Pages { get; set; }
    }

    [Table("Permissions")]
    public class Permission
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string Module { get; set; }
        public virtual string Action { get; set; }
        public virtual string? Description { get; set; }
        public virtual DateTime CreatedAt { get; set; }


        // One-to-Many relationship
        [InverseProperty("Permission")]
        public virtual ICollection<RolePermission>? RolePermissions { get; set; }
    }

    [Table("RolePermissions")]
    public class RolePermission
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string Role { get; set; }
        public virtual int PermissionId { get; set; }
        public virtual DateTime CreatedAt { get; set; }

        // Many-to-One relationship
        [ForeignKey("PermissionId")]
        public virtual Permission? Permission { get; set; }

    }

    [Table("Roles")]
    public class Role
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string RoleName { get; set; }
        public virtual string DisplayName { get; set; }
        public virtual string? Description { get; set; }
        public virtual bool? IsSystemRole { get; set; }
        public virtual bool? IsActive { get; set; }
        public virtual DateTime? CreatedDate { get; set; }
        public virtual int? CreatedBy { get; set; }
        public virtual DateTime? UpdatedDate { get; set; }
        public virtual int? UpdatedBy { get; set; }


        // One-to-Many relationship
        [InverseProperty("Role")]
        public virtual ICollection<UserRole>? UserRoles { get; set; }
    }

    [Table("SiteSettings")]
    public class SiteSetting
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string SettingKey { get; set; }
        public virtual string? SettingValue { get; set; }
        public virtual string? SettingType { get; set; }
        public virtual string? Category { get; set; }
        public virtual string? Description { get; set; }
        public virtual bool? IsPublic { get; set; }
        public virtual DateTime? UpdatedDate { get; set; }
        public virtual int? UpdatedBy { get; set; }


    }

    [Table("SystemSettings")]
    public class SystemSetting
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string Key { get; set; }
        public virtual string? Value { get; set; }
        public virtual string? Description { get; set; }
        public virtual string Category { get; set; }
        public virtual string DataType { get; set; }
        public virtual bool IsEncrypted { get; set; }
        public virtual DateTime CreatedAt { get; set; }
        public virtual DateTime? UpdatedAt { get; set; }
        public virtual string? UpdatedBy { get; set; }


    }

    [Table("Transactions")]
    public class Transaction
    {
        [Key]
        public virtual long Id { get; set; }
        public virtual int UserId { get; set; }
        public virtual int UserPortfolioId { get; set; }
        public virtual int FundId { get; set; }
        public virtual int? FundClassId { get; set; }
        public virtual string TransactionType { get; set; }
        public virtual DateTime TransactionDate { get; set; }
        public virtual DateTime? TransactionTime { get; set; }
        public virtual decimal Units { get; set; }
        public virtual decimal NAV { get; set; }
        public virtual decimal Amount { get; set; }
        public virtual decimal? Fee { get; set; }
        public virtual decimal? Tax { get; set; }
        public virtual decimal NetAmount { get; set; }
        public virtual string? Status { get; set; }
        public virtual string? OrderNumber { get; set; }
        public virtual string? PaymentMethod { get; set; }
        public virtual string? PaymentReference { get; set; }
        public virtual DateTime? ConfirmedDate { get; set; }
        public virtual DateTime? CancelledDate { get; set; }
        public virtual string? CancellationReason { get; set; }
        public virtual string? Remarks { get; set; }
        public virtual DateTime? CreatedDate { get; set; }
        public virtual DateTime? UpdatedDate { get; set; }

        // Many-to-One relationship
        [ForeignKey("FundClassId")]
        public virtual FundClass? FundClass { get; set; }
        // Many-to-One relationship
        [ForeignKey("FundId")]
        public virtual Fund? Fund { get; set; }
        // Many-to-One relationship
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }
        // Many-to-One relationship
        [ForeignKey("UserPortfolioId")]
        public virtual UserPortfolio? UserPortfolio { get; set; }

    }

    [Table("UserActivityLogs")]
    public class UserActivityLog
    {
        [Key]
        public virtual long Id { get; set; }
        public virtual int? UserId { get; set; }
        public virtual string ActivityType { get; set; }
        public virtual string? EntityType { get; set; }
        public virtual int? EntityId { get; set; }
        public virtual string? IPAddress { get; set; }
        public virtual string? UserAgent { get; set; }
        public virtual string? Details { get; set; }
        public virtual DateTime? CreatedDate { get; set; }

        // Many-to-One relationship
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }

    }

    [Table("UserAlerts")]
    public class UserAlert
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual int UserId { get; set; }
        public virtual int? FundId { get; set; }
        public virtual string AlertType { get; set; }
        public virtual string? Condition { get; set; }
        public virtual bool? IsActive { get; set; }
        public virtual bool? NotifyEmail { get; set; }
        public virtual bool? NotifySMS { get; set; }
        public virtual bool? NotifyApp { get; set; }
        public virtual DateTime? LastTriggeredDate { get; set; }
        public virtual DateTime? CreatedDate { get; set; }
        public virtual DateTime? UpdatedDate { get; set; }

        // Many-to-One relationship
        [ForeignKey("FundId")]
        public virtual Fund? Fund { get; set; }
        // Many-to-One relationship
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }

    }

    [Table("UserFavorites")]
    public class UserFavorite
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual int UserId { get; set; }
        public virtual int FundId { get; set; }
        public virtual DateTime? AddedDate { get; set; }

        // Many-to-One relationship
        [ForeignKey("FundId")]
        public virtual Fund? Fund { get; set; }
        // Many-to-One relationship
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }

    }

    [Table("UserPortfolioItems")]
    public class UserPortfolioItem
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual int UserPortfolioId { get; set; }
        public virtual int FundId { get; set; }
        public virtual int? FundClassId { get; set; }
        public virtual decimal? TotalUnits { get; set; }
        public virtual decimal? AverageCost { get; set; }
        public virtual decimal? TotalCost { get; set; }
        public virtual decimal? CurrentNAV { get; set; }
        public virtual decimal? CurrentValue { get; set; }
        public virtual decimal? UnrealizedGainLoss { get; set; }
        public virtual decimal? UnrealizedGainLossPercent { get; set; }
        public virtual DateTime? FirstPurchaseDate { get; set; }
        public virtual DateTime? LastTransactionDate { get; set; }
        public virtual DateTime? CreatedDate { get; set; }
        public virtual DateTime? UpdatedDate { get; set; }

        // Many-to-One relationship
        [ForeignKey("FundClassId")]
        public virtual FundClass? FundClass { get; set; }
        // Many-to-One relationship
        [ForeignKey("FundId")]
        public virtual Fund? Fund { get; set; }
        // Many-to-One relationship
        [ForeignKey("UserPortfolioId")]
        public virtual UserPortfolio? UserPortfolio { get; set; }

    }

    [Table("UserPortfolios")]
    public class UserPortfolio
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual int UserId { get; set; }
        public virtual string? PortfolioName { get; set; }
        public virtual bool? IsDefault { get; set; }
        public virtual decimal? TotalValue { get; set; }
        public virtual decimal? TotalCost { get; set; }
        public virtual decimal? TotalGainLoss { get; set; }
        public virtual decimal? TotalGainLossPercent { get; set; }
        public virtual DateTime? CreatedDate { get; set; }
        public virtual DateTime? UpdatedDate { get; set; }

        // Many-to-One relationship
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }

        // One-to-Many relationship
        [InverseProperty("UserPortfolio")]
        public virtual ICollection<Transaction>? Transactions { get; set; }
        // One-to-Many relationship
        [InverseProperty("UserPortfolio")]
        public virtual ICollection<UserPortfolioItem>? UserPortfolioItems { get; set; }
    }

    [Table("UserProfiles")]
    public class UserProfile
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual int UserId { get; set; }
        public virtual string? Address { get; set; }
        public virtual string? District { get; set; }
        public virtual string? Province { get; set; }
        public virtual string? PostalCode { get; set; }
        public virtual string? Country { get; set; }
        public virtual string? AvatarUrl { get; set; }
        public virtual string? RiskProfile { get; set; }
        public virtual string? InvestmentObjective { get; set; }
        public virtual decimal? AnnualIncome { get; set; }
        public virtual int? InvestmentExperience { get; set; }
        public virtual string? BankAccountNumber { get; set; }
        public virtual string? BankName { get; set; }
        public virtual string? KYCStatus { get; set; }
        public virtual DateTime? KYCVerifiedDate { get; set; }
        public virtual DateTime? CreatedDate { get; set; }
        public virtual DateTime? UpdatedDate { get; set; }

        // Many-to-One relationship
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }

    }

    [Table("UserRoles")]
    public class UserRole
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual int UserId { get; set; }
        public virtual int RoleId { get; set; }
        public virtual DateTime? AssignedDate { get; set; }
        public virtual int? AssignedBy { get; set; }

        // Many-to-One relationship
        [ForeignKey("RoleId")]
        public virtual Role? Role { get; set; }
        // Many-to-One relationship
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }

    }

    [Table("Users")]
    public class User
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string Email { get; set; }
        public virtual string PasswordHash { get; set; }
        public virtual string FirstName { get; set; }
        public virtual string LastName { get; set; }
        public virtual string? PhoneNumber { get; set; }
        public virtual DateTime? DateOfBirth { get; set; }
        public virtual string? CitizenId { get; set; }
        public virtual bool? IsEmailVerified { get; set; }
        public virtual bool? IsPhoneVerified { get; set; }
        public virtual bool? IsActive { get; set; }
        public virtual DateTime? LastLoginDate { get; set; }
        public virtual DateTime? CreatedDate { get; set; }
        public virtual int? CreatedBy { get; set; }
        public virtual DateTime? UpdatedDate { get; set; }
        public virtual int? UpdatedBy { get; set; }
        public virtual DateTime? DeletedDate { get; set; }
        public virtual int? DeletedBy { get; set; }


        // One-to-Many relationship
        [InverseProperty("Author")]
        public virtual ICollection<Article>? Articles { get; set; }
        // One-to-Many relationship
        [InverseProperty("ChangedByUser")]
        public virtual ICollection<AuditTrail>? AuditTrails { get; set; }
        // One-to-Many relationship
        [InverseProperty("UploadedByUser")]
        public virtual ICollection<MediaLibrary>? MediaLibrary { get; set; }
        // One-to-Many relationship
        [InverseProperty("User")]
        public virtual ICollection<Notification>? Notifications { get; set; }
        // One-to-Many relationship
        [InverseProperty("User")]
        public virtual ICollection<Transaction>? Transactions { get; set; }
        // One-to-Many relationship
        [InverseProperty("User")]
        public virtual ICollection<UserActivityLog>? UserActivityLogs { get; set; }
        // One-to-Many relationship
        [InverseProperty("User")]
        public virtual ICollection<UserAlert>? UserAlerts { get; set; }
        // One-to-Many relationship
        [InverseProperty("User")]
        public virtual ICollection<UserFavorite>? UserFavorites { get; set; }
        // One-to-Many relationship
        [InverseProperty("User")]
        public virtual ICollection<UserPortfolio>? UserPortfolios { get; set; }
        // One-to-Many relationship
        [InverseProperty("User")]
        public virtual ICollection<UserProfile>? UserProfiles { get; set; }
        // One-to-Many relationship
        [InverseProperty("User")]
        public virtual ICollection<UserRole>? UserRoles { get; set; }
    }

    [Table("vw_LatestFundNAV")]
    public class vw_LatestFundNAV
    {
        public virtual int FundId { get; set; }
        public virtual string ProjId { get; set; }
        public virtual string ProjAbbrName { get; set; }
        public virtual string ProjNameTH { get; set; }
        public virtual int FundClassId { get; set; }
        public virtual string ClassAbbrName { get; set; }
        public virtual DateTime NAVDate { get; set; }
        public virtual decimal NAV { get; set; }
        public virtual decimal? NAVChange { get; set; }
        public virtual decimal? NAVChangePercent { get; set; }


    }

    [Table("vw_PopularFunds")]
    public class vw_PopularFund
    {
        public virtual int FundId { get; set; }
        public virtual string ProjId { get; set; }
        public virtual string ProjAbbrName { get; set; }
        public virtual string ProjNameTH { get; set; }
        public virtual string AMCName { get; set; }
        public virtual int? FavoriteCount { get; set; }
        public virtual int? InvestorCount { get; set; }
        public virtual decimal? TotalInvestment { get; set; }


    }

    [Table("vw_UserPortfolioSummary")]
    public class vw_UserPortfolioSummary
    {
        public virtual int UserId { get; set; }
        public virtual string Email { get; set; }
        public virtual string FirstName { get; set; }
        public virtual string LastName { get; set; }
        public virtual int UserPortfolioId { get; set; }
        public virtual string? PortfolioName { get; set; }
        public virtual int? TotalFunds { get; set; }
        public virtual decimal? TotalCost { get; set; }
        public virtual decimal? CurrentValue { get; set; }
        public virtual decimal? TotalGainLoss { get; set; }
        public virtual decimal? GainLossPercent { get; set; }


    }

    [Table("vwLatestFundNAV")]
    public class vwLatestFundNAV
    {
        public virtual int FundId { get; set; }
        public virtual string ProjId { get; set; }
        public virtual string ProjAbbrName { get; set; }
        public virtual string ProjNameTH { get; set; }
        public virtual int FundClassId { get; set; }
        public virtual string ClassAbbrName { get; set; }
        public virtual DateTime NAVDate { get; set; }
        public virtual decimal NAV { get; set; }
        public virtual decimal? NAVChange { get; set; }
        public virtual decimal? NAVChangePercent { get; set; }


    }

    [Table("vwPopularFunds")]
    public class vwPopularFund
    {
        public virtual int FundId { get; set; }
        public virtual string ProjId { get; set; }
        public virtual string ProjAbbrName { get; set; }
        public virtual string ProjNameTH { get; set; }
        public virtual string AMCName { get; set; }
        public virtual int? FavoriteCount { get; set; }
        public virtual int? InvestorCount { get; set; }
        public virtual decimal? TotalInvestment { get; set; }


    }

    [Table("vwUserPortfolioSummary")]
    public class vwUserPortfolioSummary
    {
        public virtual int UserId { get; set; }
        public virtual string Email { get; set; }
        public virtual string FirstName { get; set; }
        public virtual string LastName { get; set; }
        public virtual int UserPortfolioId { get; set; }
        public virtual string? PortfolioName { get; set; }
        public virtual int? TotalFunds { get; set; }
        public virtual decimal? TotalCost { get; set; }
        public virtual decimal? CurrentValue { get; set; }
        public virtual decimal? TotalGainLoss { get; set; }
        public virtual decimal? GainLossPercent { get; set; }


    }

}

