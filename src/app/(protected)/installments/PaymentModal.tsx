"use client";

import { useState, useRef, useEffect } from "react";
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

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-lg sm:mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-gray-200 shrink-0">
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

        {/* Content */}
        <div className="p-4 lg:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Purchase Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3 text-sm lg:text-base">
              {installment.purchase.description || "Compra sem descrição"}
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500 block text-xs">Parcela</span>
                <span className="font-medium">
                  {installment.installmentNumber}/{installment.purchase.installmentsCount}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Valor</span>
                <span className="font-medium">
                  {formatCurrency(Number(installment.amount))}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Fatura</span>
                <span className="font-medium">
                  {getMonthName(installment.invoiceMonth)}/{installment.invoiceYear}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Compra</span>
                <span className="font-medium">
                  {formatDate(installment.purchase.purchaseDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          {isPaid && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-emerald-700 mb-1">
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
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary-500 active:bg-gray-50 transition-colors"
              >
                {receiptPreview ? (
                  <div className="space-y-2">
                    <img
                      src={receiptPreview}
                      alt="Preview"
                      className="max-h-40 mx-auto rounded-lg"
                    />
                    <p className="text-sm text-gray-500">
                      Toque para trocar a imagem
                    </p>
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
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-sm text-gray-600">
                      Toque para adicionar comprovante
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
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {/* Receipt View (for paid) */}
          {isPaid && installment.paymentReceipt && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Comprovante
                </label>
                <a
                  href={`/api/installments/${installment.id}/receipt?download=true`}
                  download
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 active:text-primary-800"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Baixar
                </a>
              </div>
              <img
                src={`/api/installments/${installment.id}/receipt`}
                alt="Comprovante"
                className="w-full max-h-64 object-contain rounded-lg border border-gray-200"
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
        <div className="p-4 lg:p-6 border-t border-gray-200 shrink-0 safe-area-pb">
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="btn-secondary w-full sm:w-auto py-3 sm:py-2"
            >
              {isPaid ? "Fechar" : "Cancelar"}
            </button>

            {isPaid ? (
              <button
                onClick={handleUnpay}
                disabled={loading}
                className="btn-danger w-full sm:w-auto py-3 sm:py-2"
              >
                {loading ? "Processando..." : "Desfazer Pagamento"}
              </button>
            ) : (
              <button
                onClick={handlePay}
                disabled={loading}
                className="btn-success w-full sm:w-auto py-3 sm:py-2"
              >
                {loading ? "Processando..." : "Confirmar Pagamento"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
