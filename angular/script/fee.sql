-- =============================================
-- IC Fee Support System - Database Schema
-- =============================================

-- 1. IC Groups Table
CREATE TABLE IcGroups (
    Id INT PRIMARY KEY IDENTITY(1,1),
    GroupCode NVARCHAR(20) NOT NULL UNIQUE,
    GroupName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    ParentGroupId INT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CreatedBy INT,
    UpdatedAt DATETIME,
    UpdatedBy INT,
    CONSTRAINT FK_IcGroups_ParentGroup FOREIGN KEY (ParentGroupId) REFERENCES IcGroups(Id)
);

-- 2. IC Group Members Table
CREATE TABLE IcGroupMembers (
    Id BIGINT PRIMARY KEY IDENTITY(1,1),
    IcGroupId INT NOT NULL,
    InvestmentConsultantId BIGINT NOT NULL,
    JoinDate DATETIME NOT NULL DEFAULT GETDATE(),
    LeaveDate DATETIME,
    IsActive BIT NOT NULL DEFAULT 1,
    CONSTRAINT FK_IcGroupMembers_IcGroup FOREIGN KEY (IcGroupId) REFERENCES IcGroups(Id),
    CONSTRAINT FK_IcGroupMembers_IC FOREIGN KEY (InvestmentConsultantId) REFERENCES InvestmentConsultant(Id)
);

-- 3. IC Hierarchy (Tree/Tier Structure)
CREATE TABLE IcHierarchy (
    Id BIGINT PRIMARY KEY IDENTITY(1,1),
    InvestmentConsultantId BIGINT NOT NULL,
    ParentIcId BIGINT,
    TierLevel INT NOT NULL,
    TierName NVARCHAR(50),
    OverridePercentage DECIMAL(5,2),
    EffectiveFrom DATETIME NOT NULL,
    EffectiveTo DATETIME,
    IsActive BIT NOT NULL DEFAULT 1,
    CONSTRAINT FK_IcHierarchy_IC FOREIGN KEY (InvestmentConsultantId) REFERENCES InvestmentConsultant(Id),
    CONSTRAINT FK_IcHierarchy_ParentIC FOREIGN KEY (ParentIcId) REFERENCES InvestmentConsultant(Id),
    CONSTRAINT CHK_OverridePercentage CHECK (OverridePercentage >= 0 AND OverridePercentage <= 100)
);

-- 4. Fee Schemes (Master Template)
CREATE TABLE FeeSchemes (
    Id INT PRIMARY KEY IDENTITY(1,1),
    SchemeCode NVARCHAR(20) NOT NULL UNIQUE,
    SchemeName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    FeeType NVARCHAR(20) NOT NULL, -- COMMISSION, FRONT_END, BACK_END, ONGOING, SWITCH_IN, SWITCH_OUT
    RateMethod NVARCHAR(20) NOT NULL, -- FIXED, STEP, RANGE
    CalculationBasis NVARCHAR(20) NOT NULL, -- ON_VOLUME, ON_FEE, ON_OUTSTANDING
    EffectiveFrom DATETIME NOT NULL,
    EffectiveTo DATETIME,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CreatedBy INT,
    UpdatedAt DATETIME,
    UpdatedBy INT,
    CONSTRAINT CHK_FeeType CHECK (FeeType IN ('COMMISSION', 'FRONT_END', 'BACK_END', 'ONGOING', 'SWITCH_IN', 'SWITCH_OUT')),
    CONSTRAINT CHK_RateMethod CHECK (RateMethod IN ('FIXED', 'STEP', 'RANGE')),
    CONSTRAINT CHK_CalculationBasis CHECK (CalculationBasis IN ('ON_VOLUME', 'ON_FEE', 'ON_OUTSTANDING'))
);

