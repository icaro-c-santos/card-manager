import { notFound } from "next/navigation";
import Link from "next/link";
import { getPurchaseById } from "@/domains/purchases";
import { getMonthName } from "@/lib/credit-card";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PurchaseDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const purchase = await getPurchaseById(id);

  if (!purchase) {
    notFound();
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const paidCount = purchase.installments.filter((i) => i.status === "PAID").length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/purchases"
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h2 className="text-xl font-semibold text-gray-900">
          Detalhes da Compra
        </h2>
      </div>

      {/* Purchase Info */}
      <div className="card">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500">Pessoa</p>
            <p className="font-medium">{purchase.person.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Data da Compra</p>
            <p className="font-medium">{formatDate(purchase.purchaseDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Valor Total</p>
            <p className="font-medium">{formatCurrency(Number(purchase.totalAmount))}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Parcelas Pagas</p>
            <p className="font-medium">{paidCount}/{purchase.installmentsCount}</p>
          </div>
        </div>
        {purchase.description && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-500">Descrição</p>
            <p className="font-medium">{purchase.description}</p>
          </div>
        )}
      </div>

      {/* Installments */}
      <div className="card p-0">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-900">Parcelas</h3>
        </div>
        <div className="table-container border-0">
          <table>
            <thead>
              <tr>
                <th>Parcela</th>
                <th>Fatura</th>
                <th className="text-right">Valor</th>
                <th className="text-center">Status</th>
                <th>Data Pagamento</th>
                <th className="text-center">Comprovante</th>
              </tr>
            </thead>
            <tbody>
              {purchase.installments.map((installment) => (
                <tr key={installment.id}>
                  <td>
                    {installment.installmentNumber}/{purchase.installmentsCount}
                  </td>
                  <td>
                    {getMonthName(installment.invoiceMonth)} {installment.invoiceYear}
                  </td>
                  <td className="text-right">
                    {formatCurrency(Number(installment.amount))}
                  </td>
                  <td className="text-center">
                    <span className={installment.status === "PAID" ? "badge-paid" : "badge-pending"}>
                      {installment.status === "PAID" ? "Pago" : "Pendente"}
                    </span>
                  </td>
                  <td>
                    {installment.paidAt ? formatDate(installment.paidAt) : "-"}
                  </td>
                  <td className="text-center">
                    {installment.paymentReceipt ? (
                      <a
                        href={`/api/installments/${installment.id}/receipt`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline text-sm"
                      >
                        Ver
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <Link href="/installments" className="btn-primary">
          Gerenciar Parcelas
        </Link>
      </div>
    </div>
  );
}

