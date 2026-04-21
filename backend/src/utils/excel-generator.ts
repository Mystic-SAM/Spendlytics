import ExcelJS from "exceljs";
import { Logger } from "./logger.js";
import type { TransactionDocument } from "../models/transaction.model.js";

export interface SummaryData {
  totalIncome: number;
  totalExpenses: number;
  totalInvestment: number;
  availableBalance?: number;
  savingsRate?: number;
  categories?: Record<string, { amount: number; percentage: number }>;
  period?: string;
}

/**
 * Defines the column structure for the transactions sheet.
 * Each column has metadata for proper Excel formatting.
 */
const TRANSACTION_COLUMNS = [
  { header: "Title", key: "title", width: 25 },
  { header: "Amount (₹)", key: "amount", width: 15 },
  { header: "Date", key: "date", width: 15 },
  { header: "Type", key: "type", width: 15 },
  { header: "Category", key: "category", width: 18 },
  { header: "Description", key: "description", width: 28 },
  { header: "Payment Method", key: "paymentMethod", width: 16 },
  { header: "Recurring", key: "isRecurring", width: 12 },
] as const;

/**
 * Applies professional styling to the header row
 */
const applyHeaderStyle = (worksheet: ExcelJS.Worksheet): void => {
  const headerRow = worksheet.getRow(1);

  headerRow.font = {
    bold: true,
    color: { argb: "FFFFFFFF" }, // White
    size: 11,
  };

  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1F4E78" }, // Dark Blue
  };

  headerRow.alignment = {
    horizontal: "center",
    vertical: "middle",
    wrapText: true,
  };

  headerRow.border = {
    top: { style: "thin", color: { argb: "FF000000" } },
    left: { style: "thin", color: { argb: "FF000000" } },
    bottom: { style: "thin", color: { argb: "FF000000" } },
    right: { style: "thin", color: { argb: "FF000000" } },
  };
};

/**
 * Applies formatting to transaction data rows with color-coded Type column
 */
const applyRowStyles = (
  worksheet: ExcelJS.Worksheet,
  startRow: number,
  endRow: number,
): void => {
  // Type column color mapping
  const typeColorMap: Record<string, string> = {
    EXPENSE: "FFC00000", // Red
    INCOME: "FF00B050", // Green
    INVESTMENT: "FF0070C0", // Blue
  };

  for (let rowNum = startRow; rowNum <= endRow; rowNum++) {
    const row = worksheet.getRow(rowNum);

    row.alignment = {
      horizontal: "left",
      vertical: "middle",
      wrapText: true,
    };

    row.border = {
      top: { style: "thin", color: { argb: "FFD3D3D3" } },
      left: { style: "thin", color: { argb: "FFD3D3D3" } },
      bottom: { style: "thin", color: { argb: "FFD3D3D3" } },
      right: { style: "thin", color: { argb: "FFD3D3D3" } },
    };

    // Alternate row colors for better readability
    if (rowNum % 2 === 0) {
      row.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF2F2F2" }, // Light gray
      };
    }

    // Format amount column as currency
    const amountCell = row.getCell("amount");
    amountCell.numFmt = '₹#,##0.00';
    amountCell.alignment = { horizontal: "right", vertical: "middle" };

    // Format date column
    const dateCell = row.getCell("date");
    dateCell.numFmt = 'dd/mm/yyyy';
    dateCell.alignment = { horizontal: "center", vertical: "middle" };

    // Apply color to Type column based on transaction type
    const typeCell = row.getCell("type");
    const typeValue = typeCell.value as string;
    const colorCode = typeColorMap[typeValue] || "FF000000";
    typeCell.font = {
      bold: true,
      color: { argb: colorCode },
    };
    typeCell.alignment = { horizontal: "center", vertical: "middle" };
  }
};

/**
 * Creates and formats the transactions sheet
 */
const createTransactionsSheet = (
  workbook: ExcelJS.Workbook,
  transactions: TransactionDocument[],
): void => {
  Logger.debug("Creating transactions sheet", {
    transactionCount: transactions.length,
  });

  const worksheet = workbook.addWorksheet("Transactions");

  // Add columns
  worksheet.columns = TRANSACTION_COLUMNS as any;

  // Add data rows
  const dataRows = transactions.map((transaction: TransactionDocument) => ({
    title: transaction.title,
    amount: transaction.amount,
    date: new Date(transaction.date),
    type: transaction.type,
    category: transaction.category,
    description: transaction.description || "-",
    paymentMethod: transaction.paymentMethod,
    isRecurring: transaction.isRecurring ? "Yes" : "No",
  }));

  worksheet.addRows(dataRows);

  // Apply styles
  applyHeaderStyle(worksheet);
  applyRowStyles(worksheet, 2, transactions.length + 1);

  // Freeze the header row
  worksheet.views = [{ state: "frozen", ySplit: 1 }];

  Logger.debug("Transactions sheet created successfully", {
    rowCount: transactions.length,
  });
};

/**
 * Creates and formats the summary sheet with aggregated data
 */
