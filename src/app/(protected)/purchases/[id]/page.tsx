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
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/purchases"
          className="p-2 -ml-2 text-gray-500 hover:text-gray-700 active:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
          Detalhes da Compra
        </h2>
      </div>

      {/* Purchase Info */}
      <div className="card p-4 lg:p-6">
        <div className="grid grid-cols-2 gap-4 lg:gap-6">
          <div>
            <p className="text-xs lg:text-sm text-gray-500">Pessoa</p>
            <p className="font-medium text-sm lg:text-base">{purchase.person.name}</p>
          </div>
          <div>
            <p className="text-xs lg:text-sm text-gray-500">Data da Compra</p>
            <p className="font-medium text-sm lg:text-base">{formatDate(purchase.purchaseDate)}</p>
          </div>
          <div>
            <p className="text-xs lg:text-sm text-gray-500">Valor Total</p>
            <p className="font-medium text-sm lg:text-base">{formatCurrency(Number(purchase.totalAmount))}</p>
          </div>
          <div>
            <p className="text-xs lg:text-sm text-gray-500">Parcelas Pagas</p>
            <p className="font-medium text-sm lg:text-base">{paidCount}/{purchase.installmentsCount}</p>
          </div>
        </div>
        {purchase.description && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs lg:text-sm text-gray-500">Descrição</p>
            <p className="font-medium text-sm lg:text-base">{purchase.description}</p>
          </div>
        )}
      </div>

      {/* Installments - Mobile Cards */}
      <div className="card p-4 lg:p-6">
        <h3 className="font-semibold text-gray-900 mb-3 lg:mb-4">Parcelas</h3>
        <div className="space-y-2">
          {purchase.installments.map((installment) => (
            <div
              key={installment.id}
              className="p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900">
                    Parcela {installment.installmentNumber}/{purchase.installmentsCount}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {getMonthName(installment.invoiceMonth)} {installment.invoiceYear}
                    {installment.paidAt && ` • Pago em ${formatDate(installment.paidAt)}`}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <p className="font-semibold text-sm text-gray-900">
                    {formatCurrency(Number(installment.amount))}
                  </p>
                  <span className={`text-xs ${installment.status === "PAID" ? "badge-paid" : "badge-pending"}`}>
                    {installment.status === "PAID" ? "Pago" : "Pendente"}
                  </span>
                </div>
              </div>
              {installment.paymentReceipt && (
                <div className="mt-2 pt-2 border-t border-gray-200 flex items-center gap-3">
                  <a
                    href={`/api/installments/${installment.id}/receipt`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 active:text-primary-800 text-xs font-medium"
                  >
                    Ver comprovante →
                  </a>
                  <a
                    href={`/api/installments/${installment.id}/receipt?download=true`}
                    download
                    className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-700 active:text-gray-800 text-xs font-medium"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Baixar
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
        <Link href="/installments" className="btn-primary w-full sm:w-auto py-3 sm:py-2 text-center">
          Gerenciar Parcelas
        </Link>
      </div>
    </div>
  );
}
