export interface BudgetItem {
  id: number;
  title: string;
  category: string;
  subCategory: string;
  description:string;
  totalAmount: number;
  monthlyAmounts: {
    [key: string]: number;  // month number (1-12) as key
  };
}

export interface Budget {
  id: number;
  fiscalYear: number;
  title:string;
  department: string;
  requestedBy: string;
  totalAmount: number;
  description?: string;
  items: BudgetItem[];
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface Department {
  id: number;
  name: string;
  code: string;
}

export interface BudgetCategory {
  id: number;
  name: string;
  code: string;
  subCategories: BudgetSubCategory[];
}

export interface BudgetSubCategory {
  id: number;
  name: string;
  code: string;
  categoryId: number;
}
