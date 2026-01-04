import { getTotalSpendingByPerson, getMonthlySpending } from "@/domains/reports";
import { getCurrentInvoicePeriod, getMonthName } from "@/lib/credit-card";
import MonthlyReportSelector from "./MonthlyReportSelector";

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
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Total Geral</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatCurrency(totalSpending.reduce((sum, p) => sum + p.totalAmount, 0))}
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Pago</h3>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {formatCurrency(totalSpending.reduce((sum, p) => sum + p.paidAmount, 0))}
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Pendente</h3>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {formatCurrency(totalSpending.reduce((sum, p) => sum + p.pendingAmount, 0))}
          </p>
        </div>
      </div>

      {/* Total by Person */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Total por Pessoa (Geral)
        </h2>
        
        {totalSpending.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhum dado disponível</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Pessoa</th>
                  <th className="text-right">Total</th>
                  <th className="text-right">Pago</th>
                  <th className="text-right">Pendente</th>
                  <th className="text-center">Parcelas</th>
                </tr>
              </thead>
              <tbody>
                {totalSpending.map((person) => (
                  <tr key={person.personId}>
                    <td className="font-medium">{person.personName}</td>
                    <td className="text-right">{formatCurrency(person.totalAmount)}</td>
                    <td className="text-right text-emerald-600">
                      {formatCurrency(person.paidAmount)}
                    </td>
                    <td className="text-right text-amber-600">
                      {formatCurrency(person.pendingAmount)}
                    </td>
                    <td className="text-center text-gray-500">
                      {person.paidInstallmentsCount}/{person.installmentsCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Current Month */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Fatura de {getMonthName(currentPeriod.month)} {currentPeriod.year}
        </h2>
        
        {currentMonthSpending.byPerson.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Nenhuma parcela neste mês
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-xl font-bold">
                  {formatCurrency(currentMonthSpending.totalAmount)}
                </p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-4">
                <p className="text-sm text-emerald-600">Pago</p>
                <p className="text-xl font-bold text-emerald-700">
                  {formatCurrency(currentMonthSpending.paidAmount)}
                </p>
              </div>
              <div className="bg-amber-50 rounded-lg p-4">
                <p className="text-sm text-amber-600">Pendente</p>
                <p className="text-xl font-bold text-amber-700">
                  {formatCurrency(currentMonthSpending.pendingAmount)}
                </p>
              </div>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Pessoa</th>
                    <th className="text-right">Total</th>
                    <th className="text-right">Pago</th>
                    <th className="text-right">Pendente</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMonthSpending.byPerson.map((person) => (
                    <tr key={person.personId}>
                      <td className="font-medium">{person.personName}</td>
                      <td className="text-right">{formatCurrency(person.totalAmount)}</td>
                      <td className="text-right text-emerald-600">
                        {formatCurrency(person.paidAmount)}
                      </td>
                      <td className="text-right text-amber-600">
                        {formatCurrency(person.pendingAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Monthly Report Selector */}
      <MonthlyReportSelector />
    </div>
  );
}

