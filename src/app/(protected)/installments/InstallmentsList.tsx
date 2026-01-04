"use client";

import { useState } from "react";
import type { Installment, Purchase, Person } from "@prisma/client";
import PaymentModal from "./PaymentModal";

type InstallmentWithPurchase = Installment & {
  purchase: Purchase & { person: Person };
};

interface InstallmentsListProps {
  installments: InstallmentWithPurchase[];
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

export default function InstallmentsList({ installments }: InstallmentsListProps) {
  const [selectedInstallment, setSelectedInstallment] =
    useState<InstallmentWithPurchase | null>(null);

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
      <div className="space-y-6">
        {Object.values(byPerson).map(({ person, installments: personInstallments }) => {
          const personTotal = personInstallments.reduce(
            (sum, i) => sum + Number(i.amount),
            0
          );
          const personPaid = personInstallments
            .filter((i) => i.status === "PAID")
            .reduce((sum, i) => sum + Number(i.amount), 0);

          return (
            <div key={person.id} className="card">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {person.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {personInstallments.length} parcela
                    {personInstallments.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(personTotal)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(personPaid)} pago
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {personInstallments.map((installment) => (
                  <div
                    key={installment.id}
                    className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {installment.purchase.description || "Compra sem descrição"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Parcela {installment.installmentNumber}/
                        {installment.purchase.installmentsCount} •{" "}
                        {formatDate(installment.purchase.purchaseDate)}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(Number(installment.amount))}
                        </p>
                        {installment.status === "PAID" ? (
                          <span className="badge-paid">Paga</span>
                        ) : (
                          <span className="badge-pending">Pendente</span>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedInstallment(installment)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          installment.status === "PAID"
                            ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            : "bg-emerald-600 text-white hover:bg-emerald-700"
                        }`}
                      >
                        {installment.status === "PAID" ? "Ver" : "Pagar"}
                      </button>
                    </div>
                  </div>
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
    </>
  );
}

