-- MFTS Schema - All Tables
-- Primary key of every table is column [Id]

------------------------------------------------------------
-- 0. Database (optional)
------------------------------------------------------------
-- CREATE DATABASE MFTS;
-- GO
-- USE MFTS;
-- GO

------------------------------------------------------------
-- 1. SECURITY & USER MANAGEMENT
------------------------------------------------------------

CREATE TABLE Roles (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    RoleCode        VARCHAR(50)   NOT NULL UNIQUE,
    RoleName        NVARCHAR(200) NOT NULL,
    Description     NVARCHAR(500) NULL,
    IsActive        BIT           NOT NULL DEFAULT(1),
    CreatedAt       DATETIME2(0)  NOT NULL DEFAULT(SYSDATETIME()),
    CreatedBy       INT           NULL,
    UpdatedAt       DATETIME2(0)  NULL,
    UpdatedBy       INT           NULL
);

CREATE TABLE Users (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    UserName        VARCHAR(50)   NOT NULL UNIQUE,
    PasswordHash    VARCHAR(200)  NOT NULL,
    FullName        NVARCHAR(200) NOT NULL,
    Email           VARCHAR(200)  NULL,
    PhoneNo         VARCHAR(50)   NULL,
    IsLocked        BIT           NOT NULL DEFAULT(0),
    IsActive        BIT           NOT NULL DEFAULT(1),
    LastLoginAt     DATETIME2(0)  NULL,
    SaCode          VARCHAR(15)   NULL,  -- saCode from FundConnext
    CreatedAt       DATETIME2(0)  NOT NULL DEFAULT(SYSDATETIME()),
    CreatedBy       INT           NULL,
    UpdatedAt       DATETIME2(0)  NULL,
    UpdatedBy       INT           NULL
);

CREATE TABLE UserRoles (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    UserId          INT NOT NULL,
    RoleId          INT NOT NULL,
    CONSTRAINT FK_UserRoles_Users FOREIGN KEY (UserId) REFERENCES Users(Id),
    CONSTRAINT FK_UserRoles_Roles FOREIGN KEY (RoleId) REFERENCES Roles(Id),
    CONSTRAINT UQ_UserRoles UNIQUE (UserId, RoleId)
);

CREATE TABLE Permissions (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    PermissionCode  VARCHAR(100)  NOT NULL UNIQUE,
    PermissionName  NVARCHAR(200) NOT NULL,
    Description     NVARCHAR(500) NULL
);

CREATE TABLE RolePermissions (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    RoleId          INT NOT NULL,
    PermissionId    INT NOT NULL,
    CONSTRAINT FK_RolePerm_Roles FOREIGN KEY (RoleId) REFERENCES Roles(Id),
    CONSTRAINT FK_RolePerm_Perms FOREIGN KEY (PermissionId) REFERENCES Permissions(Id),
    CONSTRAINT UQ_RolePerm UNIQUE (RoleId, PermissionId)
);

CREATE TABLE AuditLogs (
    Id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    EventTime       DATETIME2(0) NOT NULL DEFAULT(SYSDATETIME()),
    UserId          INT          NULL,
    ActionCode      VARCHAR(100) NOT NULL,
    EntityName      VARCHAR(100) NULL,
    EntityKey       VARCHAR(100) NULL,
    Details         NVARCHAR(MAX) NULL,
    IpAddress       VARCHAR(50)  NULL,
    UserAgent       NVARCHAR(500) NULL,
    CONSTRAINT FK_AuditLogs_Users FOREIGN KEY (UserId) REFERENCES Users(Id)
);

CREATE TABLE ApiLogs (
    Id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    LogTime         DATETIME2(0) NOT NULL DEFAULT(SYSDATETIME()),
    Direction       VARCHAR(10)  NOT NULL,   -- IN / OUT
    Channel         VARCHAR(50)  NOT NULL,   -- FUNDCONNEXT, INTERNAL_API, etc.
    HttpMethod      VARCHAR(10)  NULL,
    Endpoint        NVARCHAR(500) NULL,
    RequestPayload  NVARCHAR(MAX) NULL,
    ResponsePayload NVARCHAR(MAX) NULL,
    HttpStatusCode  INT          NULL,
    CorrelationId   VARCHAR(100) NULL
);

------------------------------------------------------------
-- 2. MASTER DATA – AMC / FUND / HOLIDAY / TRADE RULE
------------------------------------------------------------

CREATE TABLE AssetManagementCompanies (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    AmcCode         VARCHAR(10)   NOT NULL UNIQUE,
    ShortName       NVARCHAR(100) NOT NULL,
    ShortNameFundCx NVARCHAR(100) NULL,
    FullNameTh      NVARCHAR(255) NOT NULL,
    FullNameEn      NVARCHAR(255) NULL,
    Email           VARCHAR(200)  NULL,
    ContactName     NVARCHAR(200) NULL,
    PhoneNo         VARCHAR(50)   NULL,
    DefaultCutoffTime TIME        NULL,
    IsActive        BIT           NOT NULL DEFAULT(1),
    CreatedAt       DATETIME2(0)  NOT NULL DEFAULT(SYSDATETIME()),
    CreatedBy       INT           NULL,
    UpdatedAt       DATETIME2(0)  NULL,
    UpdatedBy       INT           NULL
);

CREATE TABLE FundTypes (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    FundTypeCode    VARCHAR(50)   NOT NULL UNIQUE,
    FundTypeNameTh  NVARCHAR(200) NOT NULL,
    FundTypeNameEn  NVARCHAR(200) NULL
);

CREATE TABLE TransactionTypes (
    Id                  INT IDENTITY(1,1) PRIMARY KEY,
    TransactionTypeCode VARCHAR(20)   NOT NULL UNIQUE,   -- SUB, RED, SWI, ...
    TransactionTypeName NVARCHAR(200) NOT NULL
);

