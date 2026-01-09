import { getInstallmentsByMonth, getAvailableInvoicePeriods } from "@/domains/installments";
import { getCurrentInvoicePeriod, getMonthName } from "@/lib/credit-card";
import InstallmentsList from "./InstallmentsList";
import MonthSelector from "./MonthSelector";

export const dynamic = "force-dynamic";

interface InstallmentsPageProps {
  searchParams: Promise<{ month?: string; year?: string }>;
}

export default async function InstallmentsPage({ searchParams }: InstallmentsPageProps) {
  const params = await searchParams;
  const currentPeriod = getCurrentInvoicePeriod();

  // Parse month/year from search params or use current
  const month = params.month ? parseInt(params.month, 10) : currentPeriod.month;
  const year = params.year ? parseInt(params.year, 10) : currentPeriod.year;

  // Get installments for the selected period
  const installments = await getInstallmentsByMonth(month, year);
  const availablePeriods = await getAvailableInvoicePeriods();

  // Calculate totals
  const totalAmount = installments.reduce((sum, i) => sum + Number(i.amount), 0);
  const paidAmount = installments
    .filter((i) => i.status === "PAID")
    .reduce((sum, i) => sum + Number(i.amount), 0);
  const pendingAmount = totalAmount - paidAmount;

  return (
    <div className="space-y-6">
      {/* Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Fatura de {getMonthName(month)}/{year}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {installments.length} parcela{installments.length !== 1 ? "s" : ""} neste período
          </p>
        </div>

        <MonthSelector
          currentMonth={month}
          currentYear={year}
          availablePeriods={availablePeriods}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Total da Fatura</p>
          <p className="text-2xl font-semibold text-gray-900">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(totalAmount)}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Pago</p>
          <p className="text-2xl font-semibold text-emerald-600">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(paidAmount)}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Pendente</p>
          <p className="text-2xl font-semibold text-amber-600">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(pendingAmount)}
          </p>
        </div>
      </div>

      {/* Installments List */}
      <InstallmentsList
        installments={installments}
        invoiceMonth={month}
        invoiceYear={year}
      />
    </div>
  );
}

