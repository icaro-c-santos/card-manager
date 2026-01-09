import { getTotalSpendingByPerson, getMonthlySpending } from "@/domains/reports";
import { getCurrentInvoicePeriod, getMonthName } from "@/lib/credit-card";
import MonthlyReportSelector from "./MonthlyReportSelector";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const currentPeriod = getCurrentInvoicePeriod();
  const totalSpending = await getTotalSpendingByPerson();
  const currentMonthSpending = await getMonthlySpending(currentPeriod.month, currentPeriod.year);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 lg:gap-4">
        <div className="card p-3 lg:p-4">
          <h3 className="text-xs lg:text-sm font-medium text-gray-500">Total</h3>
          <p className="text-base lg:text-2xl font-bold text-gray-900 mt-0.5 lg:mt-1 truncate">
            {formatCurrency(totalSpending.reduce((sum, p) => sum + p.totalAmount, 0))}
          </p>
        </div>
        <div className="card p-3 lg:p-4">
          <h3 className="text-xs lg:text-sm font-medium text-gray-500">Pago</h3>
          <p className="text-base lg:text-2xl font-bold text-emerald-600 mt-0.5 lg:mt-1 truncate">
            {formatCurrency(totalSpending.reduce((sum, p) => sum + p.paidAmount, 0))}
          </p>
        </div>
        <div className="card p-3 lg:p-4">
          <h3 className="text-xs lg:text-sm font-medium text-gray-500">Pendente</h3>
          <p className="text-base lg:text-2xl font-bold text-amber-600 mt-0.5 lg:mt-1 truncate">
            {formatCurrency(totalSpending.reduce((sum, p) => sum + p.pendingAmount, 0))}
          </p>
        </div>
      </div>

      {/* Total by Person */}
      <div className="card p-4 lg:p-6">
        <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">
          Total por Pessoa
        </h2>
        
        {totalSpending.length === 0 ? (
          <p className="text-gray-500 text-center py-8 text-sm">Nenhum dado disponível</p>
        ) : (
          <div className="space-y-2">
            {totalSpending.map((person) => (
              <div key={person.personId} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm text-gray-900">{person.personName}</p>
                  <p className="font-semibold text-sm text-gray-900">
                    {formatCurrency(person.totalAmount)}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-600">
                    Pago: {formatCurrency(person.paidAmount)}
                  </span>
                  <span className="text-amber-600">
                    Pendente: {formatCurrency(person.pendingAmount)}
                  </span>
                  <span className="text-gray-500">
                    {person.paidInstallmentsCount}/{person.installmentsCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Current Month */}
      <div className="card p-4 lg:p-6">
        <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">
          Fatura de {getMonthName(currentPeriod.month)} {currentPeriod.year}
        </h2>
        
        {currentMonthSpending.byPerson.length === 0 ? (
          <p className="text-gray-500 text-center py-8 text-sm">
            Nenhuma parcela neste mês
          </p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 lg:gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-sm lg:text-xl font-bold truncate">
                  {formatCurrency(currentMonthSpending.totalAmount)}
                </p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3">
                <p className="text-xs text-emerald-600">Pago</p>
                <p className="text-sm lg:text-xl font-bold text-emerald-700 truncate">
                  {formatCurrency(currentMonthSpending.paidAmount)}
                </p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3">
                <p className="text-xs text-amber-600">Pendente</p>
                <p className="text-sm lg:text-xl font-bold text-amber-700 truncate">
                  {formatCurrency(currentMonthSpending.pendingAmount)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {currentMonthSpending.byPerson.map((person) => (
                <div key={person.personId} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm text-gray-900">{person.personName}</p>
                    <p className="font-semibold text-sm text-gray-900">
                      {formatCurrency(person.totalAmount)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-600">
                      Pago: {formatCurrency(person.paidAmount)}
                    </span>
                    <span className="text-amber-600">
                      Pendente: {formatCurrency(person.pendingAmount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Monthly Report Selector */}
      <MonthlyReportSelector />
    </div>
  );
}
