"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Person } from "@prisma/client";
import { createPurchaseAction } from "@/domains/purchases/actions";
import { generateInstallments, getMonthName } from "@/lib/credit-card";

interface NewPurchaseFormProps {
  people: Person[];
}

export default function NewPurchaseForm({ people }: NewPurchaseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state for preview
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [totalAmount, setTotalAmount] = useState("");
  const [installmentsCount, setInstallmentsCount] = useState("1");

  // Calculate installment preview
  const amount = parseFloat(totalAmount.replace(",", ".")) || 0;
  const count = parseInt(installmentsCount, 10) || 1;
  const preview =
    amount > 0 && count > 0
      ? generateInstallments(new Date(purchaseDate), amount, count)
      : [];

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await createPurchaseAction(formData);

    if (result.success) {
      router.push("/purchases");
      router.refresh();
    } else {
      setError(result.error || "Erro ao criar compra");
      setLoading(false);
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="personId"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Pessoa *
          </label>
          <select
            id="personId"
            name="personId"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Selecione...</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="purchaseDate"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Data da Compra *
          </label>
          <input
            type="date"
            id="purchaseDate"
            name="purchaseDate"
            required
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Descrição (opcional)
          </label>
          <input
            type="text"
            id="description"
            name="description"
            placeholder="Ex: Compra na loja X"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label
            htmlFor="totalAmount"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Valor Total *
          </label>
          <input
            type="text"
            id="totalAmount"
            name="totalAmount"
            required
            placeholder="0,00"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label
            htmlFor="installmentsCount"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Número de Parcelas *
          </label>
          <select
            id="installmentsCount"
            name="installmentsCount"
            required
            value={installmentsCount}
            onChange={(e) => setInstallmentsCount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {Array.from({ length: 24 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}x
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Installment Preview */}
      {preview.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Prévia das Parcelas
          </h3>
          <div className="space-y-2">
            {preview.map((inst) => (
              <div
                key={inst.installmentNumber}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-gray-600">
                  {inst.installmentNumber}/{preview.length} -{" "}
                  {getMonthName(inst.invoiceMonth)} {inst.invoiceYear}
                </span>
                <span className="font-medium">
                  {formatCurrency(inst.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Salvando..." : "Criar Compra"}
        </button>
      </div>
    </form>
  );
}