-- 5. Fee Scheme Rates
CREATE TABLE FeeSchemeRates (
    Id BIGINT PRIMARY KEY IDENTITY(1,1),
    FeeSchemeId INT NOT NULL,
    FundId INT, -- NULL = apply to all funds
    AmcId INT, -- NULL = apply to all AMCs
    MinAmount DECIMAL(18,2),
    MaxAmount DECIMAL(18,2),
    RatePercentage DECIMAL(5,2),
    FixedAmount DECIMAL(18,2),
    DisplayOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CONSTRAINT FK_FeeSchemeRates_FeeScheme FOREIGN KEY (FeeSchemeId) REFERENCES FeeSchemes(Id),
    CONSTRAINT FK_FeeSchemeRates_Fund FOREIGN KEY (FundId) REFERENCES Funds(Id),
    CONSTRAINT FK_FeeSchemeRates_Amc FOREIGN KEY (AmcId) REFERENCES AssetManagementCompany(Id)
);

-- 6. IC Fee Assignments
CREATE TABLE IcFeeAssignments (
    Id BIGINT PRIMARY KEY IDENTITY(1,1),
    InvestmentConsultantId BIGINT NOT NULL,
    IcGroupId INT, -- NULL if assigned individually
    FeeSchemeId INT NOT NULL,
    AssignmentType NVARCHAR(20) NOT NULL, -- INDIVIDUAL, GROUP, TIER
    TierLevel INT,
    OverrideRatePercentage DECIMAL(5,2), -- Override rate for this IC
    EffectiveFrom DATETIME NOT NULL,
    EffectiveTo DATETIME,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CreatedBy INT,
    UpdatedAt DATETIME,
    UpdatedBy INT,
    CONSTRAINT FK_IcFeeAssignments_IC FOREIGN KEY (InvestmentConsultantId) REFERENCES InvestmentConsultant(Id),
    CONSTRAINT FK_IcFeeAssignments_IcGroup FOREIGN KEY (IcGroupId) REFERENCES IcGroups(Id),
    CONSTRAINT FK_IcFeeAssignments_FeeScheme FOREIGN KEY (FeeSchemeId) REFERENCES FeeSchemes(Id),
    CONSTRAINT CHK_AssignmentType CHECK (AssignmentType IN ('INDIVIDUAL', 'GROUP', 'TIER'))
);

-- 7. IC Fee Transactions (Actual Fee Records)
CREATE TABLE IcFeeTransactions (
    Id BIGINT PRIMARY KEY IDENTITY(1,1),
    TransactionId BIGINT NOT NULL, -- FK to Transactions table
    InvestmentConsultantId BIGINT NOT NULL,
    CustomerId BIGINT NOT NULL,
    FundId INT NOT NULL,
    FeeSchemeId INT NOT NULL,
    FeeType NVARCHAR(20) NOT NULL,
    TransactionAmount DECIMAL(18,2) NOT NULL,
    FeeBaseAmount DECIMAL(18,2) NOT NULL, -- Amount used for calculation
    FeeRatePercentage DECIMAL(5,2),
    FeeAmount DECIMAL(18,2) NOT NULL,
    ParentIcId BIGINT, -- For override commission
    ParentFeeAmount DECIMAL(18,2),
    BusinessDate DATE NOT NULL,
    CalculatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    PaidDate DATETIME,
    Status NVARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, CALCULATED, PAID, CANCELLED
    Remarks NVARCHAR(500),
    CONSTRAINT FK_IcFeeTransactions_Transaction FOREIGN KEY (TransactionId) REFERENCES Transactions(Id),
    CONSTRAINT FK_IcFeeTransactions_IC FOREIGN KEY (InvestmentConsultantId) REFERENCES InvestmentConsultant(Id),
    CONSTRAINT FK_IcFeeTransactions_ParentIC FOREIGN KEY (ParentIcId) REFERENCES InvestmentConsultant(Id),
    CONSTRAINT FK_IcFeeTransactions_Customer FOREIGN KEY (CustomerId) REFERENCES Customers(Id),
    CONSTRAINT FK_IcFeeTransactions_Fund FOREIGN KEY (FundId) REFERENCES Funds(Id),
    CONSTRAINT FK_IcFeeTransactions_FeeScheme FOREIGN KEY (FeeSchemeId) REFERENCES FeeSchemes(Id),
    CONSTRAINT CHK_FeeStatus CHECK (Status IN ('PENDING', 'CALCULATED', 'PAID', 'CANCELLED'))
);

