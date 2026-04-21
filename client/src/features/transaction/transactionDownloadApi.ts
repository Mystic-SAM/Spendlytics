/**
 * Downloads transactions as Excel file
 * This is a standalone API call that bypasses RTK Query to avoid
 * Redux serialization issues with Blob objects
 */
export const downloadTransactionsAsExcel = async (
  filters: {
    keyword?: string;
    type?: string;
    recurringStatus?: string;
    dateRangePreset?: string;
    customFrom?: string;
    customTo?: string;
    sortBy?: string;
    sortOrder?: string;
  },
  token: string
): Promise<void> => {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const url = new URL(`${baseUrl}/transaction/download-excel`);

  // Add query parameters
  if (filters.keyword) url.searchParams.append('keyword', filters.keyword);
  if (filters.type) url.searchParams.append('type', filters.type);
  if (filters.recurringStatus) url.searchParams.append('recurringStatus', filters.recurringStatus);
  if (filters.dateRangePreset) url.searchParams.append('preset', filters.dateRangePreset);
  if (filters.customFrom) url.searchParams.append('from', filters.customFrom);
  if (filters.customTo) url.searchParams.append('to', filters.customTo);
  if (filters.sortBy) url.searchParams.append('sortBy', filters.sortBy);
  if (filters.sortOrder) url.searchParams.append('sortOrder', filters.sortOrder);

  const response = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData?.message || 'Failed to download transactions';
    throw new Error(errorMessage);
  }

  // Get the blob
  const blob = await response.blob();

  // Trigger download
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute(
    'download',
    `Transactions (Spendlytics).xlsx`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
};
