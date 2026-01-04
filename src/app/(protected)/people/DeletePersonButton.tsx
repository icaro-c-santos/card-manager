"use client";

import { useState } from "react";
import { deletePersonAction } from "@/domains/people/actions";

interface DeletePersonButtonProps {
  id: string;
  name: string;
}

export default function DeletePersonButton({ id, name }: DeletePersonButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

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
        onClick={() => setShowConfirm(true)}
        className="text-red-600 hover:text-red-700 text-sm font-medium"
      >
        Excluir
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Excluir pessoa
            </h3>
            <p className="text-gray-600 mb-4">
              Tem certeza que deseja excluir <strong>{name}</strong>? Esta ação
              também excluirá todas as compras e parcelas desta pessoa.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="btn-danger"
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