CREATE TABLE HolidayTypes (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    HolidayTypeCode VARCHAR(50)   NOT NULL UNIQUE,  -- TH, FUND, FUND_TXN
    HolidayTypeName NVARCHAR(200) NOT NULL
);

CREATE TABLE Funds (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    AmcId           INT NOT NULL,
    FundCodeSa      VARCHAR(30)   NULL,
    FundCodeAmc     VARCHAR(30)   NOT NULL,
    FundNameShortTh NVARCHAR(255) NOT NULL,
    FundNameShortEn NVARCHAR(255) NULL,
    FundNameFullTh  NVARCHAR(255) NULL,
    FundNameFullEn  NVARCHAR(255) NULL,
    FundTypeId      INT           NULL,
    IsOpenEnded     BIT           NOT NULL DEFAULT(1),
    DividendPolicy  NVARCHAR(200) NULL,
    RiskLevel       INT           NULL,
    IpoStartDate    DATE          NULL,
    IpoEndDate      DATE          NULL,
    InceptionDate   DATE          NULL,
    IsActive        BIT           NOT NULL DEFAULT(1),
    CreatedAt       DATETIME2(0)  NOT NULL DEFAULT(SYSDATETIME()),
    CreatedBy       INT           NULL,
    UpdatedAt       DATETIME2(0)  NULL,
    UpdatedBy       INT           NULL,
    CONSTRAINT UQ_Funds_Amc_FundCode UNIQUE (AmcId, FundCodeAmc),
    CONSTRAINT FK_Funds_Amc       FOREIGN KEY (AmcId)      REFERENCES AssetManagementCompanies(Id),
    CONSTRAINT FK_Funds_FundTypes FOREIGN KEY (FundTypeId) REFERENCES FundTypes(Id)
);

CREATE TABLE FundCutoffTimes (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    FundId          INT NOT NULL,
    TransactionTypeId INT NOT NULL,
    CutoffTime      TIME NOT NULL,
    EffectiveFrom   DATE NOT NULL,
    EffectiveTo     DATE NULL,
    CONSTRAINT FK_FundCutoff_Fund    FOREIGN KEY (FundId)          REFERENCES Funds(Id),
    CONSTRAINT FK_FundCutoff_TxnType FOREIGN KEY (TransactionTypeId) REFERENCES TransactionTypes(Id)
);

CREATE TABLE FundSwitchingRules (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    FundIdOut       INT NOT NULL,
    FundIdIn        INT NOT NULL,
    IsAllowed       BIT NOT NULL DEFAULT(1),
    MinAmount       DECIMAL(18,2) NULL,
    MinUnit         DECIMAL(18,4) NULL,
    Remark          NVARCHAR(500) NULL,
    CONSTRAINT FK_Switch_FundOut FOREIGN KEY (FundIdOut) REFERENCES Funds(Id),
    CONSTRAINT FK_Switch_FundIn  FOREIGN KEY (FundIdIn)  REFERENCES Funds(Id)
);

CREATE TABLE FundTradeConditions (
    Id                  INT IDENTITY(1,1) PRIMARY KEY,
    FundId              INT NOT NULL,
    TransactionTypeId   INT NOT NULL,
    MinInitialAmount    DECIMAL(18,2) NULL,
    MinSubsequentAmount DECIMAL(18,2) NULL,
    MinRedeemAmount     DECIMAL(18,2) NULL,
    MinOutstandingAmount DECIMAL(18,2) NULL,
    AllowCash           BIT NOT NULL DEFAULT(1),
    AllowCreditCard     BIT NOT NULL DEFAULT(0),
    AllowCheque         BIT NOT NULL DEFAULT(1),
    AllowQR             BIT NOT NULL DEFAULT(1),
    AllowATS            BIT NOT NULL DEFAULT(1),
    CreatedAt           DATETIME2(0) NOT NULL DEFAULT(SYSDATETIME()),
    UpdatedAt           DATETIME2(0) NULL,
    CONSTRAINT FK_FundTradeCond_Fund    FOREIGN KEY (FundId)            REFERENCES Funds(Id),
    CONSTRAINT FK_FundTradeCond_TxnType FOREIGN KEY (TransactionTypeId) REFERENCES TransactionTypes(Id)
);

CREATE TABLE FundNavs (
    Id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    FundId          INT NOT NULL,
    NavDate         DATE NOT NULL,
    NavPerUnit      DECIMAL(18,4) NOT NULL,
    OfferPrice      DECIMAL(18,4) NULL,
    BidPrice        DECIMAL(18,4) NULL,
    Source          VARCHAR(50)   NULL,
    CreatedAt       DATETIME2(0)  NOT NULL DEFAULT(SYSDATETIME()),
    CreatedBy       INT           NULL,
    CONSTRAINT UQ_FundNav UNIQUE (FundId, NavDate),
    CONSTRAINT FK_FundNav_Fund FOREIGN KEY (FundId) REFERENCES Funds(Id)
);

CREATE TABLE FundFees (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    FundId          INT NOT NULL,
    FeeType         VARCHAR(50)   NOT NULL,
    FeeRate         DECIMAL(9,6)  NULL,
    MinFeeAmount    DECIMAL(18,2) NULL,
    MaxFeeAmount    DECIMAL(18,2) NULL,
    EffectiveFrom   DATE          NOT NULL,
    EffectiveTo     DATE          NULL,
    CONSTRAINT FK_FundFee_Fund FOREIGN KEY (FundId) REFERENCES Funds(Id)
);

CREATE TABLE FundPerformances (
    Id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    FundId          INT NOT NULL,
    AsOfDate        DATE NOT NULL,
    Return1M        DECIMAL(9,4) NULL,
    Return3M        DECIMAL(9,4) NULL,
    Return6M        DECIMAL(9,4) NULL,
    Return1Y        DECIMAL(9,4) NULL,
    Return3Y        DECIMAL(9,4) NULL,
    Return5Y        DECIMAL(9,4) NULL,
    Return10Y       DECIMAL(9,4) NULL,
    SinceInception  DECIMAL(9,4) NULL,
    CreatedAt       DATETIME2(0) NOT NULL DEFAULT(SYSDATETIME()),
    CONSTRAINT UQ_FundPerf UNIQUE (FundId, AsOfDate),
    CONSTRAINT FK_FundPerf_Fund FOREIGN KEY (FundId) REFERENCES Funds(Id)
);

