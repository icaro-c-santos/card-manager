"use client";

import { useState, useEffect } from "react";
import { deletePersonAction } from "@/domains/people/actions";

interface DeletePersonButtonProps {
  id: string;
  name: string;
}

export default function DeletePersonButton({ id, name }: DeletePersonButtonProps) {
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
    const result = await deletePersonAction(id);
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
        className="p-2 text-red-600 hover:bg-red-50 active:bg-red-100 rounded-lg transition-colors"
        title="Excluir"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl p-4 lg:p-6 w-full sm:max-w-md sm:mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Excluir pessoa
            </h3>
            <p className="text-gray-600 mb-4">
              Tem certeza que deseja excluir <strong>{name}</strong>? Esta ação
              também excluirá todas as compras e parcelas desta pessoa.
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
