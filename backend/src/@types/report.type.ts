export type ReportType = {
  period: string;
  totalIncome: number;
  totalExpenses: number;
  totalInvestment: number;
  availableBalance: number;
  savingsRate: number;
  topSpendingCategories: Array<{ name: string; amount: number; percent: number }>;
  insights: string[];
};
