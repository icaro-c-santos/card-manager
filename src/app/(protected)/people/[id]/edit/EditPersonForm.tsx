"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updatePersonAction } from "@/domains/people/actions";
import type { Person } from "@prisma/client";

interface EditPersonFormProps {
  person: Person;
}

export default function EditPersonForm({ person }: EditPersonFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await updatePersonAction(person.id, formData);

    if (result.success) {
      router.push("/people");
    } else {
      setError(result.error || "Erro ao atualizar pessoa");
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mb-4">
        <Link
          href="/people"
          className="text-sm text-gray-500 hover:text-gray-700 active:text-gray-900 inline-flex items-center"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Voltar
        </Link>
      </div>

      <div className="card p-4 lg:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-6">Editar Pessoa</h2>

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Nome
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              autoFocus
              defaultValue={person.name}
              placeholder="Digite o nome da pessoa"
              className="w-full px-3 py-3 lg:py-2"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-2">
            <Link href="/people" className="btn-secondary w-full sm:w-auto py-3 sm:py-2 text-center">
              Cancelar
            </Link>
            <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto py-3 sm:py-2">
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
