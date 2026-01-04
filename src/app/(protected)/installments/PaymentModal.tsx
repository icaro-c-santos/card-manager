"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Installment, Purchase, Person } from "@prisma/client";
import { payInstallmentAction, unpayInstallmentAction } from "@/domains/installments/actions";
import { getMonthName } from "@/lib/credit-card";

type InstallmentWithPurchase = Installment & {
  purchase: Purchase & { person: Person };
};

interface PaymentModalProps {
  installment: InstallmentWithPurchase;
  onClose: () => void;
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

export default function PaymentModal({ installment, onClose }: PaymentModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPaid = installment.status === "PAID";

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Apenas imagens são permitidas");
      return;
    }

    // Validate file size (max 5MB)
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

  async function handlePay() {
    setLoading(true);
    setError(null);

    const result = await payInstallmentAction(installment.id, receiptPreview || undefined);

    if (result.success) {
      router.refresh();
      onClose();
    } else {
      setError(result.error || "Erro ao processar pagamento");
      setLoading(false);
    }
  }

  async function handleUnpay() {
    setLoading(true);
    setError(null);

    const result = await unpayInstallmentAction(installment.id);

    if (result.success) {
      router.refresh();
      onClose();
    } else {
      setError(result.error || "Erro ao desfazer pagamento");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isPaid ? "Detalhes do Pagamento" : "Registrar Pagamento"}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {installment.purchase.person.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
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

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Purchase Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">
              {installment.purchase.description || "Compra sem descrição"}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Parcela:</span>{" "}
                <span className="font-medium">
                  {installment.installmentNumber}/{installment.purchase.installmentsCount}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Valor:</span>{" "}
                <span className="font-medium">
                  {formatCurrency(Number(installment.amount))}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Fatura:</span>{" "}
                <span className="font-medium">
                  {getMonthName(installment.invoiceMonth)}/{installment.invoiceYear}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Compra:</span>{" "}
                <span className="font-medium">
                  {formatDate(installment.purchase.purchaseDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          {isPaid && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-emerald-700 mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-medium">Parcela Paga</span>
              </div>
              {installment.paidAt && (
                <p className="text-sm text-emerald-600">
                  Pago em {formatDate(installment.paidAt)}
                </p>
              )}
            </div>
          )}

          {/* Receipt Upload (for unpaid) */}
          {!isPaid && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comprovante (opcional)
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-500 transition-colors"
              >
                {receiptPreview ? (
                  <div className="space-y-2">
                    <img
                      src={receiptPreview}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-lg"
                    />
                    <p className="text-sm text-gray-500">
                      Clique para trocar a imagem
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <svg
                      className="w-12 h-12 mx-auto text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-sm text-gray-600">
                      Clique para adicionar comprovante
                    </p>
                    <p className="text-xs text-gray-400">
                      PNG, JPG, WEBP até 5MB
                    </p>
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
          )}

          {/* Receipt View (for paid) */}
          {isPaid && installment.paymentReceipt && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comprovante
              </label>
              <img
                src={`/api/installments/${installment.id}/receipt`}
                alt="Comprovante"
                className="max-h-64 rounded-lg border border-gray-200"
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} disabled={loading} className="btn-secondary">
            {isPaid ? "Fechar" : "Cancelar"}
          </button>

          {isPaid ? (
            <button onClick={handleUnpay} disabled={loading} className="btn-danger">
              {loading ? "Processando..." : "Desfazer Pagamento"}
            </button>
          ) : (
            <button onClick={handlePay} disabled={loading} className="btn-success">
              {loading ? "Processando..." : "Confirmar Pagamento"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