CREATE TABLE ThaiHolidays (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    HolidayDate     DATE NOT NULL UNIQUE,
    Description     NVARCHAR(255) NULL,
    IsBusinessDay   BIT NOT NULL DEFAULT(0)
);

CREATE TABLE FundHolidays (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    FundId          INT NOT NULL,
    HolidayDate     DATE NOT NULL,
    Description     NVARCHAR(255) NULL,
    CONSTRAINT UQ_FundHoliday UNIQUE (FundId, HolidayDate),
    CONSTRAINT FK_FundHoliday_Fund FOREIGN KEY (FundId) REFERENCES Funds(Id)
);

CREATE TABLE FundTransactionHolidayRules (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    FundId          INT NOT NULL,
    TransactionTypeId INT NOT NULL,
    HolidayDate     DATE NOT NULL,
    IsTxnAllowed    BIT NOT NULL DEFAULT(0),
    Remark          NVARCHAR(255) NULL,
    CONSTRAINT UQ_FundTxnHoliday UNIQUE (FundId, TransactionTypeId, HolidayDate),
    CONSTRAINT FK_FundTxnHoliday_Fund    FOREIGN KEY (FundId)          REFERENCES Funds(Id),
    CONSTRAINT FK_FundTxnHoliday_TxnType FOREIGN KEY (TransactionTypeId) REFERENCES TransactionTypes(Id)
);

------------------------------------------------------------
-- 3. DOCUMENT LIBRARY
------------------------------------------------------------

CREATE TABLE DocumentCategories (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    CategoryCode    VARCHAR(50)   NOT NULL UNIQUE,
    CategoryNameTh  NVARCHAR(200) NOT NULL,
    CategoryNameEn  NVARCHAR(200) NULL
);

CREATE TABLE Documents (
    Id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    DocumentCategoryId INT NOT NULL,
    DocumentCode    VARCHAR(100)  NULL,
    Title           NVARCHAR(255) NOT NULL,
    FileName        NVARCHAR(255) NOT NULL,
    FilePath        NVARCHAR(1000) NOT NULL,
    ContentType     VARCHAR(100)  NULL,
    EffectiveFrom   DATE          NULL,
    EffectiveTo     DATE          NULL,
    IsActive        BIT           NOT NULL DEFAULT(1),
    CreatedAt       DATETIME2(0)  NOT NULL DEFAULT(SYSDATETIME()),
    CreatedBy       INT           NULL,
    CONSTRAINT FK_Documents_Category FOREIGN KEY (DocumentCategoryId) REFERENCES DocumentCategories(Id)
);

------------------------------------------------------------
-- 4. CUSTOMER / SUITABILITY / FATCA
------------------------------------------------------------

CREATE TABLE Customers (
    Id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    CustomerCode    VARCHAR(30)   NOT NULL UNIQUE,
    CustomerType    VARCHAR(20)   NOT NULL,
    TitleNameTh     NVARCHAR(50)  NULL,
    FirstNameTh     NVARCHAR(100) NULL,
    LastNameTh      NVARCHAR(100) NULL,
    TitleNameEn     NVARCHAR(50)  NULL,
    FirstNameEn     NVARCHAR(100) NULL,
    LastNameEn      NVARCHAR(100) NULL,
    CitizenId       VARCHAR(20)   NULL,
    PassportNo      VARCHAR(20)   NULL,
    PassportCountry VARCHAR(3)    NULL,
    BirthDate       DATE          NULL,
    Email           VARCHAR(200)  NULL,
    MobileNo        VARCHAR(50)   NULL,
    PhoneNo         VARCHAR(50)   NULL,
    AddressLine1    NVARCHAR(255) NULL,
    AddressLine2    NVARCHAR(255) NULL,
    SubDistrict     NVARCHAR(100) NULL,
    District        NVARCHAR(100) NULL,
    Province        NVARCHAR(100) NULL,
    PostalCode      VARCHAR(10)   NULL,
    TaxId           VARCHAR(20)   NULL,
    IsUsPerson      BIT           NULL,
    FatcaStatus     VARCHAR(20)   NULL,
    Status          VARCHAR(20)   NOT NULL DEFAULT('ACTIVE'),
    CreatedAt       DATETIME2(0)  NOT NULL DEFAULT(SYSDATETIME()),
    CreatedBy       INT           NULL,
    UpdatedAt       DATETIME2(0)  NULL,
    UpdatedBy       INT           NULL
);

CREATE TABLE CustomerBankAccounts (
    Id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    CustomerId      BIGINT NOT NULL,
    BankCode        VARCHAR(4)  NOT NULL,
    BankBranchCode  VARCHAR(10) NULL,
    AccountNo       VARCHAR(30) NOT NULL,
    AccountName     NVARCHAR(200) NULL,
    IsPrimary       BIT NOT NULL DEFAULT(0),
    IsFromAccountOpening BIT NOT NULL DEFAULT(0),
    CreatedAt       DATETIME2(0) NOT NULL DEFAULT(SYSDATETIME()),
    CreatedBy       INT          NULL,
    CONSTRAINT FK_CustBank_Cust FOREIGN KEY (CustomerId) REFERENCES Customers(Id)
);

CREATE TABLE SuitabilityQuestionnaires (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    VersionNo       VARCHAR(20)  NOT NULL,
    EffectiveFrom   DATE         NOT NULL,
    EffectiveTo     DATE         NULL,
    SourceSystem    VARCHAR(50)  NOT NULL,
    IsActive        BIT          NOT NULL DEFAULT(1)
);

