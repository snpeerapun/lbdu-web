# LBDU System - UI Structure & Screen Design

## 📱 ภาพรวม Menu Structure

```
LBDU System
│
├── 🏠 Dashboard
├── 👥 Customer Management
├── 💼 Account Management
├── 📊 Portfolio Management
├── 💰 Transaction Management
├── 🔄 FundConnext Integration
├── 📈 Reports
└── ⚙️ System Administration
```

---

## 1. 🏠 **Dashboard**

### หน้าจอเดียว (No Tabs)

#### Widgets/Cards:
- **Summary Cards**
  - Total Customers (แยกตาม type)
  - Total Accounts (แยกตาม status)
  - Total AUM (Assets Under Management)
  - Pending Approvals
  
- **Quick Stats**
  - New Customers This Month
  - New Accounts This Month
  - Recent Transactions (Latest 10)
  - Pending KYC Reviews
  
- **Charts**
  - Customer Growth (Line Chart)
  - AUM by AMC (Pie Chart)
  - Account Type Distribution (Bar Chart)
  
- **Quick Actions**
  - ➕ Add New Customer
  - ➕ Open New Account
  - 📥 Import FundConnext Data
  - 📊 Generate Report

- **Alerts & Notifications**
  - KYC Expiring Soon
  - Suitability Re-assessment Required
  - FATCA Declaration Pending
  - System Announcements

---

## 2. 👥 **Customer Management**

### 2.1 **Customer List** (Main Screen)

#### Search & Filters:
- Search Bar (ชื่อ, เลขบัตร, รหัสลูกค้า)
- Filter by Customer Type (Individual, Juristic, Minor, Foreign)
- Filter by Status (Active, Inactive, Pending)
- Filter by KYC Status
- Date Range

#### Table Columns:
- Customer Code
- Customer Type
- Name (TH/EN)
- ID/Tax Number
- Mobile/Email
- Status
- KYC Status
- Created Date
- Actions (View, Edit, Delete)

#### Actions:
- ➕ Add New Customer
- 📤 Export to Excel
- 🔄 Sync with FundConnext
- 📋 Bulk Actions

---

### 2.2 **Customer Form** (Add/Edit)

### Tabs Structure:

#### 📋 Tab 1: **Basic Information**
**Individual Customer:**
- Identification
  - ID Card Type (CITIZEN_CARD, PASSPORT, ALIEN)
  - Card Number
  - Card Expiry Date
  - Passport Country (if applicable)
  
- Personal Info (Thai)
  - Title (คำนำหน้า)
  - First Name
  - Last Name
  
- Personal Info (English)
  - Title
  - First Name
  - Last Name
  
- Birth & Contact
  - Birth Date
  - Nationality
  - Mobile Number
  - Email
  - Phone
  - Fax

**Juristic Customer:**
- Company Registration
  - Tax ID
  - Juristic Number
  - Company Type
  
- Company Info (Thai)
  - Company Name
  
- Company Info (English)
  - Company Name
  
- Business Details
  - Establishment Date
  - Registered Capital
  - Business Type

---

#### 👪 Tab 2: **Personal Details** (Individual Only)

**Sections:**

**Marital Status**
- Marital Status (Single, Married, Divorced, Widowed)
- Spouse Information
  - Thai Name (First/Last)
  - English Name (First/Last)

**Occupation & Income**
- Occupation
- Occupation Other (if OTHER selected)
- Business Type
- Business Type Other
- Company Name
- Work Position
- Monthly Income Level (LEVEL1-8)
- Asset Value
- Income Source
- Income Source Other
- Income Source Country

**Political Person**
- Related to Political Person? (Yes/No)
- Position (if Yes)

---

#### 🏠 Tab 3: **Addresses**

**Sub-tabs หรือ Sections:**

**ID Document Address**
- Address No
- Floor
- Building
- Room No
- Soi
- Road
- Moo
- Sub-district
- District
- Province
- Postal Code
- Country

**Current Address**
- Same as ID Document Address? (Checkbox)
- Address fields (same structure)

**Work Address**
- Address fields (same structure)
- Company Name
- Work Position

---

#### 💼 Tab 4: **Investment Profile**

**Risk & Investment**
- Can Accept FX Risk? (Yes/No)
- Can Accept Derivative Investment? (Yes/No)

**Suitability Assessment**
- Risk Level (1-8)
- Evaluation Date
- Expiry Date
- Suitability Questionnaire (Q1-Q12)
  - Display as expandable form

