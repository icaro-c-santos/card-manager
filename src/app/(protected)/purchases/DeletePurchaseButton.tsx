"use client";

import { useState, useEffect } from "react";
import { deletePurchaseAction } from "@/domains/purchases/actions";

interface DeletePurchaseButtonProps {
  id: string;
  description: string;
}

export default function DeletePurchaseButton({
  id,
  description,
}: DeletePurchaseButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showConfirm) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showConfirm]);

  async function handleDelete() {
    setLoading(true);
    const result = await deletePurchaseAction(id);
    if (!result.success) {
      alert(result.error);
    }
    setLoading(false);
    setShowConfirm(false);
  }

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowConfirm(true);
        }}
        className="text-xs text-red-600 hover:text-red-700 active:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-50 active:bg-red-100 transition-colors"
      >
        Excluir
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl p-4 lg:p-6 w-full sm:max-w-md sm:mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Excluir compra
            </h3>
            <p className="text-gray-600 mb-4">
              Tem certeza que deseja excluir <strong>{description}</strong>? Esta
              ação também excluirá todas as parcelas associadas.
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="btn-secondary w-full sm:w-auto py-3 sm:py-2"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="btn-danger w-full sm:w-auto py-3 sm:py-2"
              >
                {loading ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
