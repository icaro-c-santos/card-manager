"use client";

import { useEffect, useRef, useState } from "react";
import type { Installment, Purchase, Person } from "@prisma/client";
import PaymentModal from "./PaymentModal";
import { payInstallmentsByPeriodAction } from "@/domains/installments/actions";
import { useRouter } from "next/navigation";

type InstallmentWithPurchase = Installment & {
  purchase: Purchase & { person: Person };
};

interface InstallmentsListProps {
  installments: InstallmentWithPurchase[];
  invoiceMonth: number;
  invoiceYear: number;
}

interface BulkPaymentContext {
  person: Person;
  pendingCount: number;
  pendingAmount: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("pt-BR");
}

function BulkPaymentModal({
  context,
  month,
  year,
  onClose,
}: {
  context: BulkPaymentContext;
  month: number;
  year: number;
  onClose: () => void;
}) {
  const router = useRouter();
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Apenas imagens são permitidas");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Imagem muito grande. Máximo 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setReceiptPreview(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  }

  async function handleConfirm() {
    setLoading(true);
    setError(null);

    const result = await payInstallmentsByPeriodAction(
      context.person.id,
      month,
      year,
      receiptPreview || undefined
    );

    if (result.success) {
      router.refresh();
      onClose();
    } else {
      setError(result.error || "Erro ao processar pagamento");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-lg sm:mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 lg:p-6 border-b border-gray-200 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Baixar fatura do mês</h3>
              <p className="text-sm text-gray-500 mt-1">
                {context.person.name} • {context.pendingCount} parcela
                {context.pendingCount !== 1 ? "s" : ""} pendente
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-gray-400 hover:text-gray-600 active:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4 lg:p-6 space-y-4 overflow-y-auto flex-1">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Total a baixar</p>
            <p className="text-2xl font-semibold text-gray-900">
              {formatCurrency(context.pendingAmount)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Todas as parcelas deste mês serão marcadas como pagas e, se houver, usarão o
              mesmo comprovante.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comprovante único (opcional)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary-500 active:bg-gray-50 transition-colors"
            >
              {receiptPreview ? (
                <div className="space-y-2">
                  <img
                    src={receiptPreview}
                    alt="Preview"
                    className="max-h-40 mx-auto rounded-lg"
                  />
                  <p className="text-sm text-gray-500">Toque para trocar a imagem</p>
                </div>
              ) : (
                <div className="space-y-2 py-2">
                  <svg
                    className="w-10 h-10 mx-auto text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 00-2 2z"
                    />
                  </svg>
                  <p className="text-sm text-gray-600">Toque para adicionar comprovante</p>
                  <p className="text-xs text-gray-400">PNG, JPG, WEBP até 5MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        <div className="p-4 lg:p-6 border-t border-gray-200 shrink-0 safe-area-pb">
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="btn-secondary w-full sm:w-auto py-3 sm:py-2"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="btn-success w-full sm:w-auto py-3 sm:py-2"
            >
              {loading ? "Processando..." : "Confirmar baixa"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InstallmentsList({
  installments,
  invoiceMonth,
  invoiceYear,
}: InstallmentsListProps) {
  const [selectedInstallment, setSelectedInstallment] =
    useState<InstallmentWithPurchase | null>(null);
  const [bulkContext, setBulkContext] = useState<BulkPaymentContext | null>(null);

  if (installments.length === 0) {
    return (
      <div className="card text-center py-12">
        <svg
          className="w-16 h-16 mx-auto text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhuma parcela neste período
        </h3>
        <p className="text-gray-500">
          Não há parcelas programadas para esta fatura.
        </p>
      </div>
    );
  }

  // Group by person
  const byPerson = installments.reduce((acc, installment) => {
    const personId = installment.purchase.personId;
    if (!acc[personId]) {
      acc[personId] = {
        person: installment.purchase.person,
        installments: [],
      };
    }
    acc[personId].installments.push(installment);
    return acc;
  }, {} as Record<string, { person: Person; installments: InstallmentWithPurchase[] }>);

  return (
    <>
      <div className="space-y-4">
        {Object.values(byPerson).map(({ person, installments: personInstallments }) => {
          const personTotal = personInstallments.reduce(
            (sum, i) => sum + Number(i.amount),
            0
          );
          const personPaid = personInstallments
            .filter((i) => i.status === "PAID")
            .reduce((sum, i) => sum + Number(i.amount), 0);
          const pendingInstallments = personInstallments.filter((i) => i.status !== "PAID");
          const pendingAmount = pendingInstallments.reduce(
            (sum, i) => sum + Number(i.amount),
            0
          );

          return (
            <div key={person.id} className="card p-4 lg:p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                <div>
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900">
                    {person.name}
                  </h3>
                  <p className="text-xs lg:text-sm text-gray-500">
                    {personInstallments.length} parcela
                    {personInstallments.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-base lg:text-lg font-semibold text-gray-900">
                    {formatCurrency(personTotal)}
                  </p>
                  <p className="text-xs lg:text-sm text-gray-500">
                    {formatCurrency(personPaid)} pago
                  </p>
                </div>
              </div>

              <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-sm text-gray-600">
                  Pendentes neste mês: {pendingInstallments.length} •{" "}
                  {formatCurrency(pendingAmount)}
                </p>
                <button
                  className="btn-success w-full sm:w-auto py-2 text-sm"
                  disabled={pendingInstallments.length === 0}
                  onClick={() =>
                    setBulkContext({
                      person,
                      pendingCount: pendingInstallments.length,
                      pendingAmount,
                    })
                  }
                >
                  Baixar mês
                </button>
              </div>

              <div className="space-y-2">
                {personInstallments.map((installment) => (
                  <button
                    key={installment.id}
                    onClick={() => setSelectedInstallment(installment)}
                    className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm lg:text-base truncate">
                          {installment.purchase.description || "Compra sem descrição"}
                        </p>
                        <p className="text-xs lg:text-sm text-gray-500 mt-0.5">
                          Parcela {installment.installmentNumber}/
                          {installment.purchase.installmentsCount} •{" "}
                          {formatDate(installment.purchase.purchaseDate)}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <p className="font-semibold text-gray-900 text-sm lg:text-base">
                          {formatCurrency(Number(installment.amount))}
                        </p>
                        {installment.status === "PAID" ? (
                          <span className="badge-paid text-xs">Paga</span>
                        ) : (
                          <span className="badge-pending text-xs">Pendente</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedInstallment && (
        <PaymentModal
          installment={selectedInstallment}
          onClose={() => setSelectedInstallment(null)}
        />
      )}

      {bulkContext && (
        <BulkPaymentModal
          context={bulkContext}
          month={invoiceMonth}
          year={invoiceYear}
          onClose={() => setBulkContext(null)}
        />
      )}
    </>
  );
}