**Knowledge Assessment**
- Assessment Questions (3 questions)
- Assessment Result (Pass/Fail)

**Investment Objective**
- Objective Type
- Objective Other

---

#### 🌍 Tab 5: **Compliance (KYC/FATCA/CRS)**

**FATCA Section**
- FATCA Status (US Person: Yes/No)
- Declaration Date
- Supporting Documents

**CRS Section**
- Place of Birth
  - Country
  - City
- Tax Residence Other Than US? (Yes/No)
- Declaration Date
- Tax Residence Details (Array/Table)
  - Country
  - TIN Number
  - Reason (if no TIN)
  - Reason Description

**CDD (Customer Due Diligence)**
- CDD Score
- CDD Date
- CDD Assessment Notes

**NDID**
- NDID Flag (Yes/No)
- NDID Request ID

---

#### 👔 Tab 6: **Related Persons** (Juristic Only)

**Sub-tabs:**

**Directors**
- Table: List of Directors
  - Name (TH/EN)
  - ID Card Number
  - Is Authorized? (Yes/No)
  - Is Chief Executive? (Yes/No)
  - Nationality
  - Actions (Edit, Delete)
- ➕ Add Director Button

**Contact Persons**
- Table: List of Contact Persons
  - Name (TH/EN)
  - Mobile
  - Email
  - Is Primary? (Yes/No)
  - Actions (Edit, Delete)
- ➕ Add Contact Person Button

**End Beneficiaries**
- Table: List of Beneficiaries
  - Name (TH/EN)
  - ID Card Number
  - Ownership %
  - Actions (Edit, Delete)
- ➕ Add Beneficiary Button

**Authorized Signatories**
- Table: List of Signatories
  - Name (TH/EN)
  - ID Card Number
  - Signature Authority Type
  - Actions (Edit, Delete)
- ➕ Add Signatory Button

---

#### 🏦 Tab 7: **Bank Accounts**

**Table: Customer Bank Accounts**
- Bank Code
- Branch Code
- Account Number
- Account Name
- Currency
- Is Primary? (Yes/No)
- Actions (Edit, Delete)

**Actions:**
- ➕ Add Bank Account

---

#### 📋 Tab 8: **Accounts & Unitholders** (View Only)

**Accounts Section**
- Table: List of Accounts
  - Account Code
  - Account Type
  - Status
  - Open Date
  - Actions (View Details)

**Unitholders Section**
- Table: List of All Unitholders (across all accounts)
  - Unitholder ID
  - AMC Code
  - Account Code
  - Type (SEG/OMN)
  - Currency
  - Status
  - Actions (View Details)

---

#### 📄 Tab 9: **Documents**

**Upload Section**
- Document Type (Dropdown)
- Upload File Button
- Description

**Documents Table**
- Document Type
- File Name
- Upload Date
- Uploaded By
- Actions (View, Download, Delete)

---

#### 📝 Tab 10: **Audit Trail**

**Activity Log Table**
- Date/Time
- Action (Created, Updated, Status Changed)
- Field Changed
- Old Value
- New Value
- Changed By
- IP Address

---

#### 💾 **Footer Actions** (All Tabs)
- ✅ Save
- ❌ Cancel
- 🔄 Save & Create Account (if new customer)

---

## 3. 💼 **Account Management**

### 3.1 **Account List** (Main Screen)

#### Search & Filters:
- Search Bar (Account Code, Customer Name)
- Filter by Account Type (Normal, Joint, By, For)
- Filter by Status (Active, Inactive, Closed)
- Filter by AMC
- Date Range

#### Table Columns:
- Account Code
- Customer Name
- Account Type
- IC License
- Open Date
- Status
- Total AUM
- Unitholders Count
- Actions (View, Edit, Close)

#### Actions:
- ➕ Open New Account
- 📤 Export to Excel

---

### 3.2 **Account Form** (Add/Edit)

### Tabs Structure:

#### 📋 Tab 1: **Account Information**

**Basic Info**
- Customer (Select/Autocomplete)
- Account Type (Normal, Joint, By, For)
- IC License
- Open Date
- Close Date (if applicable)

**Investment Details**
- Investment Objective
- Objective Other

**Mailing Preferences**
- Mailing Address Same As (ID Document, Current, Work, Custom)
- Mailing Method (Post, Email, Both)

**Joint Account (if Type = Joint)**
- Joint Type (AND, OR)
- Joint Members (2-4)
  - Member 1 (Primary)
  - Member 2
  - Member 3 (optional)
  - Member 4 (optional)