-- 8. IC Fee Summary (Monthly/Quarterly Summary)
CREATE TABLE IcFeeSummary (
    Id BIGINT PRIMARY KEY IDENTITY(1,1),
    InvestmentConsultantId BIGINT NOT NULL,
    SummaryPeriod NVARCHAR(7) NOT NULL, -- YYYY-MM format
    FeeType NVARCHAR(20) NOT NULL,
    TotalTransactions INT NOT NULL DEFAULT 0,
    TotalVolume DECIMAL(18,2) NOT NULL DEFAULT 0,
    TotalFeeAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    PaidAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    UnpaidAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    Status NVARCHAR(20) NOT NULL DEFAULT 'OPEN', -- OPEN, CLOSED, PAID
    CalculatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    ClosedAt DATETIME,
    PaidAt DATETIME,
    CONSTRAINT FK_IcFeeSummary_IC FOREIGN KEY (InvestmentConsultantId) REFERENCES InvestmentConsultant(Id)
);

-- =============================================
-- Create Indexes
-- =============================================

CREATE INDEX IX_IcGroupMembers_IcGroupId ON IcGroupMembers(IcGroupId);
CREATE INDEX IX_IcGroupMembers_ICId ON IcGroupMembers(InvestmentConsultantId);
CREATE INDEX IX_IcHierarchy_ICId ON IcHierarchy(InvestmentConsultantId);
CREATE INDEX IX_IcHierarchy_ParentICId ON IcHierarchy(ParentIcId);
CREATE INDEX IX_FeeSchemeRates_SchemeId ON FeeSchemeRates(FeeSchemeId);
CREATE INDEX IX_IcFeeAssignments_ICId ON IcFeeAssignments(InvestmentConsultantId);
CREATE INDEX IX_IcFeeTransactions_ICId ON IcFeeTransactions(InvestmentConsultantId);
CREATE INDEX IX_IcFeeTransactions_BusinessDate ON IcFeeTransactions(BusinessDate);
CREATE INDEX IX_IcFeeTransactions_Status ON IcFeeTransactions(Status);
CREATE INDEX IX_IcFeeSummary_ICId_Period ON IcFeeSummary(InvestmentConsultantId, SummaryPeriod);

-- =============================================
-- Insert Master Data
-- =============================================

-- 1. Insert IC Groups
INSERT INTO IcGroups (GroupCode, GroupName, Description, ParentGroupId, IsActive)
VALUES 
    ('GRP-MANAGER', 'ผู้จัดการฝ่ายขาย', 'กลุ่มผู้จัดการระดับสูง', NULL, 1),
    ('GRP-SENIOR', 'ที่ปรึกษาอาวุโส', 'กลุ่มที่ปรึกษาระดับอาวุโส', NULL, 1),
    ('GRP-JUNIOR', 'ที่ปรึกษาทั่วไป', 'กลุ่มที่ปรึกษาระดับทั่วไป', NULL, 1),
    ('GRP-RETAIL', 'กลุ่มลูกค้ารายย่อย', 'ทีมลูกค้ารายย่อย', 2, 1),
    ('GRP-HNW', 'กลุ่มลูกค้า High Net Worth', 'ทีมลูกค้า HNW', 2, 1),
    ('GRP-CORPORATE', 'กลุ่มลูกค้าองค์กร', 'ทีมลูกค้าองค์กร', 1, 1);