CREATE TABLE SuitabilityQuestions (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    SuitabilityQuestionnaireId INT NOT NULL,
    QuestionNo      INT           NOT NULL,
    QuestionText    NVARCHAR(1000) NOT NULL,
    CONSTRAINT FK_SuitQ_Qnaire FOREIGN KEY (SuitabilityQuestionnaireId) REFERENCES SuitabilityQuestionnaires(Id)
);

CREATE TABLE SuitabilityAnswers (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    SuitabilityQuestionId INT NOT NULL,
    AnswerNo        INT           NOT NULL,
    AnswerText      NVARCHAR(1000) NOT NULL,
    Score           INT           NOT NULL,
    CONSTRAINT FK_SuitA_Q FOREIGN KEY (SuitabilityQuestionId) REFERENCES SuitabilityQuestions(Id)
);

CREATE TABLE CustomerSuitabilityResults (
    Id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    CustomerId      BIGINT NOT NULL,
    SuitabilityQuestionnaireId INT NOT NULL,
    AssessmentDate  DATE    NOT NULL,
    TotalScore      INT     NOT NULL,
    RiskLevel       INT     NOT NULL,
    ExpiryDate      DATE    NULL,
    CreatedAt       DATETIME2(0) NOT NULL DEFAULT(SYSDATETIME()),
    CreatedBy       INT          NULL,
    CONSTRAINT FK_CustSuit_Cust   FOREIGN KEY (CustomerId) REFERENCES Customers(Id),
    CONSTRAINT FK_CustSuit_Qnaire FOREIGN KEY (SuitabilityQuestionnaireId) REFERENCES SuitabilityQuestionnaires(Id)
);

CREATE TABLE FatcaQuestionnaires (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    VersionNo       VARCHAR(20) NOT NULL,
    EffectiveFrom   DATE       NOT NULL,
    EffectiveTo     DATE       NULL,
    IsActive        BIT        NOT NULL DEFAULT(1)
);

CREATE TABLE FatcaQuestions (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    FatcaQuestionnaireId INT NOT NULL,
    QuestionNo      INT           NOT NULL,
    QuestionText    NVARCHAR(1000) NOT NULL,
    CONSTRAINT FK_FatcaQ_Qnaire FOREIGN KEY (FatcaQuestionnaireId) REFERENCES FatcaQuestionnaires(Id)
);

CREATE TABLE FatcaAnswers (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    FatcaQuestionId INT NOT NULL,
    AnswerNo        INT           NOT NULL,
    AnswerText      NVARCHAR(1000) NOT NULL,
    IsPositiveUs    BIT           NOT NULL DEFAULT(0),
    CONSTRAINT FK_FatcaA_Q FOREIGN KEY (FatcaQuestionId) REFERENCES FatcaQuestions(Id)
);

CREATE TABLE CustomerFatcaStatus (
    Id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    CustomerId      BIGINT NOT NULL,
    FatcaQuestionnaireId INT NOT NULL,
    AssessmentDate  DATE   NOT NULL,
    IsUsPerson      BIT    NOT NULL,
    Status          VARCHAR(20) NOT NULL,
    CreatedAt       DATETIME2(0) NOT NULL DEFAULT(SYSDATETIME()),
    CreatedBy       INT          NULL,
    CONSTRAINT FK_CustFatca_Cust   FOREIGN KEY (CustomerId) REFERENCES Customers(Id),
    CONSTRAINT FK_CustFatca_Qnaire FOREIGN KEY (FatcaQuestionnaireId) REFERENCES FatcaQuestionnaires(Id)
);

------------------------------------------------------------
-- 5. ACCOUNT / UNITHOLDER
------------------------------------------------------------

CREATE TABLE Accounts (
    Id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    CustomerId      BIGINT NOT NULL,
    AccountCode     VARCHAR(30) NOT NULL UNIQUE,
    AccountType     VARCHAR(20) NOT NULL,
    OpenBranchCode  VARCHAR(10) NULL,
    OpenDate        DATE        NOT NULL,
    CloseDate       DATE        NULL,
    Status          VARCHAR(20) NOT NULL DEFAULT('ACTIVE'),
    CreatedAt       DATETIME2(0) NOT NULL DEFAULT(SYSDATETIME()),
    CreatedBy       INT          NULL,
    UpdatedAt       DATETIME2(0) NULL,
    UpdatedBy       INT          NULL,
    CONSTRAINT FK_Accounts_Cust FOREIGN KEY (CustomerId) REFERENCES Customers(Id)
);

CREATE TABLE Unitholders (
    Id                  BIGINT IDENTITY(1,1) PRIMARY KEY,
    CustomerId          BIGINT NOT NULL,
    AccountId           BIGINT NOT NULL,
    AmcId               INT    NOT NULL,
    ExternalUnitholderId VARCHAR(20) NOT NULL,
    UnitholderType      VARCHAR(10) NOT NULL,
    Status              VARCHAR(20) NOT NULL DEFAULT('ACTIVE'),
    OpenDate            DATE        NOT NULL,
    CloseDate           DATE        NULL,
    CreatedAt           DATETIME2(0) NOT NULL DEFAULT(SYSDATETIME()),
    CreatedBy           INT          NULL,
    UpdatedAt           DATETIME2(0) NULL,
    UpdatedBy           INT          NULL,
    CONSTRAINT UQ_Unitholder UNIQUE (AmcId, ExternalUnitholderId),
    CONSTRAINT FK_UH_Cust    FOREIGN KEY (CustomerId) REFERENCES Customers(Id),
    CONSTRAINT FK_UH_Account FOREIGN KEY (AccountId) REFERENCES Accounts(Id),
    CONSTRAINT FK_UH_Amc     FOREIGN KEY (AmcId)     REFERENCES AssetManagementCompanies(Id)
);