**By/For Account (if Type = By)**
- By Customer (Investor)
- For Customer (Beneficiary)
- Relationship

**Status**
- Account Status (Active, Inactive, Closed)
- Process Status

---

#### 🏦 Tab 2: **Bank Accounts**

**Sub-tabs:**

**Subscription Bank Accounts**
- Table of Banks
  - Bank Code
  - Branch Code
  - Account Number
  - Currency
  - Finnet Customer No
  - Is Default?
  - Actions
- ➕ Add Bank Account

**Redemption Bank Accounts**
- Table of Banks
  - Bank Code
  - Branch Code
  - Account Number
  - Currency
  - SA Reference Log
  - DDR Timestamp Reference
  - Is Default?
  - Actions
- ➕ Add Bank Account

---

#### 👥 Tab 3: **Unitholders**

**Table: Unitholders List**
- Unitholder ID
- AMC Code
- Unitholder Type (SEG, OMN)
- Currency
- Status
- Open Date
- Actions (View, Edit, Add Bank Accounts)

**Actions:**
- ➕ Add Unitholder

**Unitholder Detail Popup/Drawer:**
- Unitholder Information
- Subscription Bank Accounts (Table)
- Redemption Bank Accounts (Table)

---

#### 💰 Tab 4: **Fund Holdings**

**Table: Holdings by Fund**
- AMC Code
- Fund Code
- Fund Name
- Unitholder ID
- Unit Balance
- Average Cost
- Current NAV
- Market Value
- Unrealized Gain/Loss
- %Gain/Loss

**Summary Cards:**
- Total Market Value
- Total Cost
- Total Unrealized Gain/Loss

---

#### 📊 Tab 5: **Transactions**

**Filters:**
- Transaction Type (Buy, Sell, Switch)
- Date Range
- Fund

**Table: Transaction History**
- Date
- Type
- Fund Code
- Fund Name
- Units
- Amount
- NAV
- Status
- Actions (View Details)

---

#### 📄 Tab 6: **Documents**

**Similar to Customer Documents Tab**

---

#### 📝 Tab 7: **Audit Trail**

**Similar to Customer Audit Trail Tab**

---

## 4. 📊 **Portfolio Management**

### 4.1 **Customer Portfolio**

#### Screen Layout:

**Header Section:**
- Customer Selection (Autocomplete)
- As of Date

**Summary Cards:**
- Total AUM
- Number of Accounts
- Number of Unitholders
- Number of Funds

**Tabs:**

#### Tab 1: **Holdings Summary**
- Pie Chart: Asset Allocation by AMC
- Pie Chart: Asset Allocation by Fund Type
- Table: Holdings by Fund

#### Tab 2: **Performance**
- Line Chart: Portfolio Value Over Time
- Table: Fund Performance

#### Tab 3: **Transactions**
- Table: All Transactions across accounts

---

### 4.2 **Company Portfolio**

#### Similar to Customer Portfolio but aggregated
- Top 10 Customers by AUM
- AUM by AMC
- AUM by Fund Type
- Transaction Volume

---

## 5. 💰 **Transaction Management**

### 5.1 **Transaction Entry**

**Screen:** Single Form

**Sections:**
- Customer/Account Selection
- Transaction Type (Subscription, Redemption, Switching)
- Fund Selection
- Amount/Units
- Payment Method
- Bank Account
- Effective Date
- Remarks

**Actions:**
- Submit
- Save as Draft
- Cancel

---

### 5.2 **Transaction Approval**

**Queue Table:**
- Transaction ID
- Date
- Customer
- Type
- Fund
- Amount
- Submitted By
- Actions (Approve, Reject, View)

---

### 5.3 **Transaction History**

**Similar to Account Transaction Tab but system-wide**

---

## 6. 🔄 **FundConnext Integration**

### 6.1 **Import Dashboard**

**Tabs:**

#### Tab 1: **Manual Import**

**Upload Section:**
- Import Type (Individual, Juristic, Joint, By, For)
- File Upload (Browse)
- File Date
- Notes

**Upload History Table:**
- Run ID
- Import Type
- File Name
- Date
- Total Records
- Success
- Failed
- Status
- Actions (View Details, Rollback)

---

#### Tab 2: **API Sync**

**Sync Configuration:**
- Sync Type (Full, Incremental)
- Date Range
- Customer Filter

**Sync Actions:**
- ▶️ Start Sync
- ⏸️ Pause
- 🔄 Resume
- ⏹️ Stop