-- 2. Insert Fee Schemes
INSERT INTO FeeSchemes (SchemeCode, SchemeName, Description, FeeType, RateMethod, CalculationBasis, EffectiveFrom, IsActive)
VALUES
    -- Commission Schemes
    ('COM-IPO-01', 'Commission - IPO Standard', 'ค่า Commission สำหรับการขาย IPO', 'COMMISSION', 'STEP', 'ON_VOLUME', '2024-01-01', 1),
    ('COM-FRONT-01', 'Commission - Front End Standard', 'ค่า Commission จากค่า Front End', 'COMMISSION', 'FIXED', 'ON_FEE', '2024-01-01', 1),
    
    -- Front End Schemes
    ('FE-EQUITY-01', 'Front End - Equity Funds', 'ค่า Front End สำหรับกองทุนหุ้น', 'FRONT_END', 'STEP', 'ON_VOLUME', '2024-01-01', 1),
    ('FE-FIXED-01', 'Front End - Fixed Income', 'ค่า Front End สำหรับกองทุนตราสารหนี้', 'FRONT_END', 'RANGE', 'ON_VOLUME', '2024-01-01', 1),
    
    -- Back End Schemes
    ('BE-STANDARD-01', 'Back End - Standard', 'ค่า Back End มาตรฐาน', 'BACK_END', 'STEP', 'ON_VOLUME', '2024-01-01', 1),
    
    -- Ongoing/Trailing Fee
    ('OG-ANNUAL-01', 'Ongoing Fee - Annual', 'ค่า Trailing Fee รายปี', 'ONGOING', 'FIXED', 'ON_OUTSTANDING', '2024-01-01', 1),
    
    -- Switch In/Out
    ('SW-IN-01', 'Switch In - Standard', 'ค่า Fee การสับเปลี่ยนเข้า', 'SWITCH_IN', 'FIXED', 'ON_VOLUME', '2024-01-01', 1),
    ('SW-OUT-01', 'Switch Out - Standard', 'ค่า Fee การสับเปลี่ยนออก', 'SWITCH_OUT', 'FIXED', 'ON_VOLUME', '2024-01-01', 1);

-- 3. Insert Fee Scheme Rates (Commission - IPO)
INSERT INTO FeeSchemeRates (FeeSchemeId, FundId, AmcId, MinAmount, MaxAmount, RatePercentage, FixedAmount, DisplayOrder)
VALUES
    -- Commission IPO - Step Rate
    (1, NULL, NULL, 0, 999999, 0.50, NULL, 1),
    (1, NULL, NULL, 1000000, 4999999, 0.75, NULL, 2),
    (1, NULL, NULL, 5000000, 9999999, 1.00, NULL, 3),
    (1, NULL, NULL, 10000000, NULL, 1.25, NULL, 4);

-- 4. Insert Fee Scheme Rates (Commission - Front End)
INSERT INTO FeeSchemeRates (FeeSchemeId, FundId, AmcId, MinAmount, MaxAmount, RatePercentage, FixedAmount, DisplayOrder)
VALUES
    (2, NULL, NULL, NULL, NULL, 50.00, NULL, 1); -- 50% of Front End Fee

-- 5. Insert Fee Scheme Rates (Front End - Equity)
INSERT INTO FeeSchemeRates (FeeSchemeId, FundId, AmcId, MinAmount, MaxAmount, RatePercentage, FixedAmount, DisplayOrder)
VALUES
    (3, NULL, NULL, 0, 999999, 1.50, NULL, 1),
    (3, NULL, NULL, 1000000, 4999999, 1.25, NULL, 2),
    (3, NULL, NULL, 5000000, 9999999, 1.00, NULL, 3),
    (3, NULL, NULL, 10000000, NULL, 0.75, NULL, 4);

-- 6. Insert Fee Scheme Rates (Front End - Fixed Income)
INSERT INTO FeeSchemeRates (FeeSchemeId, FundId, AmcId, MinAmount, MaxAmount, RatePercentage, FixedAmount, DisplayOrder)
VALUES
    (4, NULL, NULL, 0, 999999, 0.50, NULL, 1),
    (4, NULL, NULL, 1000000, 4999999, 0.40, NULL, 2),
    (4, NULL, NULL, 5000000, NULL, 0.30, NULL, 3);