CREATE TABLE UnitholderStatusHistory (
    Id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    UnitholderId    BIGINT NOT NULL,
    Status          VARCHAR(20) NOT NULL,
    EffectiveDate   DATE        NOT NULL,
    Reason          NVARCHAR(500) NULL,
    CreatedAt       DATETIME2(0) NOT NULL DEFAULT(SYSDATETIME()),
    CreatedBy       INT          NULL,
    CONSTRAINT FK_UHStatus_UH FOREIGN KEY (UnitholderId) REFERENCES Unitholders(Id)
);

CREATE TABLE UnitholderLocks (
    Id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    UnitholderId    BIGINT NOT NULL,
    LockType        VARCHAR(20) NOT NULL,
    IsActive        BIT         NOT NULL DEFAULT(1),
    Remark          NVARCHAR(500) NULL,
    CreatedAt       DATETIME2(0) NOT NULL DEFAULT(SYSDATETIME()),
    CreatedBy       INT          NULL,
    CONSTRAINT FK_UHLock_UH FOREIGN KEY (UnitholderId) REFERENCES Unitholders(Id)
);

------------------------------------------------------------
-- 6. ACCOUNT OPENING
------------------------------------------------------------

CREATE TABLE AccountOpeningApplications (
    Id                  BIGINT IDENTITY(1,1) PRIMARY KEY,
    CustomerId          BIGINT NOT NULL,
    AccountId           BIGINT NULL,
    AmcId               INT    NOT NULL,
    ApplicationType     VARCHAR(20) NOT NULL,
    ApplicationNo       VARCHAR(30) NOT NULL UNIQUE,
    Status              VARCHAR(20) NOT NULL, -- DRAFT / SUBMITTED / APPROVED / REJECTED
    SubmitDate          DATETIME2(0) NULL,
    ApprovedDate        DATETIME2(0) NULL,
    RejectedDate        DATETIME2(0) NULL,
    RejectReason        NVARCHAR(500) NULL,
    FundConnextTextFileName NVARCHAR(255) NULL,
    CreatedAt           DATETIME2(0) NOT NULL DEFAULT(SYSDATETIME()),
    CreatedBy           INT          NULL,
    UpdatedAt           DATETIME2(0) NULL,
    UpdatedBy           INT          NULL,
    CONSTRAINT FK_AO_Cust    FOREIGN KEY (CustomerId) REFERENCES Customers(Id),
    CONSTRAINT FK_AO_Amc     FOREIGN KEY (AmcId)     REFERENCES AssetManagementCompanies(Id),
    CONSTRAINT FK_AO_Account FOREIGN KEY (AccountId) REFERENCES Accounts(Id)
);

CREATE TABLE AccountOpeningDocuments (
    Id                  BIGINT IDENTITY(1,1) PRIMARY KEY,
    AccountOpeningId    BIGINT NOT NULL,
    DocumentId          BIGINT NOT NULL,
    IsRequired          BIT    NOT NULL DEFAULT(1),
    IsReceived          BIT    NOT NULL DEFAULT(0),
    ReceivedAt          DATETIME2(0) NULL,
    ReceivedBy          INT          NULL,
    CONSTRAINT FK_AODoc_AO  FOREIGN KEY (AccountOpeningId) REFERENCES AccountOpeningApplications(Id),
    CONSTRAINT FK_AODoc_Doc FOREIGN KEY (DocumentId)       REFERENCES Documents(Id)
);

CREATE TABLE AccountOpeningConfirmations (
    Id                  BIGINT IDENTITY(1,1) PRIMARY KEY,
    AccountOpeningId    BIGINT NOT NULL,
    UnitholderId        BIGINT NULL,
    ExternalUnitholderId VARCHAR(20) NULL,
    StatusFromAmc       VARCHAR(20) NOT NULL,
    ConfirmDate         DATE NOT NULL,
    RawFileName         NVARCHAR(255) NULL,
    CreatedAt           DATETIME2(0) NOT NULL DEFAULT(SYSDATETIME()),
    CreatedBy           INT          NULL,
    CONSTRAINT FK_AOConf_AO FOREIGN KEY (AccountOpeningId) REFERENCES AccountOpeningApplications(Id),
    CONSTRAINT FK_AOConf_UH FOREIGN KEY (UnitholderId)     REFERENCES Unitholders(Id)
);

------------------------------------------------------------
-- 7. TRANSACTIONS / PAYMENTS / BALANCE
------------------------------------------------------------

CREATE TABLE PaymentMethods (
    Id                      INT IDENTITY(1,1) PRIMARY KEY,
    PaymentTypeCode         VARCHAR(20) NOT NULL UNIQUE,  -- CASH, CHEQUE, CREDIT_CARD, QR, ATS, COL, EWALLET
    FundConnextPaymentType  VARCHAR(8)  NULL             -- mapping with paymentType from FundConnext
);

CREATE TABLE Transactions (
    Id                      BIGINT IDENTITY(1,1) PRIMARY KEY,
    SaOrderReferenceNo      VARCHAR(30) NOT NULL,
    BusinessDate            DATE        NOT NULL,
    TransactionDateTime     DATETIME2(0) NOT NULL,
    TransactionTypeId       INT         NOT NULL,
    CustomerId              BIGINT      NOT NULL,
    AccountId               BIGINT      NOT NULL,
    UnitholderId            BIGINT      NOT NULL,
    FundId                  INT         NOT NULL,
    Amount                  DECIMAL(18,2) NOT NULL,
    Unit                    DECIMAL(18,4) NULL,
    NavDate                 DATE        NULL,
    NavUsed                 DECIMAL(18,4) NULL,
    Channel                 VARCHAR(3)  NOT NULL,
    PaymentMethodId         INT         NOT NULL,
    ForceEntry              BIT         NOT NULL DEFAULT(0),
    Status                  VARCHAR(20) NOT NULL,
    ExternalTransactionId   VARCHAR(20) NULL,
    Remark                  NVARCHAR(500) NULL,
    CreatedAt               DATETIME2(0) NOT NULL DEFAULT(SYSDATETIME()),
    CreatedBy               INT          NULL,
    UpdatedAt               DATETIME2(0) NULL,
    UpdatedBy               INT          NULL,
    CONSTRAINT UQ_Txn_SARef UNIQUE (SaOrderReferenceNo),
    CONSTRAINT FK_Txn_TxnType   FOREIGN KEY (TransactionTypeId)   REFERENCES TransactionTypes(Id),
    CONSTRAINT FK_Txn_Cust      FOREIGN KEY (CustomerId)          REFERENCES Customers(Id),
    CONSTRAINT FK_Txn_Account   FOREIGN KEY (AccountId)           REFERENCES Accounts(Id),
    CONSTRAINT FK_Txn_UH        FOREIGN KEY (UnitholderId)        REFERENCES Unitholders(Id),
    CONSTRAINT FK_Txn_Fund      FOREIGN KEY (FundId)              REFERENCES Funds(Id),
    CONSTRAINT FK_Txn_PayMethod FOREIGN KEY (PaymentMethodId)     REFERENCES PaymentMethods(Id)
);