**Sync Progress:**
- Progress Bar
- Current Status
- Records Processed
- Success/Failed Count

**Sync History Table:**
- Similar to Import History

---

#### Tab 3: **Import Results**

**Filters:**
- Import Run
- Status (Success, Failed, Pending Review)
- Record Type

**Results Table:**
- Record Type
- External ID
- Customer Name
- Status
- Error Message
- Mapped Customer
- Mapped Account
- Actions (View Details, Retry, Manual Review)

---

#### Tab 4: **Review Queue**

**Table: Records Needing Manual Review**
- Issue Type (Missing Profile, Duplicate, Validation Error)
- Record Type
- External ID
- Issue Description
- Priority
- Status
- Actions (Review, Resolve, Skip)

**Review Detail Popup:**
- Show raw FC data
- Show matched/suggested LBDU data
- Allow manual mapping
- Actions (Accept, Edit, Reject)

---

#### Tab 5: **Mapping Rules**

**Table: Field Mapping Configuration**
- Source Type
- Source Field
- Target Table
- Target Field
- Mapping Type (Direct, Lookup, Transform)
- Is Active
- Actions (Edit, Delete)

**Actions:**
- ➕ Add Mapping Rule

---

#### Tab 6: **External ID Mapping**

**Search/Filter:**
- External System
- Entity Type
- External ID / Internal ID

**Table:**
- External System
- External Entity Type
- External ID
- Internal Entity Type
- Internal ID
- Mapped Date
- Actions (View, Unlink)

---

## 7. 📈 **Reports**

### Report Categories:

#### 7.1 **Customer Reports**
- Customer List (with filters)
- New Customers Report
- KYC Expiry Report
- Suitability Re-assessment Report
- Customer Demographics

#### 7.2 **Account Reports**
- Account List (with filters)
- New Accounts Report
- Account by Type
- Closed Accounts Report

#### 7.3 **Portfolio Reports**
- Holdings Report (by customer/AMC/fund)
- AUM Report
- Performance Report
- Asset Allocation Report

#### 7.4 **Transaction Reports**
- Transaction Summary
- Transaction by Type
- Transaction by Fund
- Commission Report

#### 7.5 **Compliance Reports**
- FATCA Report
- CRS Report
- CDD Report
- Political Person Report

#### 7.6 **FundConnext Reports**
- Import Summary Report
- Sync Status Report
- Mapping Quality Report
- Error Analysis Report

**Report Screen Layout:**
- Report Selection (Dropdown/Tree)
- Parameters Panel (Filters, Date Range, etc.)
- ▶️ Generate Button
- Results Display (Table/Chart)
- 📤 Export (Excel, PDF)

---

## 8. ⚙️ **System Administration**

### Tabs:

#### Tab 1: **User Management**
- User List (Table)
- Add/Edit User Form
- Role Assignment

#### Tab 2: **Role & Permissions**
- Role List
- Permission Matrix
- Add/Edit Role

#### Tab 3: **AMC Management**
- AMC List (Table)
- Add/Edit AMC Form
- AMC Configuration

#### Tab 4: **Fund Management**
- Fund List (from your earlier design)
- Add/Edit Fund Form with all tabs

#### Tab 5: **Master Data**
- Occupation List
- Business Type List
- Document Category List
- Transaction Type List
- etc.

#### Tab 6: **System Configuration**
- General Settings
- Email Templates
- Notification Settings
- Integration Settings (FC API Config)

#### Tab 7: **Audit Logs**
- System Activity Log
- Login History
- API Call Logs

---

## 🎨 **UI/UX Best Practices**

### Navigation:
- **Sidebar Menu** (Collapsible)
- **Breadcrumb** (Current location)
- **Quick Actions** (Floating button ➕)

### Search:
- **Global Search** (Top bar)
- **Autocomplete** suggestions
- **Recent Items** dropdown

### Forms:
- **Wizard** for complex multi-step forms
- **Inline Validation** (real-time)
- **Required Field** indicators (*)
- **Help Text** / Tooltips
- **Save Draft** functionality

### Tables:
- **Pagination** (10/25/50/100 per page)
- **Sorting** (clickable headers)
- **Filtering** (column filters)
- **Bulk Actions** (checkbox selection)
- **Export** (Excel, CSV, PDF)
- **Column Chooser** (show/hide columns)

### Notifications:
- **Toast Messages** (Success, Error, Warning, Info)
- **Confirmation Dialogs** (before delete/critical actions)
- **Loading Indicators** (Spinner, Progress Bar)