-- 7. Insert Fee Scheme Rates (Back End)
INSERT INTO FeeSchemeRates (FeeSchemeId, FundId, AmcId, MinAmount, MaxAmount, RatePercentage, FixedAmount, DisplayOrder)
VALUES
    (5, NULL, NULL, 0, 999999, 1.00, NULL, 1),
    (5, NULL, NULL, 1000000, 4999999, 0.75, NULL, 2),
    (5, NULL, NULL, 5000000, NULL, 0.50, NULL, 3);

-- 8. Insert Fee Scheme Rates (Ongoing Fee)
INSERT INTO FeeSchemeRates (FeeSchemeId, FundId, AmcId, MinAmount, MaxAmount, RatePercentage, FixedAmount, DisplayOrder)
VALUES
    (6, NULL, NULL, NULL, NULL, 0.25, NULL, 1); -- 0.25% per annum

-- 9. Insert Fee Scheme Rates (Switch In/Out)
INSERT INTO FeeSchemeRates (FeeSchemeId, FundId, AmcId, MinAmount, MaxAmount, RatePercentage, FixedAmount, DisplayOrder)
VALUES
    (7, NULL, NULL, NULL, NULL, 0.50, NULL, 1), -- Switch In: 0.5%
    (8, NULL, NULL, NULL, NULL, 0.25, NULL, 1); -- Switch Out: 0.25%

-- =============================================
-- Sample IC Hierarchy Data
-- =============================================

-- Assuming we have ICs with IDs 1-10
-- Level 1: Manager (IC-1)
-- Level 2: Senior ICs (IC-2, IC-3)
-- Level 3: Junior ICs (IC-4, IC-5, IC-6, IC-7, IC-8, IC-9, IC-10)

-- Insert IC Hierarchy
INSERT INTO IcHierarchy (InvestmentConsultantId, ParentIcId, TierLevel, TierName, OverridePercentage, EffectiveFrom, IsActive)
VALUES
    -- Level 1: Manager
    (1, NULL, 1, 'Manager', NULL, '2024-01-01', 1),
    
    -- Level 2: Senior ICs under Manager
    (2, 1, 2, 'Senior IC', 10.00, '2024-01-01', 1), -- Manager gets 10% override
    (3, 1, 2, 'Senior IC', 10.00, '2024-01-01', 1),
    
    -- Level 3: Junior ICs under Senior IC-2
    (4, 2, 3, 'Junior IC', 5.00, '2024-01-01', 1), -- Senior gets 5% override
    (5, 2, 3, 'Junior IC', 5.00, '2024-01-01', 1),
    (6, 2, 3, 'Junior IC', 5.00, '2024-01-01', 1),
    
    -- Level 3: Junior ICs under Senior IC-3
    (7, 3, 3, 'Junior IC', 5.00, '2024-01-01', 1),
    (8, 3, 3, 'Junior IC', 5.00, '2024-01-01', 1),
    (9, 3, 3, 'Junior IC', 5.00, '2024-01-01', 1),
    (10, 3, 3, 'Junior IC', 5.00, '2024-01-01', 1);

-- Assign ICs to Groups
INSERT INTO IcGroupMembers (IcGroupId, InvestmentConsultantId, JoinDate, IsActive)
VALUES
    (1, 1, '2024-01-01', 1), -- Manager group
    (2, 2, '2024-01-01', 1), -- Senior group
    (2, 3, '2024-01-01', 1), -- Senior group
    (3, 4, '2024-01-01', 1), -- Junior group
    (3, 5, '2024-01-01', 1),
    (3, 6, '2024-01-01', 1),
    (3, 7, '2024-01-01', 1),
    (3, 8, '2024-01-01', 1),
    (3, 9, '2024-01-01', 1),
    (3, 10, '2024-01-01', 1);