CREATE TABLE TransactionPayments (
    Id                      BIGINT IDENTITY(1,1) PRIMARY KEY,
    TransactionId           BIGINT NOT NULL,
    PaymentMethodId         INT    NOT NULL,
    PaymentAmount           DECIMAL(18,2) NOT NULL,
    PaymentTypeRaw          VARCHAR(8)   NULL,
    BankCode                VARCHAR(4)   NULL,
    BankAccount             VARCHAR(20)  NULL,
    ChequeNo                VARCHAR(10)  NULL,
    ChequeDate              DATE         NULL,
    CreditCardNoMasked      VARCHAR(20)  NULL,
    CreditCardIssuer        NVARCHAR(100) NULL,
    CrcApprovalCode         VARCHAR(20)  NULL,
    CollateralAccount       VARCHAR(20)  NULL,
    PointCode               VARCHAR(10)  NULL,
    EWalletProvider         NVARCHAR(50) NULL,
    CreatedAt               DATETIME2(0) NOT NULL DEFAULT(SYSDATETIME()),
    CreatedBy               INT          NULL,
    CONSTRAINT FK_TxnPay_Txn       FOREIGN KEY (TransactionId)   REFERENCES Transactions(Id),
    CONSTRAINT FK_TxnPay_PayMethod FOREIGN KEY (PaymentMethodId) REFERENCES PaymentMethods(Id)
);

CREATE TABLE TransactionStatusHistory (
    Id                      BIGINT IDENTITY(1,1) PRIMARY KEY,
    TransactionId           BIGINT NOT NULL,
    Status                  VARCHAR(20) NOT NULL,
    StatusDateTime          DATETIME2(0) NOT NULL DEFAULT(SYSDATETIME()),
    Source                  VARCHAR(50)  NOT NULL,
    Remark                  NVARCHAR(500) NULL,
    CreatedBy               INT          NULL,
    CONSTRAINT FK_TxnStatus_Txn FOREIGN KEY (TransactionId) REFERENCES Transactions(Id)
);

CREATE TABLE TransactionDocuments (
    Id                      BIGINT IDENTITY(1,1) PRIMARY KEY,
    TransactionId           BIGINT NOT NULL,
    DocumentId              BIGINT NOT NULL,
    CreatedAt               DATETIME2(0) NOT NULL DEFAULT(SYSDATETIME()),
    CreatedBy               INT          NULL,
    CONSTRAINT FK_TxnDoc_Txn FOREIGN KEY (TransactionId) REFERENCES Transactions(Id),
    CONSTRAINT FK_TxnDoc_Doc FOREIGN KEY (DocumentId)     REFERENCES Documents(Id)
);

CREATE TABLE TransactionConfirmations (
    Id                      BIGINT IDENTITY(1,1) PRIMARY KEY,
    TransactionId           BIGINT NOT NULL,
    ConfirmationStatus      VARCHAR(20) NOT NULL,
    AllottedUnit            DECIMAL(18,4) NULL,
    AllottedAmount          DECIMAL(18,2) NULL,
    AllottedNav             DECIMAL(18,4) NULL,
    ConfirmationDate        DATE NOT NULL,
    RawFileName             NVARCHAR(255) NULL,
    CreatedAt               DATETIME2(0) NOT NULL DEFAULT(SYSDATETIME()),
    CreatedBy               INT          NULL,
    CONSTRAINT FK_TxnConf_Txn FOREIGN KEY (TransactionId) REFERENCES Transactions(Id)
);

CREATE TABLE TransactionCancellations (
    Id                      BIGINT IDENTITY(1,1) PRIMARY KEY,
    TransactionId           BIGINT NOT NULL,
    CancelSource            VARCHAR(20) NOT NULL,
    CancelReason            NVARCHAR(500) NULL,
    CancelDate              DATETIME2(0) NOT NULL,
    RawFileName             NVARCHAR(255) NULL,
    CreatedAt               DATETIME2(0) NOT NULL DEFAULT(SYSDATETIME()),
    CreatedBy               INT          NULL,
    CONSTRAINT FK_TxnCancel_Txn FOREIGN KEY (TransactionId) REFERENCES Transactions(Id)
);

CREATE TABLE FundBalances (
    Id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    UnitholderId    BIGINT NOT NULL,
    FundId          INT    NOT NULL,
    BalanceDate     DATE   NOT NULL,
    UnitBalance     DECIMAL(18,4) NOT NULL,
    AmountBalance   DECIMAL(18,2) NULL,
    PendingUnit     DECIMAL(18,4) NULL,
    PendingAmount   DECIMAL(18,2) NULL,
    AverageCost     DECIMAL(18,4) NULL,
    Source          VARCHAR(50)   NOT NULL,
    CreatedAt       DATETIME2(0)  NOT NULL DEFAULT(SYSDATETIME()),
    CONSTRAINT UQ_FundBalance UNIQUE (UnitholderId, FundId, BalanceDate),
    CONSTRAINT FK_FundBal_UH   FOREIGN KEY (UnitholderId) REFERENCES Unitholders(Id),
    CONSTRAINT FK_FundBal_Fund FOREIGN KEY (FundId)       REFERENCES Funds(Id)
);