### Responsive:
- **Mobile-friendly** tables (card view on mobile)
- **Collapsible** sections
- **Touch-friendly** buttons

---

## 📊 **Summary: Total Screens & Tabs**

### Main Screens: **8**
1. Dashboard (1 screen)
2. Customer Management (2 screens)
3. Account Management (2 screens)
4. Portfolio Management (2 screens)
5. Transaction Management (3 screens)
6. FundConnext Integration (1 screen)
7. Reports (1 screen)
8. System Administration (1 screen)

### Customer Form Tabs: **10**
1. Basic Information
2. Personal Details
3. Addresses
4. Investment Profile
5. Compliance (KYC/FATCA/CRS)
6. Related Persons (Juristic)
7. Bank Accounts
8. Accounts & Unitholders
9. Documents
10. Audit Trail

### Account Form Tabs: **7**
1. Account Information
2. Bank Accounts (with sub-tabs)
3. Unitholders
4. Fund Holdings
5. Transactions
6. Documents
7. Audit Trail

### FundConnext Integration Tabs: **6**
1. Manual Import
2. API Sync
3. Import Results
4. Review Queue
5. Mapping Rules
6. External ID Mapping

### Fund Management Tabs: **9**
(From your earlier design)
1. Fund Details
2. NAVs
3. Fees
4. Cutoff Times
5. Trade Conditions
6. Holidays
7. Switching Rules
8. Performance
9. Transaction Holiday Rules

### System Administration Tabs: **7**
1. User Management
2. Role & Permissions
3. AMC Management
4. Fund Management
5. Master Data
6. System Configuration
7. Audit Logs

---

## 🎯 Priority Implementation (Phase-based)

### Phase 1: Core (MVP)
- ✅ Customer Management (Individual only)
- ✅ Account Management (Normal type only)
- ✅ Basic Unitholder
- ✅ Basic Bank Accounts

### Phase 2: Advanced Customer
- ✅ Juristic Customer
- ✅ Joint Account
- ✅ By/For Account
- ✅ Full KYC/FATCA/CRS

### Phase 3: Integration
- ✅ FundConnext Import (Manual)
- ✅ FundConnext API Sync
- ✅ Review Queue
- ✅ Mapping

### Phase 4: Portfolio & Reports
- ✅ Portfolio Management
- ✅ Transaction Management
- ✅ Reports

### Phase 5: Administration
- ✅ User Management
- ✅ Master Data
- ✅ System Config

---

**Total Estimated Screens: 50-60**
**Total Estimated Tabs: 80-100**

ต้องการให้ผมออกแบบ wireframe หรือ mockup ของหน้าจอไหนเป็นพิเศษไหมครับ? 🎨


[HttpGet("{id}")]
public IActionResult GetCustomerDetail(long id)
{
    var customer = _repo.Fetch<Customer>()
        .Where(new { id = id })
        // Include direct relations
        .Include(c => c.CustomerRelationsPersons, rel => {
            rel.Select("Id", "RelationType", "FirstNameTh", "LastNameTh", "CardNumber");
        })
        .Include(c => c.CustomerAddresses, addr => {
            addr.Select("Id", "AddressType", "District", "Province", "PostalCode");
        })
        // Include Accounts with nested includes
        .Include(c => c.Accounts, account => {
            account.Select(a => new { 
                a.Id, 
                a.AccountCode, 
                a.AccountType, 
                a.AccountStatus,
                a.OpenDate 
            });
            
            // Nested: BankAccounts
            account.Include(a => a.BankAccounts, bank => {
                bank.Select(b => new {
                    b.Id,
                    b.BankCode,
                    b.BankAccountNo,
                    b.BankAccountName,
                    b.IsDefault
                });
            });
            
            // Nested: AccountJointMembers
            account.Include(a => a.AccountJointMembers, joint => {
                joint.Include(j => j.Customer, member => {
                    member.Select("Id", "FirstNameTh", "LastNameTh");
                });
            });
            
            // Nested: Unitholders
            account.Include(a => a.Unitholders, unitholder => {
                unitholder.Select(u => new {
                    u.Id,
                    u.ExternalUnitholderId,
                    u.Status,
                    u.Currency
                });
                
                unitholder.Include(u => u.Amc, amc => {
                    amc.Select("Id", "ShortName", "FullNameTh");
                });
            });
        })
        .FirstOrDefault();
    
    if (customer == null)
        return NotFound(new { message = "Customer not found" });
    
    return Ok(customer);
}