const createSummarySheet = (
  workbook: ExcelJS.Workbook,
  summary: SummaryData,
): void => {
  Logger.debug("Creating summary sheet", { period: summary.period });

  const worksheet = workbook.addWorksheet("Summary");

  // Set column widths
  worksheet.columns = [
    { width: 25 },
    { width: 20 },
  ];

  let currentRow = 1;

  // Title section
  const titleCell = worksheet.getCell(`A${currentRow}`);
  titleCell.value = summary.categories ? "Financial Report Summary" : "Financial Summary";
  titleCell.font = {
    bold: true,
    size: 14,
    color: { argb: "FF1F4E78" },
  };
  titleCell.alignment = { horizontal: "left", vertical: "middle" };
  currentRow++;

  // Period section
  if (summary.period) {
    const periodCell = worksheet.getCell(`A${currentRow}`);
    periodCell.value = "Period";
    periodCell.font = { bold: true };
    worksheet.getCell(`B${currentRow}`).value = summary.period;
    currentRow++;
  }

  // Add spacing
  currentRow++;

  // Summary metrics section
  const metricsHeader = worksheet.getCell(`A${currentRow}`);
  metricsHeader.value = "Financial Metrics";
  metricsHeader.font = {
    bold: true,
    size: 12,
    color: { argb: "FFFFFFFF" },
  };
  metricsHeader.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1F4E78" },
  };
  worksheet.getCell(`B${currentRow}`).value = "";
  worksheet.getCell(`B${currentRow}`).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1F4E78" },
  };
  currentRow++;

  // Summary data rows
  const metricsData = [
    { label: "Total Income", value: summary.totalIncome },
    { label: "Total Expenses", value: summary.totalExpenses },
    { label: "Total Investment", value: summary.totalInvestment },
  ];

  if (summary.availableBalance !== undefined) {
    metricsData.push({ label: "Available Balance", value: summary.availableBalance });
  }
  if (summary.savingsRate !== undefined) {
    metricsData.push({ label: "Savings Rate (%)", value: summary.savingsRate });
  }

  for (const metric of metricsData) {
    const labelCell = worksheet.getCell(`A${currentRow}`);
    labelCell.value = metric.label;
    labelCell.font = { bold: true };
    labelCell.alignment = { horizontal: "left" };

    const valueCell = worksheet.getCell(`B${currentRow}`);
    valueCell.value = metric.value;

    if (metric.label !== "Savings Rate (%)") {
      valueCell.numFmt = '₹#,##0.00';
    } else {
      valueCell.numFmt = '0.00"%"';
    }
    valueCell.alignment = { horizontal: "right" };

    currentRow++;
  }

  if (summary.categories) {
    // Add spacing
    currentRow++;

    // Top spending categories section
    const categoriesHeader = worksheet.getCell(`A${currentRow}`);
    categoriesHeader.value = "Top Spending Categories";
    categoriesHeader.font = {
      bold: true,
      size: 12,
      color: { argb: "FFFFFFFF" },
    };
    categoriesHeader.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF70AD47" }, // Green
    };
    worksheet.getCell(`B${currentRow}`).value = "";
    worksheet.getCell(`B${currentRow}`).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF70AD47" },
    };
    currentRow++;

    // Category table header
    const categoryLabelCell = worksheet.getCell(`A${currentRow}`);
    categoryLabelCell.value = "Category";
    categoryLabelCell.font = { bold: true };
    categoryLabelCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE2EFDA" },
    };

    const categoryValueCell = worksheet.getCell(`B${currentRow}`);
    categoryValueCell.value = "Amount / Percentage";
    categoryValueCell.font = { bold: true };
    categoryValueCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE2EFDA" },
    };
    currentRow++;

    // Category data
    const categoryEntries = Object.entries(summary.categories).sort(
      ([, a], [, b]) => b.amount - a.amount,
    );

    for (const [category, data] of categoryEntries) {
      const catCell = worksheet.getCell(`A${currentRow}`);
      catCell.value = category;
      catCell.alignment = { horizontal: "left" };

      const amountPercentageCell = worksheet.getCell(`B${currentRow}`);
      amountPercentageCell.value = `₹${data.amount.toFixed(2)} (${data.percentage}%)`;
      amountPercentageCell.alignment = { horizontal: "right" };

      currentRow++;
    }
  }

  // Apply borders to all data cells
  for (let row = 1; row <= currentRow - 1; row++) {
    const cellA = worksheet.getCell(`A${row}`);
    const cellB = worksheet.getCell(`B${row}`);

    [cellA, cellB].forEach((cell) => {
      // Skip styling if the row is purely for empty spacing (no values in A or B)
      if (!cellA.value && !cellB.value && !cellA.fill) return;

      cell.border = {
        top: { style: "thin", color: { argb: "FFD3D3D3" } },
        left: { style: "thin", color: { argb: "FFD3D3D3" } },
        bottom: { style: "thin", color: { argb: "FFD3D3D3" } },
        right: { style: "thin", color: { argb: "FFD3D3D3" } },
      };
    });
  }

  Logger.debug("Summary sheet created successfully", {
    metricsCount: metricsData.length,
    categoriesCount: summary.categories ? Object.keys(summary.categories).length : 0,
  });
};

/**
 * Generates an Excel file containing transactions and summary data
 * with professional formatting and styling.
 *
 * @param transactions - Array of transaction documents
 * @param summary - Summary data including totals and categories
 * @returns Buffer containing the Excel file
 * @throws Error if Excel generation fails
 */
export const generateReportExcel = async (
  transactions: TransactionDocument[],
  summary: SummaryData,
): Promise<Buffer> => {
  Logger.debug("Starting Excel generation", {
    transactionCount: transactions.length,
    period: summary.period,
  });

  try {
    const startTime = Date.now();

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Spendlytics";
    workbook.created = new Date();
    workbook.modified = new Date();

    // Create sheets
    createTransactionsSheet(workbook, transactions);
    createSummarySheet(workbook, summary);

    // Generate buffer
    const buffer = (await workbook.xlsx.writeBuffer()) as unknown as Buffer;

    const duration = Date.now() - startTime;

    Logger.info("Excel file generated successfully", {
      transactionCount: transactions.length,
      period: summary.period,
      fileSizeKB: ((buffer as any).length / 1024).toFixed(2),
      duration: `${duration}ms`,
    });

    return buffer;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.error("Failed to generate Excel file", error, {
      period: summary.period,
      errorMessage,
    });
    throw error;
  }
};