CREATE TABLE LtfSsfBalances (
    Id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    FundBalanceId   BIGINT NOT NULL,
    TaxYear         INT    NOT NULL,
    UnitBalance     DECIMAL(18,4) NOT NULL,
    CreatedAt       DATETIME2(0) NOT NULL DEFAULT(SYSDATETIME()),
    CONSTRAINT UQ_LtfSsfBalance UNIQUE (FundBalanceId, TaxYear),
    CONSTRAINT FK_LtfSsf_FundBalance FOREIGN KEY (FundBalanceId) REFERENCES FundBalances(Id)
);

CREATE TABLE MonthlyInvestmentPlans (
    Id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    CustomerId      BIGINT NOT NULL,
    AccountId       BIGINT NOT NULL,
    UnitholderId    BIGINT NOT NULL,
    FundId          INT    NOT NULL,
    AmountPerMonth  DECIMAL(18,2) NOT NULL,
    DebitDay        TINYINT       NOT NULL,  -- 1-28
    StartDate       DATE          NOT NULL,
    EndDate         DATE          NULL,
    PaymentMethodId INT           NOT NULL,
    Status          VARCHAR(20)   NOT NULL,
    CreatedAt       DATETIME2(0)  NOT NULL DEFAULT(SYSDATETIME()),
    CreatedBy       INT           NULL,
    UpdatedAt       DATETIME2(0)  NULL,
    UpdatedBy       INT           NULL,
    CONSTRAINT FK_DCA_Cust      FOREIGN KEY (CustomerId)      REFERENCES Customers(Id),
    CONSTRAINT FK_DCA_Acc       FOREIGN KEY (AccountId)       REFERENCES Accounts(Id),
    CONSTRAINT FK_DCA_UH        FOREIGN KEY (UnitholderId)    REFERENCES Unitholders(Id),
    CONSTRAINT FK_DCA_Fund      FOREIGN KEY (FundId)          REFERENCES Funds(Id),
    CONSTRAINT FK_DCA_PayMethod FOREIGN KEY (PaymentMethodId) REFERENCES PaymentMethods(Id)
);

------------------------------------------------------------
-- 8. FUND CONNEXT INTEGRATION / STAGING
------------------------------------------------------------

CREATE TABLE IntegrationJobs (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    JobCode         VARCHAR(50)   NOT NULL UNIQUE,
    Description     NVARCHAR(255) NULL,
    FileType        VARCHAR(50)   NULL,
    IsActive        BIT           NOT NULL DEFAULT(1),
    CronExpression  VARCHAR(100)  NULL,
    LastRunAt       DATETIME2(0)  NULL
);

CREATE TABLE IntegrationJobRuns (
    Id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    IntegrationJobId INT NOT NULL,
    RunStartTime    DATETIME2(0) NOT NULL DEFAULT(SYSDATETIME()),
    RunEndTime      DATETIME2(0) NULL,
    Status          VARCHAR(20)  NOT NULL,
    Message         NVARCHAR(1000) NULL,
    CONSTRAINT FK_JobRun_Job FOREIGN KEY (IntegrationJobId) REFERENCES IntegrationJobs(Id)
);

CREATE TABLE FcDownloadFiles (
    Id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    FileType        VARCHAR(50)   NOT NULL,
    BusinessDate    DATE          NOT NULL,
    FileName        NVARCHAR(255) NOT NULL,
    FilePath        NVARCHAR(1000) NOT NULL,
    FileSizeBytes   BIGINT        NULL,
    HasNext         BIT           NULL,
    TotalFiles      INT           NULL,
    DownloadedAt    DATETIME2(0)  NOT NULL DEFAULT(SYSDATETIME()),
    DownloadStatus  VARCHAR(20)   NOT NULL,
    ErrorMessage    NVARCHAR(1000) NULL
);

CREATE TABLE FcFundMapping (
    Id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    AmcId           INT    NOT NULL,
    SaCode          VARCHAR(15) NOT NULL,
    FundCodeAmc     VARCHAR(30) NOT NULL,
    FundCodeSa      VARCHAR(30) NULL,
    IsAllowedToSell BIT        NOT NULL,
    EffectiveFrom   DATE       NULL,
    EffectiveTo     DATE       NULL,
    SourceFileId    BIGINT     NULL,
    CreatedAt       DATETIME2(0) NOT NULL DEFAULT(SYSDATETIME()),
    CONSTRAINT FK_FcFundMap_Amc  FOREIGN KEY (AmcId)        REFERENCES AssetManagementCompanies(Id),
    CONSTRAINT FK_FcFundMap_File FOREIGN KEY (SourceFileId) REFERENCES FcDownloadFiles(Id)
);

CREATE TABLE FcFundProfile (
    Id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    AmcId           INT    NOT NULL,
    FundCodeAmc     VARCHAR(30) NOT NULL,
    RiskLevel       INT         NULL,
    CutoffTimeSub   TIME        NULL,
    CutoffTimeRed   TIME        NULL,
    MinInitialSub   DECIMAL(18,2) NULL,
    MinSubsequentSub DECIMAL(18,2) NULL,
    MinRedeemAmount DECIMAL(18,2) NULL,
    Currency        VARCHAR(3)   NULL,
    SourceFileId    BIGINT       NULL,
    CreatedAt       DATETIME2(0) NOT NULL DEFAULT(SYSDATETIME()),
    CONSTRAINT FK_FcFundProfile_Amc  FOREIGN KEY (AmcId)        REFERENCES AssetManagementCompanies(Id),
    CONSTRAINT FK_FcFundProfile_File FOREIGN KEY (SourceFileId) REFERENCES FcDownloadFiles(Id)
);