-- Assign Fee Schemes to ICs
INSERT INTO IcFeeAssignments (InvestmentConsultantId, IcGroupId, FeeSchemeId, AssignmentType, TierLevel, EffectiveFrom, IsActive)
VALUES
    -- Manager gets all fees
    (1, NULL, 1, 'INDIVIDUAL', 1, '2024-01-01', 1), -- Commission IPO
    (1, NULL, 2, 'INDIVIDUAL', 1, '2024-01-01', 1), -- Commission Front End
    
    -- Senior ICs - Group assignment
    (2, 2, 1, 'GROUP', 2, '2024-01-01', 1),
    (2, 2, 2, 'GROUP', 2, '2024-01-01', 1),
    (3, 2, 1, 'GROUP', 2, '2024-01-01', 1),
    (3, 2, 2, 'GROUP', 2, '2024-01-01', 1),
    
    -- Junior ICs - Group assignment
    (4, 3, 1, 'GROUP', 3, '2024-01-01', 1),
    (5, 3, 1, 'GROUP', 3, '2024-01-01', 1),
    (6, 3, 1, 'GROUP', 3, '2024-01-01', 1),
    (7, 3, 1, 'GROUP', 3, '2024-01-01', 1),
    (8, 3, 1, 'GROUP', 3, '2024-01-01', 1),
    (9, 3, 1, 'GROUP', 3, '2024-01-01', 1),
    (10, 3, 1, 'GROUP', 3, '2024-01-01', 1);

GO

-- =============================================
-- Useful Queries
-- =============================================

-- View IC Hierarchy Tree
SELECT 
    IC1.Id AS IC_Id,
    IC1.FullNameTh AS IC_Name,
    H.TierLevel,
    H.TierName,
    IC2.Id AS Parent_Id,
    IC2.FullNameTh AS Parent_Name,
    H.OverridePercentage
FROM IcHierarchy H
    INNER JOIN InvestmentConsultant IC1 ON H.InvestmentConsultantId = IC1.Id
    LEFT JOIN InvestmentConsultant IC2 ON H.ParentIcId = IC2.Id
WHERE H.IsActive = 1
ORDER BY H.TierLevel, IC1.Id;

-- View IC Group Members
SELECT 
    G.GroupName,
    IC.ContactCode,
    IC.FullNameTh,
    M.JoinDate,
    M.IsActive
FROM IcGroupMembers M
    INNER JOIN IcGroups G ON M.IcGroupId = G.Id
    INNER JOIN InvestmentConsultant IC ON M.InvestmentConsultantId = IC.Id
WHERE M.IsActive = 1
ORDER BY G.GroupName, IC.FullNameTh;

-- View Fee Scheme with Rates
SELECT 
    FS.SchemeCode,
    FS.SchemeName,
    FS.FeeType,
    FS.RateMethod,
    FSR.MinAmount,
    FSR.MaxAmount,
    FSR.RatePercentage,
    FSR.FixedAmount
FROM FeeSchemes FS
    LEFT JOIN FeeSchemeRates FSR ON FS.Id = FSR.FeeSchemeId
WHERE FS.IsActive = 1
ORDER BY FS.Id, FSR.DisplayOrder;

-- View IC Fee Assignments
SELECT 
    IC.ContactCode,
    IC.FullNameTh,
    G.GroupName,
    FS.SchemeName,
    FA.AssignmentType,
    FA.TierLevel,
    FA.OverrideRatePercentage
FROM IcFeeAssignments FA
    INNER JOIN InvestmentConsultant IC ON FA.InvestmentConsultantId = IC.Id
    LEFT JOIN IcGroups G ON FA.IcGroupId = G.Id
    INNER JOIN FeeSchemes FS ON FA.FeeSchemeId = FS.Id
WHERE FA.IsActive = 1
ORDER BY IC.ContactCode, FS.FeeType;

GO