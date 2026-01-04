/**
 * Credit Card Configuration
 * 
 * These constants define the billing cycle rules:
 * - CARD_TURNOVER_DAY: Day when purchases start counting for the next invoice
 * - CARD_DUE_DAY: Day when the invoice is due for payment
 */

export const CARD_TURNOVER_DAY = 2;
export const CARD_DUE_DAY = 12;

/**
 * Gets the invoice month/year for a purchase date
 * 
 * Logic:
 * - If purchase date is on or after the turnover day, it goes to the NEXT month's invoice
 * - If purchase date is before the turnover day, it goes to the CURRENT month's invoice
 * 
 * Example with turnover day = 2:
 * - Purchase on Jan 1 → January invoice
 * - Purchase on Jan 2 → February invoice
 * - Purchase on Jan 15 → February invoice
 */
export function getInvoiceMonth(purchaseDate: Date): { month: number; year: number } {
  const day = purchaseDate.getDate();
  let month = purchaseDate.getMonth() + 1; // 1-12
  let year = purchaseDate.getFullYear();

  // If purchase is on or after turnover day, invoice is next month
  if (day >= CARD_TURNOVER_DAY) {
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  return { month, year };
}

/**
 * Gets the invoice month/year for a specific installment
 * 
 * @param purchaseDate - The date of the original purchase
 * @param installmentNumber - The installment number (1-based)
 * @returns The month and year for this installment's invoice
 */
export function getInstallmentInvoice(
  purchaseDate: Date,
  installmentNumber: number
): { month: number; year: number } {
  const firstInvoice = getInvoiceMonth(purchaseDate);
  
  // Calculate how many months to add (installment 1 = 0 months added)
  const monthsToAdd = installmentNumber - 1;
  
  let month = firstInvoice.month + monthsToAdd;
  let year = firstInvoice.year;
  
  // Handle year rollover
  while (month > 12) {
    month -= 12;
    year += 1;
  }
  
  return { month, year };
}

/**
 * Gets the due date for a specific invoice
 */
export function getInvoiceDueDate(invoiceMonth: number, invoiceYear: number): Date {
  return new Date(invoiceYear, invoiceMonth - 1, CARD_DUE_DAY);
}

/**
 * Formats a month/year as a readable string
 */
export function formatInvoicePeriod(month: number, year: number): string {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

/**
 * Gets the current invoice period based on today's date
 */
export function getCurrentInvoicePeriod(): { month: number; year: number } {
  return getInvoiceMonth(new Date());
}

/**
 * Calculates the installment amount from total amount
 */
export function calculateInstallmentAmount(
  totalAmount: number,
  installmentsCount: number
): number {
  // Round to 2 decimal places
  return Math.round((totalAmount / installmentsCount) * 100) / 100;
}

/**
 * Generates all installment data for a purchase
 */
export function generateInstallments(
  purchaseDate: Date,
  totalAmount: number,
  installmentsCount: number
): Array<{
  installmentNumber: number;
  amount: number;
  invoiceMonth: number;
  invoiceYear: number;
}> {
  const baseAmount = calculateInstallmentAmount(totalAmount, installmentsCount);
  const installments = [];
  
  // Calculate total with base amount
  const totalWithBase = baseAmount * installmentsCount;
  // Calculate difference (might be a few cents due to rounding)
  const difference = Math.round((totalAmount - totalWithBase) * 100) / 100;
  
  for (let i = 1; i <= installmentsCount; i++) {
    const invoice = getInstallmentInvoice(purchaseDate, i);
    // Add any rounding difference to the last installment
    const amount = i === installmentsCount ? baseAmount + difference : baseAmount;
    
    installments.push({
      installmentNumber: i,
      amount: Math.round(amount * 100) / 100,
      invoiceMonth: invoice.month,
      invoiceYear: invoice.year,
    });
  }
  
  return installments;
}

/**
 * Gets month name in Portuguese
 */
export function getMonthName(month: number): string {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  return months[month - 1] || "";
}