CREATE TABLE FcSwitchingMatrix (
    Id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    AmcId           INT    NOT NULL,
    FundCodeOut     VARCHAR(30) NOT NULL,
    FundCodeIn      VARCHAR(30) NOT NULL,
    IsAllowed       BIT        NOT NULL,
    MinUnit         DECIMAL(18,4) NULL,
    MinAmount       DECIMAL(18,2) NULL,
    SourceFileId    BIGINT       NULL,
    CreatedAt       DATETIME2(0) NOT NULL DEFAULT(SYSDATETIME()),
    CONSTRAINT FK_FcSwitch_Amc  FOREIGN KEY (AmcId)        REFERENCES AssetManagementCompanies(Id),
    CONSTRAINT FK_FcSwitch_File FOREIGN KEY (SourceFileId) REFERENCES FcDownloadFiles(Id)
);

CREATE TABLE FcFundHoliday (
    Id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    AmcId           INT    NOT NULL,
    FundCodeAmc     VARCHAR(30) NOT NULL,
    HolidayDate     DATE        NOT NULL,
    Description     NVARCHAR(255) NULL,
    SourceFileId    BIGINT       NULL,
    CreatedAt       DATETIME2(0) NOT NULL DEFAULT(SYSDATETIME()),
    CONSTRAINT FK_FcFundHoliday_Amc  FOREIGN KEY (AmcId)        REFERENCES AssetManagementCompanies(Id),
    CONSTRAINT FK_FcFundHoliday_File FOREIGN KEY (SourceFileId) REFERENCES FcDownloadFiles(Id)
);

CREATE TABLE FcTradeCalendar (
    Id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    AmcId           INT    NOT NULL,
    FundCodeAmc     VARCHAR(30) NOT NULL,
    BusinessDate    DATE        NOT NULL,
    IsTradeAllowed  BIT         NOT NULL,
    SourceFileId    BIGINT      NULL,
    CreatedAt       DATETIME2(0) NOT NULL DEFAULT(SYSDATETIME()),
    CONSTRAINT FK_FcTradeCal_Amc  FOREIGN KEY (AmcId)        REFERENCES AssetManagementCompanies(Id),
    CONSTRAINT FK_FcTradeCal_File FOREIGN KEY (SourceFileId) REFERENCES FcDownloadFiles(Id)
);

CREATE TABLE FcFundFee (
    Id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    AmcId           INT    NOT NULL,
    FundCodeAmc     VARCHAR(30) NOT NULL,
    FeeType         VARCHAR(50) NOT NULL,
    FeeRate         DECIMAL(9,6) NULL,
    SourceFileId    BIGINT       NULL,
    CreatedAt       DATETIME2(0) NOT NULL DEFAULT(SYSDATETIME()),
    CONSTRAINT FK_FcFundFee_Amc  FOREIGN KEY (AmcId)        REFERENCES AssetManagementCompanies(Id),
    CONSTRAINT FK_FcFundFee_File FOREIGN KEY (SourceFileId) REFERENCES FcDownloadFiles(Id)
);

CREATE TABLE FcFundPerformance (
    Id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    AmcId           INT    NOT NULL,
    FundCodeAmc     VARCHAR(30) NOT NULL,
    AsOfDate        DATE        NOT NULL,
    Return1M        DECIMAL(9,4) NULL,
    Return3M        DECIMAL(9,4) NULL,
    Return6M        DECIMAL(9,4) NULL,
    Return1Y        DECIMAL(9,4) NULL,
    Return3Y        DECIMAL(9,4) NULL,
    Return5Y        DECIMAL(9,4) NULL,
    SinceInception  DECIMAL(9,4) NULL,
    SourceFileId    BIGINT       NULL,
    CreatedAt       DATETIME2(0) NOT NULL DEFAULT(SYSDATETIME()),
    CONSTRAINT FK_FcFundPerf_Amc  FOREIGN KEY (AmcId)        REFERENCES AssetManagementCompanies(Id),
    CONSTRAINT FK_FcFundPerf_File FOREIGN KEY (SourceFileId) REFERENCES FcDownloadFiles(Id)
);

CREATE TABLE FcNavRaw (
    Id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    AmcId           INT    NOT NULL,
    FundCodeAmc     VARCHAR(30) NOT NULL,
    NavDate         DATE        NOT NULL,
    NavPerUnit      DECIMAL(18,4) NOT NULL,
    OfferPrice      DECIMAL(18,4) NULL,
    BidPrice        DECIMAL(18,4) NULL,
    SourceFileId    BIGINT       NULL,
    CreatedAt       DATETIME2(0) NOT NULL DEFAULT(SYSDATETIME()),
    CONSTRAINT FK_FcNavRaw_Amc  FOREIGN KEY (AmcId)        REFERENCES AssetManagementCompanies(Id),
    CONSTRAINT FK_FcNavRaw_File FOREIGN KEY (SourceFileId) REFERENCES FcDownloadFiles(Id)
);

CREATE TABLE FcBalanceRaw (
    Id                  BIGINT IDENTITY(1,1) PRIMARY KEY,
    AmcId               INT    NOT NULL,
    ExternalUnitholderId VARCHAR(20) NOT NULL,
    FundCodeAmc         VARCHAR(30) NOT NULL,
    BalanceDate         DATE        NOT NULL,
    UnitBalance         DECIMAL(18,4) NOT NULL,
    AmountBalance       DECIMAL(18,2) NULL,
    PendingUnit         DECIMAL(18,4) NULL,
    PendingAmount       DECIMAL(18,2) NULL,
    AverageCost         DECIMAL(18,4) NULL,
    SourceFileId        BIGINT       NULL,
    CreatedAt           DATETIME2(0) NOT NULL DEFAULT(SYSDATETIME()),
    CONSTRAINT FK_FcBalRaw_Amc  FOREIGN KEY (AmcId)        REFERENCES AssetManagementCompanies(Id),
    CONSTRAINT FK_FcBalRaw_File FOREIGN KEY (SourceFileId) REFERENCES FcDownloadFiles(Id)
);
